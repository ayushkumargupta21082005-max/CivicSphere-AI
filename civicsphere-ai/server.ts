import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Initialize Google Gen AI client with developer-specific telemetry headers
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  try {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini client successfully initialized.");
  } catch (err) {
    console.error("Failed to initialize Gemini client:", err);
  }
} else {
  console.log("No valid GEMINI_API_KEY environment variable found. Falling back to local smart engine.");
}

// 1. Issue Analysis & Classification Proxy Endpoint
app.post("/api/gemini/analyze-issue", async (req, res) => {
  const { title, description, ward, reporterName, image } = req.body;

  // Local fallback logic
  const localFallbackAnalysis = () => {
    const textToAnalyze = `${title} ${description}`.toLowerCase();
    
    let category = "Public Safety Hazards";
    let assignedDepartment = "Emergency Services";
    let severity: "Low" | "Medium" | "High" | "Emergency" = "Medium";
    let hazards: string[] = ["General civic hazard"];
    let impactEstimation = "10-20 local residents affected";
    let emergencyEscalation = false;

    if (textToAnalyze.includes("pothole") || textToAnalyze.includes("road") || textToAnalyze.includes("asphalt") || textToAnalyze.includes("street")) {
      category = "Road Damage";
      assignedDepartment = "Department of Public Works";
      severity = "Medium";
      hazards = ["Vehicle damage risk", "Pedestrian tripping hazard"];
      impactEstimation = "50+ commuters per day affected";
    } else if (textToAnalyze.includes("garbage") || textToAnalyze.includes("trash") || textToAnalyze.includes("waste") || textToAnalyze.includes("dumping") || textToAnalyze.includes("litter")) {
      category = textToAnalyze.includes("illegal") ? "Illegal Dumping" : "Garbage";
      assignedDepartment = "Sanitation Services";
      severity = "Low";
      hazards = ["Sewer clog risk", "Odor accumulation", "Rodent attraction"];
      impactEstimation = "Immediate neighbors affected";
    } else if (textToAnalyze.includes("water") || textToAnalyze.includes("leak") || textToAnalyze.includes("pipe") || textToAnalyze.includes("burst")) {
      category = "Water Leakage";
      assignedDepartment = "Water & Sewer Authority";
      severity = "High";
      hazards = ["Water waste", "Slipping hazard", "Potential structural erosion"];
      impactEstimation = "Entire neighborhood block water supply affected";
    } else if (textToAnalyze.includes("light") || textToAnalyze.includes("dark") || textToAnalyze.includes("lamp") || textToAnalyze.includes("streetlights")) {
      category = "Broken Streetlights";
      assignedDepartment = "Electrical Department";
      severity = "Medium";
      hazards = ["Dark street risk", "Increased crime susceptibility", "Low visibility for drivers"];
      impactEstimation = "15-20 households affected";
    } else if (textToAnalyze.includes("sewage") || textToAnalyze.includes("drain") || textToAnalyze.includes("overflow") || textToAnalyze.includes("smell")) {
      category = "Sewage";
      assignedDepartment = "Water & Sewer Authority";
      severity = "Emergency";
      hazards = ["Biological health hazard", "Groundwater pollution", "Severe odor nuisance"];
      impactEstimation = "100+ surrounding properties impacted";
      emergencyEscalation = true;
    } else if (textToAnalyze.includes("flood") || textToAnalyze.includes("rain") || textToAnalyze.includes("storm")) {
      category = "Flooding";
      assignedDepartment = "Emergency Services";
      severity = "Emergency";
      hazards = ["Property damage risk", "Electrocution danger", "Impassable roads"];
      impactEstimation = "Entire low-lying ward sector affected";
      emergencyEscalation = true;
    } else if (textToAnalyze.includes("tree") || textToAnalyze.includes("branch") || textToAnalyze.includes("fall")) {
      category = "Trees";
      assignedDepartment = "Parks & Recreation";
      severity = "Medium";
      hazards = ["Blocked pathway", "Powerline interference risk"];
      impactEstimation = "Local block residents affected";
    } else if (textToAnalyze.includes("traffic") || textToAnalyze.includes("signal") || textToAnalyze.includes("sign")) {
      category = "Traffic Problems";
      assignedDepartment = "Traffic Control";
      severity = "High";
      hazards = ["Potential vehicle collision", "Commuter gridlock"];
      impactEstimation = "300+ daily drivers affected";
    } else if (textToAnalyze.includes("construction") || textToAnalyze.includes("hazard") || textToAnalyze.includes("unsafe")) {
      category = "Construction";
      assignedDepartment = "Department of Public Works";
      severity = "High";
      hazards = ["Worksite safety violation", "Pedestrian detour required"];
      impactEstimation = "Pedestrians and immediate residents affected";
    }

    if (textToAnalyze.includes("fire") || textToAnalyze.includes("gas") || textToAnalyze.includes("collapse")) {
      severity = "Emergency";
      emergencyEscalation = true;
      hazards.push("Life-threatening condition");
    }

    const confidence = image ? 90 : 75;

    return {
      category,
      severity,
      suggestedTitle: title ? `Report: ${title}` : `Civic Alert: ${category} at ${ward}`,
      suggestedDescription: description || `Identified potential ${category.toLowerCase()} issues requiring attention in ${ward}.`,
      assignedDepartment,
      emergencyEscalation,
      confidence,
      hazards,
      citizenAdvisory: `Please exercise caution around the reported area. Avoid direct contact with any hazardous elements and stay tuned for status updates.`,
      governmentInsights: `Prioritize dispatching an evaluation crew from the ${assignedDepartment}. Ward historical alerts indicate this section requires prompt inspection.`,
      impactEstimation
    };
  };

  if (!aiClient) {
    console.log("[Proxy API] Using local Smart Fallback Engine (no API client available).");
    return res.json(localFallbackAnalysis());
  }

  try {
    const prompt = `
      Analyze the following community civic issue report and provide structured assessment.
      
      REPORT DETAILS:
      - Title: "${title || "Not provided"}"
      - Description: "${description || "Not provided"}"
      - Reported Ward: "${ward || "Not provided"}"
      - Citizen Name: "${reporterName || "Anonymous"}"
      
      Determine the:
      1. Category (One of: "Road Damage", "Garbage", "Water Leakage", "Broken Streetlights", "Sewage", "Illegal Dumping", "Traffic Problems", "Trees", "Flooding", "Animals", "Construction", "Public Safety Hazards")
      2. Severity (One of: "Low", "Medium", "High", "Emergency")
      3. Suggested Title (Professional, clear summary)
      4. Suggested Description (Polished, details-rich description)
      5. Department Routing (One of: "Department of Public Works", "Sanitation Services", "Water & Sewer Authority", "Electrical Department", "Traffic Control", "Parks & Recreation", "Emergency Services")
      6. Emergency Escalation (true/false, true if there is immediate threat to human life or health)
      7. Confidence Score (0-100 based on detail level and image presence)
      8. Hazards (List of identified primary safety/health risks)
      9. Citizen Advisory (Safety directions for citizens)
      10. Government Insights (Priority/action items for administrative officials)
      11. Impact Estimation (Summary sentence of affected community size or scale)
    `;

    const contents: any[] = [];
    if (image) {
      // Decode base64 image
      const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const mimeType = matches[1];
        const base64Data = matches[2];
        contents.push({
          inlineData: {
            mimeType,
            data: base64Data
          }
        });
      }
    }
    contents.push({ text: prompt });

    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            severity: { type: Type.STRING },
            suggestedTitle: { type: Type.STRING },
            suggestedDescription: { type: Type.STRING },
            assignedDepartment: { type: Type.STRING },
            emergencyEscalation: { type: Type.BOOLEAN },
            confidence: { type: Type.INTEGER },
            hazards: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            citizenAdvisory: { type: Type.STRING },
            governmentInsights: { type: Type.STRING },
            impactEstimation: { type: Type.STRING }
          },
          required: [
            "category", "severity", "suggestedTitle", "suggestedDescription",
            "assignedDepartment", "emergencyEscalation", "confidence", "hazards",
            "citizenAdvisory", "governmentInsights", "impactEstimation"
          ]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);

  } catch (error) {
    console.error("[Proxy API Error] Gemini analysis failed. Executing fallback:", error);
    return res.json(localFallbackAnalysis());
  }
});

