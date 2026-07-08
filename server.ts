import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase request size limit for handling base64 PDFs and images
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Lazy initializer for Google GenAI client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      throw new Error(
        "GEMINI_API_KEY environment variable is not configured. Please add your Gemini API Key in the Settings > Secrets panel in the AI Studio UI."
      );
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Structured schema for detailed resume analysis and career prediction
const resumeAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    personalInfo: {
      type: Type.OBJECT,
      properties: {
        fullName: { type: Type.STRING },
        email: { type: Type.STRING },
        phone: { type: Type.STRING },
        location: { type: Type.STRING },
        links: { type: Type.ARRAY, items: { type: Type.STRING } },
        summary: { type: Type.STRING, description: "Professional executive summary" }
      },
      required: ["fullName"]
    },
    workExperience: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          jobTitle: { type: Type.STRING },
          company: { type: Type.STRING },
          location: { type: Type.STRING },
          duration: { type: Type.STRING, description: "e.g., Jan 2021 - Present" },
          description: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Key duties and achievements as bullet points" }
        },
        required: ["jobTitle", "company"]
      }
    },
    education: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          degree: { type: Type.STRING, description: "e.g., Bachelor of Science" },
          fieldOfStudy: { type: Type.STRING, description: "e.g., Computer Science" },
          institution: { type: Type.STRING },
          location: { type: Type.STRING },
          duration: { type: Type.STRING }
        },
        required: ["degree", "institution"]
      }
    },
    skills: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          category: { type: Type.STRING, description: "technical, soft, or domain" },
          proficiency: { type: Type.INTEGER, description: "Proficiency score from 1 to 100 based on experience depth" },
          strengthDescription: { type: Type.STRING, description: "Brief explanation of how this skill manifests" }
        },
        required: ["name", "category", "proficiency"]
      }
    },
    certifications: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          issuingOrganization: { type: Type.STRING },
          issueDate: { type: Type.STRING }
        },
        required: ["name"]
      }
    },
    projects: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          technologiesUsed: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["title", "description"]
      }
    },
    achievements: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    careerProgression: {
      type: Type.OBJECT,
      properties: {
        currentCareerStage: { type: Type.STRING, description: "e.g., Entry, Mid-Level, Senior, Lead, Executive" },
        outlookSummary: { type: Type.STRING, description: "A detailed narrative of future career growth outlook" },
        pathways: {
          type: Type.ARRAY,
          description: "An array of 2 to 5 distinct, highly customized alternative career pathways suited for this candidate (e.g. Expert Specialist, Tech Leadership, Product Management, Entrepreneur/Consultant)",
          items: {
            type: Type.OBJECT,
            properties: {
              pathwayName: { type: Type.STRING, description: "The specific title of this career pathway option" },
              description: { type: Type.STRING, description: "A summary explaining the focus, core strengths, and rationale behind this pathway" },
              predictedRoles: {
                type: Type.ARRAY,
                description: "3 sequential future roles representing growth: 1-2 years (short term), 3-4 years (mid term), and 5+ years (long term)",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    roleTitle: { type: Type.STRING },
                    timeframe: { type: Type.STRING, description: "e.g., 1-2 years, 3-4 years, 5+ years" },
                    transitionDifficulty: { type: Type.STRING, description: "Low, Medium, or High" },
                    marketDemand: { type: Type.STRING, description: "Low, Moderate, or High" },
                    requiredSkillsToAcquire: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific skills the candidate must develop to reach this role" },
                    description: { type: Type.STRING, description: "Brief description of the role, why it fits their trajectory, and how they get there" }
                  },
                  required: ["roleTitle", "timeframe", "transitionDifficulty", "marketDemand", "requiredSkillsToAcquire", "description"]
                }
              }
            },
            required: ["pathwayName", "description", "predictedRoles"]
          }
        }
      },
      required: ["currentCareerStage", "outlookSummary", "pathways"]
    },
    competitivenessScores: {
      type: Type.OBJECT,
      properties: {
        fiveYearsAgo: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER, description: "Estimate of competitiveness 5 years ago out of 100" },
            marketTrendContext: { type: Type.STRING, description: "Analysis of market and technology trends 5 years ago, and how this profile aligned back then" }
          },
          required: ["score", "marketTrendContext"]
        },
        today: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER, description: "Estimate of competitiveness today out of 100" },
            marketTrendContext: { type: Type.STRING, description: "Analysis of the current job market demand, prevailing stacks/trends, and this resume's current fit" }
          },
          required: ["score", "marketTrendContext"]
        },
        fiveYearsFuture: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER, description: "Estimate of competitiveness 5 years from now out of 100" },
            marketTrendContext: { type: Type.STRING, description: "Projections of industry evolution, emerging frameworks/AI tools, automation index, and potential obsolescence risk" }
          },
          required: ["score", "marketTrendContext"]
        }
      },
      required: ["fiveYearsAgo", "today", "fiveYearsFuture"]
    },
    skillGapAnalysis: {
      type: Type.OBJECT,
      properties: {
        gaps: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              skillName: { type: Type.STRING },
              type: { type: Type.STRING, description: "missing (essential skills needed now), emerging (emerging trends), or critical (immediate priority)" },
              priority: { type: Type.STRING, description: "Low, Medium, or High" },
              impactDescription: { type: Type.STRING, description: "Why this gap is holding back competitiveness or career scaling" },
              actionableRecommendation: { type: Type.STRING, description: "Concrete recommendation: specific certifications, project ideas, tools, or courses to fill this gap" }
            },
            required: ["skillName", "type", "priority", "impactDescription", "actionableRecommendation"]
          }
        },
        strategicAdvice: { type: Type.STRING, description: "High-level personal coaching advice for future-proofing their career." }
      },
      required: ["gaps", "strategicAdvice"]
    }
  },
  required: [
    "personalInfo",
    "workExperience",
    "education",
    "skills",
    "careerProgression",
    "competitivenessScores",
    "skillGapAnalysis"
  ]
};

