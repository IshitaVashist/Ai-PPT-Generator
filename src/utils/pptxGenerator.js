import PptxGenJS from 'pptxgenjs';

const templateStyles = {
    Professional: {
        fontFace: 'Arial',
        color: '212121', // Near black text
        titleColor: '0D47A1', // Dark Blue
        bulletColor: '1976D2', // Medium Blue
        bgColor: 'FFFFFF', // White slide background
        masterBgColor: 'E3F2FD' // Very Light Blue for accents
    },
    Academic: {
        fontFace: 'Times New Roman',
        color: '383838', // Dark gray text
        titleColor: '1B5E20', // Dark Green
        bulletColor: '388E3C', // Medium Green
        bgColor: 'FFFFFF', // White slide background
        masterBgColor: 'E8F5E9' // Very Light Green for accents
    },
    Creative: {
        fontFace: 'Arial', // Changed from Orbitron for compatibility
        color: 'DDDDDD', // Light gray/white text
        titleColor: 'FF00FF', // Neon Magenta
        bulletColor: '00FFFF', // Neon Cyan
        bgColor: '1A1A1A', // Dark background
        masterBgColor: '333333' // Dark Gray for accents
    }
};

/**
 * 
 * @param {Object} presentationData - The structured presentation data from Gemini
 * @param {string} template - The template style (Professional, Academic, Creative)
 */
export async function generateAndDownloadPPT(presentationData, template = 'Professional') {
    try {
        console.log('Starting PPT generation...', presentationData);
        
        const pptx = new PptxGenJS();
        const style = templateStyles[template] || templateStyles.Professional;

        // presentation props.
        pptx.author = 'AI PPT Generator';
        pptx.company = 'Gemini AI';
        pptx.subject = presentationData.presentationTitle || 'AI Generated Presentation';
        pptx.title = presentationData.presentationTitle || 'Presentation';
        pptx.layout = 'LAYOUT_16x9';

        console.log('Creating slides...');

        presentationData.slides.forEach((slide, index) => {
            console.log(`Creating slide ${index + 1}:`, slide);
            
            const slidePptx = pptx.addSlide();
            
            // Set background
            slidePptx.background = { color: style.bgColor };

            // Add accent bar at top
            slidePptx.addShape(pptx.shapes.RECTANGLE, {
                x: 0, y: 0, w: '100%', h: 0.75,
                fill: { color: style.masterBgColor }
            });

            // Add title
            slidePptx.addText(slide.title || 'Untitled Slide', {
                x: 0.5, y: 0.15, w: 9, h: 0.5,
                fontSize: 28,
                color: style.titleColor,
                fontFace: style.fontFace,
                bold: true
            });

            // Determine layout and add content
            if (slide.leftContent && slide.rightContent) {
                // Two-column layout
                slidePptx.addText(slide.leftContent, {
                    x: 0.5, y: 1.2, w: 4.5, h: 5.5,
                    fontSize: 18,
                    color: style.color,
                    fontFace: style.fontFace,
                    valign: 'top'
                });
                
                slidePptx.addText(slide.rightContent, {
                    x: 5.5, y: 1.2, w: 4.5, h: 5.5,
                    fontSize: 18,
                    color: style.color,
                    fontFace: style.fontFace,
                    valign: 'top'
                });
            } else if (slide.bullets && slide.bullets.length > 0) {
                // Bullets layout
                const bulletText = slide.bullets.map(bullet => {
                    return { text: bullet, options: { bullet: true, color: style.color } };
                });
                
                slidePptx.addText(bulletText, {
                    x: 0.5, y: 1.2, w: 9, h: 5.5,
                    fontSize: 20,
                    color: style.color,
                    fontFace: style.fontFace,
                    bullet: { type: 'number', color: style.bulletColor }
                });
            } else if (slide.content) {
                // Content layout
                slidePptx.addText(slide.content, {
                    x: 0.5, y: 1.2, w: 9, h: 5.5,
                    fontSize: 18,
                    color: style.color,
                    fontFace: style.fontFace,
                    valign: 'top'
                });
            }

            // Add footer bar
            slidePptx.addShape(pptx.shapes.RECTANGLE, {
                x: 0, y: 7, w: '100%', h: 0.5,
                fill: { color: style.masterBgColor }
            });

            // Add slide number
            slidePptx.addText(`${index + 1} / ${presentationData.slides.length}`, {
                x: 9.3, y: 7.1, w: 0.5, h: 0.3,
                fontSize: 12,
                color: style.titleColor,
                fontFace: style.fontFace,
                align: 'right'
            });
        });

        // --- Save the Presentation ---
        const filename = `${(presentationData.presentationTitle || 'Presentation').replace(/\s/g, '_')}_${template}.pptx`;
        console.log('Saving file:', filename);
        
        await pptx.writeFile({ fileName: filename });
        
        console.log('PPT generated successfully!');
        return { success: true, filename };

    } catch (error) {
        console.error('Error generating PPT:', error);
        throw new Error(`Failed to generate PowerPoint presentation: ${error.message}`);
    }
}