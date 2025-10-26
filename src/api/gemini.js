import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error("VITE_GEMINI_API_KEY is not set. Check your .env file and restart Vite.");
  throw new Error("Missing Gemini API Key. Please check your .env file.");
}

const genAI = new GoogleGenerativeAI(apiKey);

const pptSchema = {
  type: "object",
  properties: {
    presentationTitle: {
      type: "string",
      description: "The main title of the presentation"
    },
    slides: {
      type: "array",
      description: "Array of slide objects",
      items: {
        type: "object",
        properties: {
          slideNumber: {
            type: "integer",
            description: "The slide number (1-indexed)"
          },
          title: {
            type: "string",
            description: "The title of the slide"
          },
          content: {
            type: "string",
            description: "Main content text for the slide"
          },
          bullets: {
            type: "array",
            description: "Bullet points for the slide",
            items: {
              type: "string"
            }
          },
          layout: {
            type: "string",
            enum: ["title", "content", "two-column", "bullets"],
            description: "Layout type for the slide"
          },
          leftContent: {
            type: "string",
            description: "Content for left column (if two-column layout)"
          },
          rightContent: {
            type: "string",
            description: "Content for right column (if two-column layout)"
          }
        },
        required: ["slideNumber", "title"]
      }
    }
  },
  required: ["presentationTitle", "slides"]
};

export async function generatePresentationContent(prompt, slideLength = '8-12', template = 'Professional') {
  const model = 'gemini-2.0-flash-exp';

  const slideLengthStr = String(slideLength);
  const [minSlides, maxSlides] = slideLengthStr.includes('-') 
    ? slideLengthStr.split('-').map(num => parseInt(num.trim()) || 10)
    : [8, 12];

  const templateInstructions = {
    Professional: "Create a professional business presentation with clear, concise content. Use formal language and focus on key points.",
    Academic: "Create an academic-style presentation with detailed explanations, research-oriented content, and scholarly tone.",
    Creative: "Create a creative and engaging presentation with storytelling elements, vivid descriptions, and innovative ideas."
  };

  const systemInstruction = `You are an expert presentation designer. Create a structured presentation based on the user's topic.

Template Style: ${template}
${templateInstructions[template] || templateInstructions.Professional}

CRITICAL: You must return ONLY valid JSON in the exact format specified. No additional text, explanations, or markdown formatting.

Requirements:
- Generate between ${minSlides} to ${maxSlides} slides
- First slide should be a title slide
- Each slide should have a clear title
- Include relevant content and bullet points where appropriate
- Make content engaging and informative
- Ensure logical flow between slides
- Last slide should be a conclusion or summary

Return ONLY the JSON object with presentationTitle and slides array.`;

  try {
    const generativeModel = genAI.getGenerativeModel({
      model: model,
      systemInstruction: systemInstruction,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
        responseSchema: pptSchema,
      },
    });

    const result = await generativeModel.generateContent(prompt);
    const response = result.response;


    let text;
    if (typeof response.text === 'function') {
      text = response.text();
    } else if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
      text = response.candidates[0].content.parts[0].text;
    } else {
      throw new Error("Unable to extract text from API response");
    }

    console.log('Raw API response:', text);

    let cleanedText = text.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const jsonContent = JSON.parse(cleanedText);

    if (!jsonContent.slides || jsonContent.slides.length === 0) {
      throw new Error("No slides generated in the response");
    }

    console.log('Generated presentation:', jsonContent);
    return jsonContent;

  } catch (error) {
    console.error('Gemini API Error:', error);
    console.error('Full error details:', error.message);
    throw new Error(`Failed to generate presentation content: ${error.message}`);
  }
}

export async function editSlideContent(currentSlides, editPrompt, slideNumber = null) {
  const model = 'gemini-2.0-flash-exp';

  const systemInstruction = `You are an expert presentation editor. The user has an existing presentation and wants to make changes.

Current presentation has ${currentSlides.length} slides.

Instructions:
- Understand the user's edit request
- Modify only the relevant slides
- Maintain the overall structure and flow
- Keep the same format and style
- Return the complete updated presentation in JSON format

If the user specifies a slide number, focus on editing that slide. Otherwise, determine which slides need changes based on the request.`;

  const currentPresentationText = JSON.stringify({
    slides: currentSlides
  }, null, 2);

  try {
    const generativeModel = genAI.getGenerativeModel({
      model: model,
      systemInstruction: systemInstruction,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            slides: pptSchema.properties.slides,
            changedSlides: {
              type: "array",
              description: "Array of slide numbers that were changed",
              items: { type: "integer" }
            },
            summary: {
              type: "string",
              description: "Brief summary of changes made"
            }
          },
          required: ["slides"]
        }
      },
    });

    const editRequest = `Current Presentation:\n${currentPresentationText}\n\nEdit Request: ${editPrompt}${slideNumber ? `\n\nFocus on Slide ${slideNumber}` : ''}`;

    const result = await generativeModel.generateContent(editRequest);
    const response = result.response;

    let text;
    if (typeof response.text === 'function') {
      text = response.text();
    } else if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
      text = response.candidates[0].content.parts[0].text;
    } else {
      throw new Error("Unable to extract text from API response");
    }

    // Clean markdown if present
    let cleanedText = text.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const jsonContent = JSON.parse(cleanedText);

    console.log('Edited presentation:', jsonContent);
    return jsonContent;

  } catch (error) {
    console.error('Gemini API Error during edit:', error);
    throw new Error(`Failed to edit presentation: ${error.message}`);
  }
}