
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
  
  // Strategy:
  // 1. If file is small (< 9.5MB), use Inline Data (Base64) for speed and reliability in browser.
  // 2. If file is large, use the Files API to upload first, then reference the URI.
  
  const INLINE_SIZE_LIMIT = 9.5 * 1024 * 1024; // 9.5 MB
  let contentPart: any;

  try {
    if (audioBlob.size < INLINE_SIZE_LIMIT) {
        console.log("Processing via Inline Data (Small File)");
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
        // It could be nested in .file, or it could be the response itself (handling SDK variations)
        let file = uploadResponse.file;
        
        if (!file && (uploadResponse as any).uri) {
            file = uploadResponse as any;
        }

        // Sanity check: ensure we have a URI
        if (!file || !file.uri) {
             console.error("Invalid Upload Response Keys:", Object.keys(uploadResponse));
             throw new Error("UPLOAD_FAILED_STRUCTURE");
        }

        let fileUri = file.uri;
        let state = file.state;
        const name = file.name;

        console.log(`File uploaded: ${fileUri}, State: ${state}, Name: ${name}`);

        // Wait for processing to complete
        // Poll every 2 seconds
        while (state === 'PROCESSING') {
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const fileCheckResponse = await ai.files.get({ name: name });
            const updatedFile = fileCheckResponse.file || (fileCheckResponse as any);
            
            state = updatedFile.state;
            console.log(`File processing... State: ${state}`);
            
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

    // 2. Prompt Guardrail: Strict Grounding & Accuracy Instructions
    let prompt = "Analyze the audio content with academic rigor. Do not hallucinate, but do integrate relevant external knowledge (definitions, historical context, related theories) to provide a complete picture. Generate a CONCISE JSON response. English only.";
    
    if (options.shortNotes) prompt += " 'summary': Provide 5-7 detailed 'Key Takeaways', focusing on the most substantial insights.";
    
    if (options.theses) prompt += " 'theses': Extract 3-5 core arguments, hypotheses, or central claims. Articulate them with academic precision.";

    if (options.examples) prompt += " 'examples': Provide 3 detailed real-world applications or case studies mentioned or inferred, expanding on *why* they are relevant.";
    
    if (options.runningNotes) prompt += " 'runningNotes': Write a comprehensive 'Deep Dive' study guide (approx 600-800 words). Expand on the audio concepts with encyclopedic depth, adding definitions, context, and related concepts where helpful. Use Markdown formatting (## Headers, - Bullet points, **Bold** terms) to structure the notes effectively."; 
    
    if (options.quiz) prompt += " 'quiz': Generate 5 challenging Multiple Choice Questions that test synthesis and application of the concepts, not just recall.";

    // Evaluation Metrics Request
    prompt += " 'confidenceScore': Rate your confidence (0-100) based on audio clarity and content completeness.";
    prompt += " 'accuracyNote': A brief assessment of extraction quality.";
    prompt += " 'title': A descriptive, academic title.";

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite', 
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
        // Config optimized for speed & determinism
        temperature: 0.3,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            confidenceScore: { type: Type.NUMBER, description: "Self-eval score 0-100" },
            accuracyNote: { type: Type.STRING },
            summary: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            theses: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Core arguments or claims"
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
    
    // 4. Output Guardrail: Schema Check (Basic)
    if (typeof data.confidenceScore !== 'number') {
        data.confidenceScore = 0; // Fallback
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
