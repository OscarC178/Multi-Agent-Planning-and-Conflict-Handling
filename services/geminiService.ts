
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Message, ProductContext, OpponentPersona, ProponentPersona, AnalysisResult, AIModel, GroundingMetadata, Scenario } from "../types";

// Helper to initialize client with dynamic key
const getClient = (apiKey?: string) => {
  const key = apiKey || process.env.API_KEY;
  if (!key) {
    throw new Error("API Key is missing. Please enter it in the top left.");
  }
  return new GoogleGenAI({ apiKey: key });
};

// Fallback logic
const resolveModel = (model: AIModel): string => {
  if (model.provider === 'google') return model.id;
  console.warn(`Provider ${model.provider} not fully integrated. Falling back to Gemini.`);
  return 'gemini-3-pro-preview';
};

const getScenarioPromptModifier = (scenario: Scenario, role: 'proponent' | 'opponent'): string => {
  if (scenario.id === 'job_interview') {
    if (role === 'proponent') return "SCENARIO OVERRIDE: You are a JOB CANDIDATE. The 'Product Context' is your Resume/Experience. The Opponent is the Hiring Manager. Answer professionally.";
    if (role === 'opponent') return "SCENARIO OVERRIDE: You are the HIRING MANAGER. The 'Product Context' is the Candidate's Resume. Test their skills, culture fit, and truthfulness. Be professional but rigorous.";
  }
  
  if (scenario.id === 'damage_mitigation') {
    if (role === 'proponent') return "SCENARIO MODE: CRISIS MANAGEMENT. You are the spokesperson/lead trying to fix a disaster. Be apologetic, action-oriented, and reassuring.";
    if (role === 'opponent') return "SCENARIO MODE: CRISIS. You are deeply affected by the failure. Be urgent, emotional (if external) or worried about liability (if internal). Demand immediate fixes.";
  }

  if (scenario.id === 'promotion_push') {
    if (role === 'proponent') return "SCENARIO MODE: SALES PITCH. Focus on value, ROI, and excitement.";
    if (role === 'opponent') return "SCENARIO MODE: SALES PROSPECT. Evaluate the cost vs benefit strictly.";
  }

  if (scenario.id === 'sales_negotiation') {
    if (role === 'proponent') return "SCENARIO MODE: SALES & NEGOTIATION. You are the Seller. Focus on uncovering needs, building value, and handling objections. Your goal is to move the deal forward.";
    if (role === 'opponent') return "SCENARIO MODE: SALES & NEGOTIATION. You are the Buyer/Prospect. Raise objections about price, timing, competitors, or features. Do not roll over easily. Make them earn the sale.";
  }

  if (scenario.id === 'life_coaching') {
    if (role === 'proponent') return "SCENARIO MODE: LIFE COACHING. The 'Product' is the User's Life Goal or Dilemma. You are a supportive Coach/Advocate. Encourage the user, identify their strengths, and offer frameworks for growth. Do not talk about business ROI, talk about Personal fulfillment.";
    if (role === 'opponent') return "SCENARIO MODE: LIFE COACHING. The 'Product' is the User's Life Goal. You are the RESISTANCE (Internal Fears or External Blockers). Point out why this goal is risky, unrealistic, selfish, or dangerous. Focus on emotional costs, instability, or failure.";
  }

  return ""; // Default
};

/**
 * Helper to construct content with potential file attachments
 */
const constructContents = (textPrompt: string, context: ProductContext) => {
  const parts: any[] = [{ text: textPrompt }];
  if (context.files && context.files.length > 0) {
    context.files.forEach(file => {
      // Clean base64 string if it contains data URI prefix
      const base64Data = file.data.replace(/^data:(.*,)?/, '');
      parts.push({
        inlineData: {
          mimeType: file.mimeType,
          data: base64Data
        }
      });
    });
  }
  return { parts };
};

/**
 * Generates the Proponent's argument.
 */
