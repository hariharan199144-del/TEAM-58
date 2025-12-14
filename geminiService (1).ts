
import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedContent, ProcessingOptions } from "../types";

// Validate API Key
if (!process.env.API_KEY) {
  console.error("API_KEY is missing from environment variables.");
}

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:audio/mp3;base64,")
      if (base64String.includes(',')) {
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      } else {
        resolve(base64String);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const generateLearningMaterial = async (
  audioBlob: Blob, 
  options: ProcessingOptions
): Promise<Omit<GeneratedContent, 'id' | 'date'>> => {
  
  // OPTIMIZATION: Maximize use of Inline Data
  // The API supports up to 20MB payload. We set limit to 18MB to be safe with base64 overhead.
  // This avoids the latency of the File Upload + Polling cycle for medium files.
  const INLINE_SIZE_LIMIT = 18 * 1024 * 1024; 
  let contentPart: any;

  try {
    if (audioBlob.size < INLINE_SIZE_LIMIT) {
        console.log("Processing via Inline Data (Fast Path)");
        const base64Audio = await blobToBase64(audioBlob);
        contentPart = {
            inlineData: {
                mimeType: audioBlob.type || 'audio/webm',
                data: base64Audio
            }
        };
    } else {
        console.log("Processing via File API Upload (Large File)");
        
        // Upload
        const uploadResponse = await ai.files.upload({
            file: audioBlob,
            config: { 
                mimeType: audioBlob.type || 'audio/webm',
                displayName: "Audio Upload"
            }
        });

        console.log("Upload Response Raw:", uploadResponse);

        // Resolve the file object from the response
        // In @google/genai, uploadResponse IS the File object.
        const file = uploadResponse;

        // Sanity check: ensure we have a URI
        if (!file || !file.uri) {
             console.error("Invalid Upload Response Keys:", Object.keys(file || {}));
             throw new Error("UPLOAD_FAILED_STRUCTURE");
        }

        let fileUri = file.uri;
        let state = file.state;
        const name = file.name;

        console.log(`File uploaded: ${fileUri}, State: ${state}, Name: ${name}`);

        // Wait for processing to complete
        // OPTIMIZATION: Poll faster (500ms) to reduce waiting time
        while (state === 'PROCESSING') {
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const updatedFile = await ai.files.get({ name: name });
            
            state = updatedFile.state;
            
            if (state === 'FAILED') {
                 throw new Error("SERVER_PROCESSING_FAILED");
            }
        }

        contentPart = {
            fileData: {
                mimeType: file.mimeType,
                fileUri: fileUri
            }
        };
    }

    // 2. Prompt Optimization: 
    // - explicitly requested shorter, high-yield output to reduce token generation time.
    // - stricter constraints on JSON to ensure one-shot success.
    let prompt = "Analyze the audio. Generate a CONCISE JSON response. Do not use markdown code blocks.";
    
    if (options.shortNotes) prompt += " 'summary': 5-7 bullet points of high-yield info.";
    
    if (options.theses) prompt += " 'theses': 3 core arguments.";

    if (options.examples) prompt += " 'examples': 3 real-world applications mentioned.";
    
    // OPTIMIZATION: Reduced word count request from 800 to 400 to speed up generation
    if (options.runningNotes) prompt += " 'runningNotes': A structured study guide (approx 300-400 words) using Markdown (## Headers, **Bold**) defining key terms."; 
    
    if (options.quiz) prompt += " 'quiz': 5 multiple choice questions to verify understanding.";

    prompt += " 'confidenceScore': Integer 0-100.";
    prompt += " 'accuracyNote': Short quality check.";
    prompt += " 'title': Academic title.";

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Flash 2.5 is fast and reliable for JSON structure
      contents: {
        parts: [
          contentPart,
          {
            text: prompt
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        // OPTIMIZATION: 
        // 1. temperature 0.2 for faster deterministic sampling
        // 2. thinkingBudget 0 to disable reasoning overhead
        temperature: 0.2,
        thinkingConfig: { thinkingBudget: 0 }, 
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            confidenceScore: { type: Type.NUMBER, description: "Score 0-100" },
            accuracyNote: { type: Type.STRING },
            summary: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            theses: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            },
            examples: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            runningNotes: { type: Type.STRING },
            quiz: {
              type: Type.ARRAY, 
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING } 
                  },
                  correctAnswer: { type: Type.INTEGER },
                  explanation: { type: Type.STRING }
                },
                required: ["question", "options", "correctAnswer", "explanation"]
              }
            }
          },
          required: ["title", "confidenceScore", "accuracyNote", "summary", "theses", "examples", "runningNotes", "quiz"]
        }
      }
    });

    if (!response.text) {
      throw new Error("NO_RESPONSE");
    }

    // 3. Output Guardrail: Sanitization
    const cleanedText = response.text.replace(/```json|```/g, '').trim();
    const data = JSON.parse(cleanedText);
    
    // 4. Fallback checks
    if (typeof data.confidenceScore !== 'number') {
        data.confidenceScore = 0;
        data.accuracyNote = "Could not verify accuracy.";
    }
    
    if (!data.theses) data.theses = [];

    return data;

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    let friendlyMessage = "An unexpected error occurred. Please try again.";
    const msg = error.message || '';

    // Map technical errors to user-friendly messages
    if (msg.includes('400') || msg.includes('Payload') || msg.includes('Too Large')) {
        friendlyMessage = "The audio file is too complex or large for a single pass. Please try a shorter clip (under 20 minutes) or a smaller file size.";
    } else if (msg.includes('403') || msg.includes('API_KEY')) {
        friendlyMessage = "Access denied. Please check your API Key configuration.";
    } else if (msg.includes('Failed to fetch') || msg.includes('Network')) {
        friendlyMessage = "Network connection lost. Please check your internet connection.";
    } else if (msg.includes('UPLOAD_FAILED_STRUCTURE') || msg.includes('reading \'uri\'')) {
        friendlyMessage = "We couldn't upload this specific file format. Please try converting it to a standard MP3 or WAV file.";
    } else if (msg.includes('SERVER_PROCESSING_FAILED')) {
        friendlyMessage = "The server failed to process the audio file. It might be corrupted.";
    } else if (msg.includes('NO_RESPONSE') || msg.includes('JSON')) {
        friendlyMessage = "The AI couldn't generate a valid analysis. The audio might be silent, unclear, or in an unsupported language.";
    } else if (msg.includes('413')) {
        friendlyMessage = "File is too large. Please upload a file smaller than 50MB.";
    }

    throw new Error(friendlyMessage);
  }
};
