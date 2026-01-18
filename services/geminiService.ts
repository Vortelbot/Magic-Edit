
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

export class GeminiService {
  private static instance: GeminiService;

  public static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  public async processImage(
    prompt: string,
    base64Image: string,
    maskBase64?: string
  ): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const systemInstruction = `You are a professional image editor.
When a mask is provided (a black and white image), you must focus your edits EXCLUSIVELY on the area indicated by white pixels.
Keep everything else in the image exactly as it is.
If no mask is provided, apply the edit to the relevant parts of the whole image.
Your goal is to satisfy the user's prompt: "${prompt}".
Maintain the style, resolution, and realism of the original image.`;

    const parts: any[] = [];
    
    // Original Image
    const cleanImage = base64Image.split(',')[1] || base64Image;
    parts.push({
      inlineData: {
        data: cleanImage,
        mimeType: "image/png"
      }
    });

    // Mask Image (if provided)
    if (maskBase64) {
      const cleanMask = maskBase64.split(',')[1] || maskBase64;
      parts.push({
        inlineData: {
          data: cleanMask,
          mimeType: "image/png"
        }
      });
      parts.push({ text: `Focus the change specifically on the area marked in the provided mask image. The user instruction is: ${prompt}` });
    } else {
      parts.push({ text: prompt });
    }

    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts },
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      const candidate = response.candidates?.[0];
      if (candidate?.content?.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
      }
      throw new Error("AI did not return an image. It might have reached a safety limit or responded with text.");
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      throw new Error(error.message || "Failed to process image.");
    }
  }
}
