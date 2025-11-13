
import { GoogleGenAI } from "@google/genai";

// Helper function to convert File to a base64 string and format for the API
async function fileToGenerativePart(file: File): Promise<{ inlineData: { mimeType: string; data: string } }> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // Format is "data:mime/type;base64,..."
            const parts = result.split(';base64,');
            const mimeType = parts[0].split(':')[1];
            if (!mimeType || !parts[1]) {
                return reject(new Error("Could not parse file data."));
            }
            const data = parts[1];
            resolve({
                inlineData: {
                    mimeType,
                    data,
                },
            });
        };
        reader.onerror = (error) => reject(error);
    });
}

export async function generateTranscript(mediaFile: File): Promise<string> {
  const API_KEY = process.env.API_KEY;
  if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  // Use a model that supports audio/video input
  const model = 'gemini-2.5-pro'; 

  // Add a client-side file size check to prevent large uploads.
  // The API has its own limits, but this provides faster feedback.
  const MAX_FILE_SIZE_MB = 20;
  if (mediaFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    throw new Error(`File is too large. Please upload a file smaller than ${MAX_FILE_SIZE_MB}MB.`);
  }

  const audioVideoPart = await fileToGenerativePart(mediaFile);

  const prompt = `You are an expert transcriber. Your task is to transcribe the provided audio/video file. 
    1. Identify each distinct speaker.
    2. Label them sequentially as "Speaker A", "Speaker B", "Speaker C", etc.
    3. Format the output with each speaker's dialogue on a new line, prefixed by their label.
    4. Provide the full, accurate transcript of the conversation.
    Example:
    Speaker A: Welcome to the podcast.
    Speaker B: Thanks for having me.`;
  
  try {
    const response = await ai.models.generateContent({
        model: model,
        contents: { parts: [ { text: prompt }, audioVideoPart ] },
    });
    return response.text;
  } catch (error) {
    console.error("Error generating transcript:", error);
    if (error instanceof Error) {
        // Provide more specific error messages to the user
        if (error.message.includes('unsupported content')) {
            throw new Error("Unsupported file type. Please use common audio or video formats like MP3, WAV, MP4, or MOV.");
        }
         if (error.message.includes('400')) { // Bad request often means unsupported format or too large
             throw new Error("Bad request. The file format might be unsupported or the file is too large.");
        }
    }
    throw new Error("Failed to communicate with the AI model.");
  }
}