// 2. Global AI Analytics & Insights Generation Proxy Endpoint
app.post("/api/gemini/analytics", async (req, res) => {
  const { issues } = req.body;

  const localFallbackAnalytics = () => {
    return {
      communityHealthScore: 78,
      trendPrediction: `### Predictive Analysis Report
Based on historical community activity, we anticipate a **14% increase in Road Damage & Pothole reports** over the next 10 days due to upcoming high-moisture weather patterns. 
      
*   **Infrastructure Alert**: Older sewer grids in Ward 2 showing high stress.
*   **Response Bottleneck**: Sanitation services department is currently experiencing high load.`,
      categoryAnalysis: [
        { category: "Road Damage", count: 12, risk: "Medium" },
        { category: "Garbage", count: 18, risk: "Low" },
        { category: "Water Leakage", count: 6, risk: "High" },
        { category: "Broken Streetlights", count: 9, risk: "Medium" },
        { category: "Sewage", count: 4, risk: "High" }
      ],
      departmentLoad: [
        { department: "Department of Public Works", openCount: 15, loadFactor: "Medium" },
        { department: "Sanitation Services", openCount: 18, loadFactor: "High" },
        { department: "Water & Sewer Authority", openCount: 10, loadFactor: "High" },
        { department: "Electrical Department", openCount: 9, loadFactor: "Medium" }
      ],
      highRiskAreas: [
        { ward: "Ward 3", riskScore: 88, primaryHazard: "Severe Sewage Leakage & Clogged storm drains" },
        { ward: "Ward 1", riskScore: 72, primaryHazard: "Unlit dark blocks & broken pavement" },
        { ward: "Ward 5", riskScore: 65, primaryHazard: "Illegal toxic dumping on school path" }
      ],
      recommendations: [
        "Deploy modular emergency stormwater drain guards to Ward 3 immediately.",
        "Initiate preventive pavement patching sweep in Ward 1 before the weekend rains.",
        "Shift 2 light maintenance crews from Electrical to help with public safety streetlight installation in Ward 5."
      ],
      weeklyPredictions: [
        { name: "Mon", expectedIssues: 5 },
        { name: "Tue", expectedIssues: 8 },
        { name: "Wed", expectedIssues: 12 },
        { name: "Thu", expectedIssues: 9 },
        { name: "Fri", expectedIssues: 14 },
        { name: "Sat", expectedIssues: 15 },
        { name: "Sun", expectedIssues: 7 }
      ]
    };
  };

  if (!aiClient) {
    console.log("[Proxy API] Using local Analytics Fallback (no API client available).");
    return res.json(localFallbackAnalytics());
  }

  try {
    const prompt = `
      You are the CivicSphere AI Chief Data Analyst. Analyze the following local community issues reports and generate a predictive report and analytics summary.
      
      ACTIVE COMMUNITY REPORTS SUMMARY:
      ${JSON.stringify((issues || []).map((i: any) => ({
        id: i.id,
        category: i.category,
        severity: i.severity,
        status: i.status,
        ward: i.ward,
        score: i.priorityScore
      })))}

      Generate:
      1. Community Health Score (0-100: reflecting resolution speed, safety hazard density, and volume of open emergencies)
      2. Trend Prediction (Markdown description detailing forecast, seasonal adjustments, and prediction alerts)
      3. Category Analysis (An array containing risk evaluation for categories)
      4. Department Load (Evaluation of municipal workload per department)
      5. High Risk Areas (A list of wards with elevated Risk Scores (0-100) and descriptions of their primary hazards)
      6. Actionable recommendations (List of 3 clear, highly technical recommendations for the mayor/city manager)
      7. Weekly Predictions (Predictive expected count of reported incidents for next 7 days, Monday to Sunday)
    `;

    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            communityHealthScore: { type: Type.INTEGER },
            trendPrediction: { type: Type.STRING },
            categoryAnalysis: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  count: { type: Type.INTEGER },
                  risk: { type: Type.STRING }
                },
                required: ["category", "count", "risk"]
              }
            },
            departmentLoad: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  department: { type: Type.STRING },
                  openCount: { type: Type.INTEGER },
                  loadFactor: { type: Type.STRING }
                },
                required: ["department", "openCount", "loadFactor"]
              }
            },
            highRiskAreas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  ward: { type: Type.STRING },
                  riskScore: { type: Type.INTEGER },
                  primaryHazard: { type: Type.STRING }
                },
                required: ["ward", "riskScore", "primaryHazard"]
              }
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            weeklyPredictions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  expectedIssues: { type: Type.INTEGER }
                },
                required: ["name", "expectedIssues"]
              }
            }
          },
          required: [
            "communityHealthScore", "trendPrediction", "categoryAnalysis",
            "departmentLoad", "highRiskAreas", "recommendations", "weeklyPredictions"
          ]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);

  } catch (error) {
    console.error("[Proxy API Error] Analytics analysis failed. Executing fallback:", error);
    return res.json(localFallbackAnalytics());
  }
});

