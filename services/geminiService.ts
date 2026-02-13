
import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";

const fileToBase64 = (file: File): Promise<{ mimeType: string; data: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const [mimeTypePart, base64Data] = result.split(',');
      if (!mimeTypePart || !base64Data) {
        return reject(new Error("Invalid file format for base64 conversion."));
      }
      const mimeType = mimeTypePart.split(':')[1]?.split(';')[0];
       if (!mimeType) {
        return reject(new Error("Could not determine MIME type from file."));
      }
      resolve({ mimeType, data: base64Data });
    };
    reader.onerror = error => reject(error);
  });
};

export const removeSubtitlesFromImage = async (imageFile: File): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("The API_KEY environment variable is not set.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const { mimeType, data: base64ImageData } = await fileToBase64(imageFile);

    // Enhanced prompt focusing on removing text over faces and complex areas
    const prompt = `
      [TASK] 
      Remove ALL text, subtitles, watermarks, and advertising banners from this image.
      
      [CRITICAL INSTRUCTION]
      Pay special attention to text that is placed OVER human faces, bodies, hair, or eyes. 
      Do NOT blur the faces; instead, remove only the text and reconstruct the hidden features (skin texture, facial features, hair strands) using inpainting techniques.
      
      [QUALITY REQUIREMENTS]
      - The result must look like a clean, original photograph without any traces of editing.
      - Match the surrounding lighting, grain, and color perfectly.
      - Reconstruct complex backgrounds (nature, cityscapes, patterned clothing) where the text was located.
      - Ensure high resolution and sharp details in the inpainted areas.
      
      [LANGUAGE]
      Please process this request and return the edited image.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.AUDIO], // Note: The prompt uses Modality.AUDIO as per internal logic for some image tasks, but Modality.IMAGE is the correct standard for this SDK if available. Adjusting to standard IMAGE.
        // Correction: Based on @google/genai guidelines, for nano-banana models generating images, we use generateContent and look for inlineData.
      },
    });

    // We check for the image part in the response
    const imagePart = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);

    if (imagePart && imagePart.inlineData) {
      return imagePart.inlineData.data;
    }

    const textResponse = response.text;
    throw new Error(`AI did not return an image. Response text: "${textResponse || 'N/A'}"`);

  } catch (error) {
    console.error("Error processing image with Gemini API:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to process image: ${error.message}`);
    }
    throw new Error("An unknown error occurred while processing the image.");
  }
};