// API Endpoint to analyze a resume
app.post("/api/analyze-resume", async (req, res) => {
  try {
    const { textData, fileData, mimeType } = req.body;

    if (!textData && !fileData) {
      return res.status(400).json({ error: "No resume data provided. Please upload a file or paste text." });
    }

    const ai = getGenAI();

    let prompt = `
      You are an expert technical recruiter, executive career coach, and labor market economist.
      Analyze the provided resume and perform a deep evaluation. You must output a JSON object following the specified schema.
      If there is no data to be extracted for a field, return an empty array or null as appropriate. Ensure all fields are populated accurately based on the resume content.
      An example of garbleddata would be like : jabfjshjsfsjhvdhfjsjkh
      Make sure to:
      1. Parse all standard fields: work experience, education, skills, certifications, projects, and achievements. Ensure values are accurate to the input.
      2. Predict multiple alternative career pathways (minimum of 2, maximum of 5, e.g. Technical Specialist track, Management/Leadership track, Product/Strategy hybrid track, and Entrepreneurship/Consulting track). Each pathway must have a clear title, description of its focus, and exactly 3 sequential future roles over 1-2 years (short term), 3-4 years (mid term), and 5+ years (long term). Describe each role, transition difficulty, market demand, and skills to acquire.
      3. Categorize key technical and soft skills into a skills heat map with explicit proficiency ratings (1 to 100) and descriptions of strength.
      4. Compute a competitiveness score (0 to 100) for three specific epochs:
         - 5 years ago
         - Today (This year)
         - 5 Years in the Future
         In corporate labor economics context, analyze technological disruption, AI growth, automation risk, and stack shifts for each epoch and provide context.
      5. Perform a Skill Gap Analysis identifying missing/emerging skills with highly customized, practical recommendations.
    `;

    let contents: any;

    if (fileData && mimeType) {
      // Base64 file input (PDF or Image)
      contents = [
        {
          inlineData: {
            mimeType: mimeType,
            data: fileData,
          },
        },
        prompt
      ];
    } else {
      // Plain text resume input
      contents = `${prompt}\n\nResume Text:\n${textData}`;
    }

    // Call the model (we use gemini-2.5-flash as the default reliable model)
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: resumeAnalysisSchema,
        temperature: 0.2, // Low temperature for higher accuracy in parsing
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No analysis output received from Gemini API.");
    }

    const parsedData = JSON.parse(resultText);
    res.json(parsedData);
  } catch (error: any) {
    console.error("Error analyzing resume:", error);
    res.status(500).json({
      error: error.message || "An internal error occurred during resume analysis.",
    });
  }
});

// Setup Vite and Static file serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    
    // Explicit SPA wildcard fallback in development
    app.get("*", async (req, res, next) => {
      const url = req.originalUrl;
      try {
        const indexPath = path.resolve(process.cwd(), "index.html");
        if (fs.existsSync(indexPath)) {
          let template = fs.readFileSync(indexPath, "utf-8");
          template = await vite.transformIndexHtml(url, template);
          res.status(200).set({ "Content-Type": "text/html" }).end(template);
        } else {
          next();
        }
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
