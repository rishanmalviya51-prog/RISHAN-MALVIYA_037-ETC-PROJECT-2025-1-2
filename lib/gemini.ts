
import { GoogleGenAI } from "@google/genai";
import { ModuleMentorData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Converts a File object to a Base64 string suitable for the Gemini API.
 */
const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export async function analyzeStudyMaterial(file: File): Promise<string> {
  try {
    const filePart = await fileToGenerativePart(file);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          filePart,
          {
            text: `You are an expert academic tutor. Analyze this study material (image or document). 
            
            Provide a structured response in the following format:

            ### 📝 Executive Summary
            [A concise 2-3 sentence summary of the content]

            ### 🔥 High Importance (Must Know)
            [List 3-5 critical concepts, formulas, or definitions that are essential. Bullet points.]

            ### 🧊 Lower Importance (Context/Filler)
            [Briefly mention details that are supplementary, examples, or less critical for exams.]

            If the image is illegible or not study material, please state that clearly.`
          }
        ]
      }
    });

    return response.text || "Could not generate analysis.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Error analyzing document. Please try again.";
  }
}

const MODULE_MENTOR_SYSTEM_PROMPT = `
You are "Zenified Module Mentor" — the module-level AI brain for Zenified Minds.

ROLE:
- Ingest all module attachments (slides, notes, question banks).
- Produce a strategic study artifact: summary, topic tree, formulas, derivations, question weightage, S/A/B priority list, and a suggested study plan.
- Return JSON ONLY and nothing else.

REQUIREMENTS:
1) Produce an exam-focused module_overview: short paragraph + 5–8 bullets.
2) Extract formulas: expression, meaning, where_it_is_used, high_yield (true/false).
3) Extract derivations: title, main_result, steps_outline[], importance (high|medium|low).
4) Produce priority: ordered priority_list of {band, topic, reason}.
   - S_TIER: Must know, high probability in exams.
   - A_TIER: Important concepts.
   - B_TIER: Good to have.
5) Produce a concise study plan array (3–7 steps).
6) Tag traps/common mistakes.

OUTPUT JSON SCHEMA (strict):
{
  "module_overview": { "summary": string, "bullets": string[] },
  "formulas": [
    {"expression": string, "meaning": string, "where_it_is_used": string, "high_yield": boolean}
  ],
  "derivations": [
    {"title": string, "main_result": string, "steps_outline": string[], "importance": "high"|"medium"|"low"}
  ],
  "priority": { "priority_list": [ { "band": "S_TIER"|"A_TIER"|"B_TIER", "topic": string, "reason": string } ] },
  "plan": [ string ],
  "mistakes": [ string ]
}
`;

export async function runModuleMentor(
  moduleName: string,
  syllabusTopics: string[],
  attachments: File[]
): Promise<ModuleMentorData> {
  try {
    const fileParts = await Promise.all(attachments.map(fileToGenerativePart));
    
    const promptPayload = {
      task: "analyze_module",
      module_meta: {
        module_name: moduleName,
      },
      syllabus_topics: syllabusTopics,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: MODULE_MENTOR_SYSTEM_PROMPT,
        responseMimeType: "application/json",
      },
      contents: {
        parts: [
          ...fileParts,
          {
            text: `Analyze this module based on the provided files (slides, notes, etc.) and syllabus topics.
            
            Module Context:
            ${JSON.stringify(promptPayload)}
            
            Return ONLY valid JSON.`
          }
        ]
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as ModuleMentorData;
  } catch (error) {
    console.error("Module Mentor Error:", error);
    throw error;
  }
}