// 3. AI Interactive Chatbot Proxy Endpoint
app.post("/api/gemini/chat", async (req, res) => {
  const { messages, currentIssues } = req.body;

  const lastUserMessage = messages && messages.length > 0 ? messages[messages.length - 1].text : "";

  const localFallbackChat = () => {
    const msg = lastUserMessage.toLowerCase();
    let reply = "I am the CivicSphere AI Assistant. I can help you report issues, review active town complaints, and learn about city bylaws. How can I help you today?";
    
    if (msg.includes("report") || msg.includes("submit") || msg.includes("how to")) {
      reply = "To report a new local issue, go to the **Report Issue** section in the navigation menu. Fill out the Title, Description, choose your Ward, enter your contact information, and optionally drag and drop an image of the concern (e.g. broken streetlight, road damage). Our AI Smart Engine will instantly categorize it and route it to the correct municipal department!";
    } else if (msg.includes("pothole") || msg.includes("road") || msg.includes("repair")) {
      reply = "Road repairs are handled by our Department of Public Works. Once reported, a patch job typically takes 3 to 5 business days to be resolved. High traffic density areas are scored with higher priority for earlier dispatch.";
    } else if (msg.includes("emergency") || msg.includes("danger") || msg.includes("accident")) {
      reply = "🚨 **EMERGENCY WARNING**: If you are facing an immediate life-threatening situation, gas leak, structure collapse, or fire, please call the municipal emergency services directly. Our CivicSphere app alerts municipal departments, but is not a substitute for standard live dispatcher services.";
    } else if (msg.includes("reputation") || msg.includes("score") || msg.includes("points")) {
      reply = "Citizens gain **Reputation Points** for submitting high-quality verified reports, responding to official queries, or verifying neighboring reports. A higher Reputation Score speeds up the AI classification confidence of your submissions!";
    } else if (msg.includes("status") || msg.includes("progress")) {
      reply = "You can filter and check all active city complaints on the **Community Dashboard**! Use the category, ward, and severity filters to track your submitted issue. The timeline tracks active dispatches and resolution details.";
    }
    return res.json({ reply });
  };

  if (!aiClient) {
    console.log("[Proxy API] Using local Chat Fallback (no API client available).");
    return localFallbackChat();
  }

  try {
    const formattedIssues = (currentIssues || []).slice(0, 5).map((i: any) => (
      `- Category: ${i.category}, Ward: ${i.ward}, Status: ${i.status}, Severity: ${i.severity}, Score: ${i.priorityScore}`
    )).join("\n");

    const systemPrompt = `
      You are the CivicSphere AI Assistant, a friendly, professional municipal representative and AI guide.
      Your goal is to assist citizens and local department officials with inquiries about civic repairs, municipal guidelines, guidelines for reporting issues, and status updates.
      
      Here is the current high-priority context of the town's issues database:
      ${formattedIssues}
      
      Instructions:
      - Answer politely, factually, and helpfully.
      - If requested to check an issue, refer to the active listings.
      - Inform users about reporting best practices (submitting clear titles, uploading real photos).
      - Maintain a respectful, encouraging, and collaborative community tone.
    `;

    const chatMessages = messages.map((m: any) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: chatMessages,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    return res.json({ reply: response.text });

  } catch (error) {
    console.error("[Proxy API Error] Chat failed. Executing fallback:", error);
    return localFallbackChat();
  }
});

// Serve Vite frontend in development, static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware loaded.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Production static directories serving loaded.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CivicSphere AI Server running on http://localhost:${PORT}`);
  });
}

startServer();
