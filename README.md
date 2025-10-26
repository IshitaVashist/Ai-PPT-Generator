<<<<<<< HEAD
# AI Presentation Generator

The AI Presentation Generator is a powerful, single-page application that leverages the power of the Google Gemini API to instantly transform a simple text prompt into a structured, editable, and downloadable PowerPoint presentation (PPTX).

It offers real-time editing and refinement of generated slides, along with multiple theme and template options to suit various needs (Professional, Academic, Creative).

# Features

Instant Slide Generation: Generate a complete presentation structure (title slide, content slides with titles, main content, and bullet points) from a single prompt using the Gemini API.

Contextual Editing & Chat: Refine your slides or add/change content using a conversational chat interface on the results page, directly applying AI-driven edits.

Theming & Customization: Switch between multiple UI themes (Light, Dark, Neon) for a personalized workspace experience.

Template Selection: Choose from pre-defined presentation styles (Professional, Academic, Creative) before generation, which influences both the AI content structure and the final PPTX export style.

PPTX Export: Download the final presentation as a standard .pptx file, leveraging pptxgenjs to ensure compatibility and template-specific styling.

# File Input Support: Attach .txt files to supplement your text prompt for richer context.

**Tech Stack**

This project is built using modern web technologies and APIs:

Frontend Framework: React (with functional components and Hooks)

Styling: Inline CSS (using JavaScript objects) and modern Flex/Grid layouts for responsive design.

AI Backend: Google Gemini API (for content generation and conversational editing).

PPTX Generation: pptxgenjs (for creating and exporting the PowerPoint file).

Icons: Lucide React.

State Management: React's built-in useState and useEffect.

**Installation and Setup**

# Prerequisites:

Node.js (LTS version recommended)

A Gemini API Key (Required for content generation)

# Steps

Clone the Repository (If applicable):

git clone [your-repo-url]
cd ai-presentation-generator


**Install Dependencies:**

npm install
# or
yarn install


Configure API Key:
Create a file named .env in the root directory of the project and add your Gemini API key:

VITE_GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"


Note: The application uses the API Key imported as an environment variable in gemini.js.

Run the Application:
Start the local development server:

npm run dev
# or
yarn dev


The application should now be running, typically at http://localhost:5173.

**Usage**

# Home Page (/):

Enter your presentation topic or instructions in the main input box.

(Optional) Use the Dice icon to get a random topic idea.

(Optional) Use the Paperclip icon to upload a .txt file for additional context.

Select your desired Template (Professional, Academic, Creative).

Select the estimated Length (e.g., 8-12 Slides).

Click "Generate".

# Results Page:

View your generated slides in Grid or Single Slide mode.

Use the Chatbox on the right to make edits (e.g., "Expand on the content for slide 3," or "Add a new slide about X").

Edit content directly using the Edit icon on a single slide view.

Click the Download icon to export the final presentation as a PPTX file.

# Assumptions:

The UI can be changed only the core logic should remain same

Extra features can be added

Exact template match is not necessary
=======
# Ai-PPT-Generator
>>>>>>> 85fc893f5cfcb91d4f77db06a821920148bc397c