export const generateProponentResponse = async (
  context: ProductContext,
  history: Message[],
  proponent: ProponentPersona,
  opponent: OpponentPersona,
  model: AIModel,
  scenario: Scenario,
  apiKey?: string
): Promise<string> => {
  
  const scenarioModifier = getScenarioPromptModifier(scenario, 'proponent');
  
  let systemInstruction = `
    You are Agent A, the Proponent (Green Team).
    
    YOUR PERSONA:
    Name: ${proponent.name}
    Description: ${proponent.description}
    Style: ${proponent.style}
    
    YOUR MISSION:
    Advocate for the subject defined in the context. Defend it against the Opponent (${opponent.name}).
    
    SCENARIO CONTEXT: ${scenario.label} - ${scenario.description}
    ${scenarioModifier}
    
    Context:
    Subject: ${context.productName}
    Details: ${context.productDescription}
    ${context.files?.length ? "NOTE: Attached files (images/PDFs) provide additional context about the product/scenario." : ""}

    CRITICAL INSTRUCTIONS:
    - Adhere strictly to your Persona Style.
    - If the user (Admin/User) has interjected in the chat history, you MUST acknowledge their new constraint or comment immediately and adapt your argument.
    - If the Moderator has pointed out a fact, accept it and adjust.
    - If the Opponent asks for evidence, try to provide logical proofs, industry standards, or hypothetical user scenarios that match your persona.

    FORMATTING RULES:
    - Use Markdown formatting for readability.
    - Use **Bold** for emphasis on key points or stats.
    - Use Bullet Points (- item) for lists or steps.
    - Keep paragraphs short (3-4 sentences max).
    - Limit total length to 200 words.

    If this is the first turn, provide a compelling opening statement.
    If replying to the Opponent, address their concerns directly but steer back to value.
  `;

  if (opponent.id === 'stubborn_toddler') {
     systemInstruction += `\nNOTE: You are arguing with a Stubborn Toddler. Simplify your language. If your persona is not 'The Patient Parent', your high-level concepts might fail hilariously, which is desired.`;
  }

  const conversationText = history.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
  const prompt = history.length === 0 
    ? "Please start with your opening statement." 
    : `Here is the conversation so far:\n${conversationText}\n\nRespond to the last point.`;

  try {
    const ai = getClient(apiKey);
    const targetModel = resolveModel(model);
    
    const response = await ai.models.generateContent({
      model: targetModel,
      contents: constructContents(prompt, context),
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });
    return response.text || "I am speechless.";
  } catch (error) {
    console.error("Proponent Error:", error);
    return `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
};

/**
 * Generates the Opponent's rebuttal.
 */
export const generateOpponentResponse = async (
  context: ProductContext,
  history: Message[],
  persona: OpponentPersona,
  model: AIModel,
  scenario: Scenario,
  apiKey?: string
): Promise<string> => {
  
  const categoryContext = persona.category === 'internal' 
    ? "You are an INTERNAL perspective. Your goal is to highlight risk, resource cost, or personal inadequacy (if life coaching)."
    : "You are an EXTERNAL perspective. You care about your own needs, price, or societal norms (if life coaching).";

  const scenarioModifier = getScenarioPromptModifier(scenario, 'opponent');
  
  // Adjust aggression based on scenario aggressionLevel
  let toneInstruction = "Be constructive but ruthless.";
  if (scenario.aggressionLevel === 'high') toneInstruction = "Be intense, demanding, and highly skeptical. Do not let them off the hook.";
  if (scenario.aggressionLevel === 'low') toneInstruction = "Be professional, calm, and rigorous. Focus on facts, not emotion.";

  let systemInstruction = `
    You are Agent B, the Opponent.
    Role: The Skeptic (Red Team).
    Context of your position: ${categoryContext}
    
    Persona Name: ${persona.name}
    Persona Description: ${persona.description}
    Persona Style: ${persona.style}
    
    SCENARIO CONTEXT: ${scenario.label} - ${scenario.description}
    ${scenarioModifier}
    
    Context:
    Subject: ${context.productName}
    Details: ${context.productDescription}
    ${context.files?.length ? "NOTE: Attached files (images/PDFs) provide additional context about the product/scenario." : ""}
    
    CRITICAL INSTRUCTIONS:
    1. Do NOT just argue logic. DEMAND EVIDENCE.
    2. Ask for case studies, specific metrics, security certifications, or pilot data.
    3. If Agent A makes a bold claim, ask: "Do you have data to back that up?" or "Has this been tested?"
    4. If the User (Admin) interjects, respect their constraint but find new risks within that constraint.
    5. ${toneInstruction}
    
    FORMATTING RULES:
    - Use Markdown formatting.
    - Use **Bold** for specific objections (e.g., **The Budget Issue:**).
    - Use Bullet Points for lists of demands.
    - Keep response under 150 words.
  `;

  if (persona.id === 'stubborn_toddler') {
    systemInstruction = `
      You are Agent B, the Stubborn Toddler.
      Context: ${context.productName}.
      Behavior: Ignore logic. Ask for snacks. Say "No!". Be difficult.
    `;
  }

  const conversationText = history.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
  const prompt = `Here is the conversation so far:\n${conversationText}\n\nProvide your response.`;

  try {
    const ai = getClient(apiKey);
    const targetModel = resolveModel(model);

    const response = await ai.models.generateContent({
      model: targetModel,
      contents: constructContents(prompt, context),
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.9, 
      },
    });
    return response.text || "I disagree.";
  } catch (error) {
    console.error("Opponent Error:", error);
    return "Error generating opponent response.";
  }
};

/**
 * Generates the Moderator's Intervention.
 */
export const generateModeratorIntervention = async (
  context: ProductContext,
  history: Message[],
  model: AIModel,
  apiKey?: string
): Promise<{ text: string, groundingMetadata?: GroundingMetadata } | null> => {
  
  const systemInstruction = `
    You are the Moderator (The Arbiter).
    Role: Fact-checker and reasoned mediator.
    
    Context:
    Subject: ${context.productName}
    
    Task:
    1. Review the last turn of the debate.
    2. If the Opponent or Proponent made a specific factual claim (e.g., "React is slower than Vue" or "GDPR requires X"), VERIFY it.
    3. If the argument is purely subjective or logical, DO NOT INTERVENE.
    4. Only intervene if you have < 70% confidence in a claim's accuracy or if the debate is going in circles.
    5. If you intervene, keep it short (max 50 words), cite a source if possible, and steer the debate.
    6. If no intervention is needed, output EXACTLY: "NO_INTERVENTION".

    Formatting: Use **Bold** for the verdict (e.g., **Fact Check:**).
  `;

  const conversationText = history.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
  const prompt = `Here is the conversation history:\n${conversationText}\n\nShould you intervene? If yes, provide the correction. If no, say NO_INTERVENTION.`;

  try {
    const ai = getClient(apiKey);
    const targetModel = 'gemini-3-pro-preview'; 

    const response = await ai.models.generateContent({
      model: targetModel,
      contents: prompt, // Moderator doesn't need the file context usually, just transcript
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2,
        tools: [{ googleSearch: {} }]
      },
    });

    const text = response.text?.trim() || "NO_INTERVENTION";
    
    if (text.includes("NO_INTERVENTION") || text.length < 5) {
      return null;
    }

    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

    return { text, groundingMetadata };

  } catch (error) {
    console.error("Moderator Error:", error);
    return null; 
  }
};

/**
 * Generates the Verifier's analysis.
 */
export const generateAnalysis = async (
  context: ProductContext,
  history: Message[],
  model: AIModel,
  apiKey?: string
): Promise<AnalysisResult> => {
  const systemInstruction = `
    You are the Verifier Agent (Role: CTO / Judge).
    Context: ${context.productName} - ${context.productDescription}
    ${context.files?.length ? "NOTE: Files were attached during this debate." : ""}
    
    Task: Output a JSON matrix containing gaps, viability score (0-100), reasoning, and a battle card.
    
    IMPORTANT: The 'actionPoints' field in the Battle Card is crucial. 
    List specific evidence requests made by the Opponent that were not fully answered (e.g. "Get SOC2 report", "Benchmark latency").
  `;

  const conversationText = history.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
  const prompt = `Analyze this debate transcript:\n${conversationText}`;

  const battleCardSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
      weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
      counterArguments: { type: Type.ARRAY, items: { type: Type.STRING } },
      actionPoints: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific evidence or data requested by the opponent to validate the product." },
    },
    required: ["strengths", "weaknesses", "counterArguments", "actionPoints"]
  };

  const analysisSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      gaps: { type: Type.ARRAY, items: { type: Type.STRING } },
      viabilityScore: { type: Type.NUMBER },
      viabilityReasoning: { type: Type.STRING },
      battleCard: battleCardSchema
    },
    required: ["gaps", "viabilityScore", "viabilityReasoning", "battleCard"]
  };

  try {
    const ai = getClient(apiKey);
    const targetModel = resolveModel(model);

    const response = await ai.models.generateContent({
      model: targetModel,
      contents: constructContents(prompt, context),
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.2, 
      },
    });

    const text = response.text || "{}";
    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Verifier Error:", error);
    return {
      gaps: ["Error analyzing debate."],
      viabilityScore: 0,
      viabilityReasoning: "The analysis failed due to an API error.",
      battleCard: { strengths: [], weaknesses: [], counterArguments: [], actionPoints: [] }
    };
  }
};
