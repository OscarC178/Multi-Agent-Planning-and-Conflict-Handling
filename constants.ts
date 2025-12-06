
import { OpponentPersona, ProponentPersona, AIModel, Scenario } from './types';

export const SCENARIOS: Scenario[] = [
  {
    id: 'new_product',
    label: 'New Product / Feature Idea',
    description: 'Stress test a new concept before building it. Identify gaps in logic and market fit.',
    aggressionLevel: 'medium',
    contextPlaceholder: "Describe your product idea...\n\n- What problem does it solve?\n- Who is the target user?\n- What is the unique value proposition?\n- Any key technical or budget constraints?"
  },
  {
    id: 'sales_negotiation',
    label: 'Sales & Negotiation',
    description: 'Simulate a high-stakes sales call or negotiation. Practice handling objections and closing.',
    aggressionLevel: 'medium',
    contextPlaceholder: "Describe the deal...\n\n- What are you selling? (e.g. Luxury Condo, SaaS License)\n- Who is the buyer? (e.g. First-time buyer, procurement)\n- Price point: $X\n- Key selling points:\n- Expected objections:"
  },
  {
    id: 'damage_mitigation',
    label: 'Damage Mitigation / Crisis',
    description: 'You are managing a failure, outage, or PR issue. The opponent will be demanding and emotional.',
    aggressionLevel: 'high',
    contextPlaceholder: "Describe the crisis situation...\n\n- What happened? (e.g. Data breach, Service outage)\n- Who is affected?\n- What is your proposed immediate response?\n- What is the long-term fix?"
  },
  {
    id: 'promotion_push',
    label: 'Promotion / GTM Push',
    description: 'You are pitching a campaign or sales strategy. The opponent evaluates ROI and messaging.',
    aggressionLevel: 'medium',
    contextPlaceholder: "Describe the campaign or strategy...\n\n- What is the goal? (e.g. Increase leads by 20%)\n- Who is the audience?\n- What is the budget?\n- What are the key messages?"
  },
  {
    id: 'job_interview',
    label: 'Job Interview Simulation',
    description: 'You are the Candidate. The opponent is the Interviewer. Test your answers against rigorous questions.',
    aggressionLevel: 'low', // Professional/Rigorous, not aggressive
    contextPlaceholder: "Paste your Resume summary or Experience here...\n\n- Role applying for: \n- Key Skills:\n- Recent Experience:\n- A specific situation you want to practice discussing (e.g. 'Handling a conflict')."
  },
  {
    id: 'strategic_pivot',
    label: 'Strategic Pivot / Restructure',
    description: 'Proposing a major change in company direction. High stakes, focus on risk and morale.',
    aggressionLevel: 'high',
    contextPlaceholder: "Describe the strategic change...\n\n- Current state vs. Future state\n- Why is this pivot necessary now?\n- What are the risks? (Layoffs, revenue dip)\n- What is the timeline?"
  },
  {
    id: 'life_coaching',
    label: 'Life / Career Coaching',
    description: 'Debate a major life decision. Your Ambition vs. Your Fears (or Family expectations).',
    aggressionLevel: 'medium',
    contextPlaceholder: "Describe the life decision or dilemma...\n\n- The Goal: (e.g. Quit job to start a bakery)\n- My Skills/Strengths: (e.g. Great baker, organized)\n- My Fears/Weaknesses: (e.g. No savings, fear of failure)\n- Current Situation: (e.g. Stable but boring corporate job)"
  }
];

const BUSINESS_SCENARIOS = ['new_product', 'damage_mitigation', 'promotion_push', 'strategic_pivot', 'job_interview'];
const SALES_SCENARIOS = ['sales_negotiation'];
const LIFE_SCENARIOS = ['life_coaching'];

export const PROPONENT_PERSONAS: ProponentPersona[] = [
  // --- BUSINESS / PRODUCT ---
  {
    id: 'founding_team',
    name: 'The Founding Team (Hybrid)',
    description: 'Combines the Visionary, Pragmatic CEO, and Product Architect. Balances vision, execution, and feasibility.',
    style: 'Comprehensive, strategic, unified. Covers all bases from tech to business.',
    associatedScenarios: BUSINESS_SCENARIOS
  },
  {
    id: 'neutral_lead',
    name: 'The Holistic Lead (Neutral)',
    description: 'Balanced perspective. Weighs technology, business, and user experience equally. No bias.',
    style: 'Calm, comprehensive, articulate. Connects dots across departments.',
    associatedScenarios: BUSINESS_SCENARIOS
  },
  {
    id: 'visionary_founder',
    name: 'The Visionary Founder',
    description: 'Obsessed with the "Why" and the future. Believes this product will change the world.',
    style: 'Charismatic, inspiring, big-picture. Glosses over minor details.',
    associatedScenarios: BUSINESS_SCENARIOS
  },
  {
    id: 'pragmatic_ceo',
    name: 'The Pragmatic CEO',
    description: 'Focused on company stability, clear ROI, and market execution. Wants a sustainable business.',
    style: 'Direct, authoritative, focused on the bottom line and execution.',
    associatedScenarios: BUSINESS_SCENARIOS
  },
  {
    id: 'product_architect',
    name: 'The Product Architect',
    description: 'Balanced, structured, and feature-focused. Connects user needs directly to functionality.',
    style: 'Clear, logical, solution-oriented. Avoids fluff.',
    associatedScenarios: BUSINESS_SCENARIOS
  },
  {
    id: 'group_pm',
    name: 'Group Product Manager',
    description: 'Focused on strategy, portfolio alignment, and long-term KPIs. Sees how this fits the bigger picture.',
    style: 'Strategic, metric-oriented, collaborative.',
    associatedScenarios: BUSINESS_SCENARIOS
  },
  {
    id: 'growth_hacker',
    name: 'The Growth Hacker',
    description: 'Focused on speed, user acquisition, and viral loops. Wants to ship the MVP yesterday.',
    style: 'Fast-paced, metric-obsessed, iterates quickly. "Done is better than perfect."',
    associatedScenarios: BUSINESS_SCENARIOS
  },
  {
    id: 'head_of_engineering',
    name: 'Head of Engineering',
    description: 'Advocates for technical excellence, scalability, and robust architecture. Wants to build it right.',
    style: 'Technical, detailed, focused on long-term maintainability.',
    associatedScenarios: BUSINESS_SCENARIOS
  },
  {
    id: 'head_of_data',
    name: 'Head of Data',
    description: 'Believes data is the product. Focused on instrumentation, insights, and AI readiness.',
    style: 'Analytical, evidence-based, precise.',
    associatedScenarios: BUSINESS_SCENARIOS
  },
  {
    id: 'head_of_ops',
    name: 'Head of Operations',
    description: 'Focused on efficiency, process, and scalability. Wants smooth implementation.',
    style: 'Pragmatic, logistical, organized.',
    associatedScenarios: BUSINESS_SCENARIOS
  },
  {
    id: 'enterprise_sales',
    name: 'The Enterprise Sales Lead',
    description: 'Focused on high-value deals, ROI, compliance, and solving executive pain points.',
    style: 'Polished, professional, value-driven. Speaks the language of money.',
    associatedScenarios: BUSINESS_SCENARIOS
  },
  {
    id: 'user_advocate',
    name: 'The User Advocate',
    description: 'Deeply empathetic. Defends the user experience and emotional journey above all else.',
    style: 'Empathetic, human-centric, emotional. Fights friction.',
    associatedScenarios: BUSINESS_SCENARIOS
  },
  
  // --- SALES ---
  {
    id: 'consultative_seller',
    name: 'The Consultative Seller',
    description: 'Focuses on solving the client\'s problem first. Builds trust and value before discussing price.',
    style: 'Inquisitive, listener, value-oriented. "Help me understand your challenge."',
    associatedScenarios: SALES_SCENARIOS
  },
  {
    id: 'deal_closer',
    name: 'The Deal Closer',
    description: 'Focused on getting the signature. Handles objections quickly and creates urgency.',
    style: 'Confident, persuasive, slightly aggressive. "What do we need to do to sign today?"',
    associatedScenarios: SALES_SCENARIOS
  },
  {
    id: 'real_estate_agent',
    name: 'The Real Estate Agent',
    description: 'Sells the dream/lifestyle. Highlights potential and emotional connection to the property.',
    style: 'Enthusiastic, descriptive, personable. "Imagine your family here."',
    associatedScenarios: SALES_SCENARIOS
  },
  {
    id: 'tech_sales',
    name: 'The Tech Sales Pro',
    description: 'Sells features, scalability, and future-proofing. Loves demos and spec sheets.',
    style: 'Technical, polished, feature-focused.',
    associatedScenarios: SALES_SCENARIOS
  },

  // --- LIFE / COACHING ---
  {
    id: 'holistic_mentor',
    name: 'The Holistic Mentor (Hybrid)',
    description: 'Combines performance strategy, emotional support, and career tactics. A balanced, all-in-one approach.',
    style: 'Adaptive. Can be tough, supportive, or strategic depending on the moment.',
    associatedScenarios: LIFE_SCENARIOS
  },
  {
    id: 'performance_coach',
    name: 'The Performance Coach',
    description: 'Focused on unlocking potential, discipline, and high achievement. "You are capable of more."',
    style: 'Motivational, challenging, direct. Uses sports analogies.',
    associatedScenarios: LIFE_SCENARIOS
  },
  {
    id: 'holistic_coach',
    name: 'The Holistic Life Coach',
    description: 'Focused on alignment, balance, and well-being. "Does this serve your higher self?"',
    style: 'Gentle, intuitive, questioning. Focuses on feelings and energy.',
    associatedScenarios: LIFE_SCENARIOS
  },
  {
    id: 'career_strategist',
    name: 'The Career Strategist',
    description: 'Focused on market value, leverage, and long-term trajectory. "Play the game to win."',
    style: 'Tactical, sharp, focused on networking and positioning.',
    associatedScenarios: LIFE_SCENARIOS
  },
  {
    id: 'supportive_friend',
    name: 'The Supportive Best Friend',
    description: 'Unconditional support. Believes in you no matter what. "You got this!"',
    style: 'Warm, enthusiastic, informal. Validates feelings.',
    associatedScenarios: LIFE_SCENARIOS
  },

  // --- SPECIALTY ---
  {
    id: 'patient_parent',
    name: 'The Patient Parent',
    description: 'Calm, nurturing, and validating. Explains things simply. (Best vs. Toddler/Child).',
    style: 'Gentle, slow-paced, uses analogies. "Gentle parenting" techniques.',
    associatedScenarios: ['new_product', 'life_coaching'] // Can be used in life or random product testing
  }
];

export const OPPONENT_PERSONAS: OpponentPersona[] = [
  // NEUTRAL
  {
    id: 'neutral_auditor',
    name: 'The Objective Auditor (Neutral)',
    description: 'A calm, unbiased reviewer. Points out logical gaps and data inconsistencies without emotion.',
    style: 'Professional, inquisitive, matter-of-fact. "Please clarify X."',
    category: 'internal',
    associatedScenarios: BUSINESS_SCENARIOS
  },

  // --- INTERNAL STAKEHOLDERS (BUSINESS) ---
  {
    id: 'investment_committee',
    name: 'The Investment Committee (Hybrid)',
    description: 'Combined skepticism of Finance, Legal, and Operations. Focuses on ROI, Risk, and Liability.',
    style: 'Rigorous, high-level, looks for fatal flaws in the business model.',
    category: 'internal',
    associatedScenarios: BUSINESS_SCENARIOS
  },
  {
    id: 'impatient_ceo',
    name: 'The Impatient CEO',
    description: 'Wants results now. Hates complexity, excuses, and slow timelines.',
    style: 'Ruthless, demanding, short attention span. "Get to the point."',
    category: 'internal',
    associatedScenarios: BUSINESS_SCENARIOS
  },
  {
    id: 'skeptical_cfo',
    name: 'The Skeptical CFO',
    description: 'Focused purely on ROI, cost-cutting, and financial risk. Hates vague value propositions.',
    style: 'Ruthless, numbers-driven, impatient with buzzwords.',
    category: 'internal',
    associatedScenarios: BUSINESS_SCENARIOS
  },
  {
    id: 'paranoid_ciso',
    name: 'The Paranoid CISO',
    description: 'Obsessed with data privacy, compliance, and zero-trust. Assumes everything is a breach waiting to happen.',
    style: 'Defensive, technical, interrogative.',
    category: 'internal',
    associatedScenarios: BUSINESS_SCENARIOS
  },
  {
    id: 'legacy_founder',
    name: 'The Legacy Founder',
    description: 'Created the original product. Skeptical of new changes and protective of "the old way".',
    style: 'Nostalgic, stubborn, references "how we used to do it".',
    category: 'internal',
    associatedScenarios: BUSINESS_SCENARIOS
  },
  {
    id: 'head_of_ops_opp',
    name: 'Head of Operations',
    description: 'Worried about support burden, training costs, and operational drag.',
    style: 'Pragmatic, logistical, stressed about workload.',
    category: 'internal',
    associatedScenarios: BUSINESS_SCENARIOS
  },
  {
    id: 'project_manager',
    name: 'The Project Manager',
    description: 'Guardian of the timeline. Obsessed with delivery dates and scope creep.',
    style: 'Structured, risk-averse regarding timeline, bureaucratic.',
    category: 'internal',
    associatedScenarios: BUSINESS_SCENARIOS
  },
  {
    id: 'head_of_data_opp',
    name: 'Head of Data',
    description: 'Worried about data integrity, governance, and storage costs.',
    style: 'Analytical, pedantic about schema and quality.',
    category: 'internal',
    associatedScenarios: BUSINESS_SCENARIOS
  },
  {
    id: 'head_of_eng_opp',
    name: 'Head of Engineering',
    description: 'Hates tech debt. Worried this new feature is a "hack" that will break the system.',
    style: 'Technical, critical, performance-focused.',
    category: 'internal',
    associatedScenarios: BUSINESS_SCENARIOS
  },
  {
    id: 'group_pm_opp',
    name: 'Group Product Manager',
    description: 'Worried about cannibalization of other products and strategic misalignment.',
    style: 'Strategic, big-picture, territorial.',
    category: 'internal',
    associatedScenarios: BUSINESS_SCENARIOS
  },
  {
    id: 'legal_counsel',
    name: 'Legal Counsel',
    description: 'Risk-averse. Focuses on liability, IP issues, and regulatory exposure.',
    style: 'Formal, cautious, cites regulations.',
    category: 'internal',
    associatedScenarios: BUSINESS_SCENARIOS
  },

  // --- INTERNAL (LIFE/MINDSET) ---
  {
    id: 'inner_critic_collective',
    name: 'The Inner Critic Collective (Hybrid)',
    description: 'A crushing combination of Imposter Syndrome, Burnout, and Financial Anxiety. The ultimate mental block.',
    style: 'Overwhelming, multifaceted doubt. Attacks from all angles: ability, energy, and money.',
    category: 'internal',
    associatedScenarios: [...LIFE_SCENARIOS, 'job_interview']
  },
  {
    id: 'imposter_syndrome',
    name: 'The Imposter Syndrome',
    description: 'The voice in your head saying you aren\'t ready, smart enough, or deserving.',
    style: 'Anxious, doubtful, highlighting flaws. "They will find out you\'re faking it."',
    category: 'internal',
    associatedScenarios: [...LIFE_SCENARIOS, 'job_interview']
  },
  {
    id: 'burnout_voice',
    name: 'The Voice of Burnout',
    description: 'Exhausted and cynical. Argues that effort is futile and rest is the only priority.',
    style: 'Tired, heavy, pessimistic. "Why bother? It\'s too much work."',
    category: 'internal',
    associatedScenarios: LIFE_SCENARIOS
  },
  {
    id: 'financial_anxiety',
    name: 'The Financial Anxiety',
    description: 'Deeply risk-averse regarding money. Fears homelessness or poverty from any risk.',
    style: 'Panicked, catastrophizing, obsessed with security.',
    category: 'internal',
    associatedScenarios: LIFE_SCENARIOS
  },

  // --- EXTERNAL USERS / BUYERS (BUSINESS & SALES) ---
  {
    id: 'procurement_officer',
    name: 'Procurement Officer',
    description: 'The gatekeeper. Cares about price, SLAs, contract terms, and vendor risk.',
    style: 'Cold, transactional, focused on "red lines" and negotiation.',
    category: 'external',
    associatedScenarios: [...BUSINESS_SCENARIOS, ...SALES_SCENARIOS]
  },
  {
    id: 'lowballer',
    name: 'The Lowballer',
    description: 'Wants the product but refuses to pay full price. Constantly compares to cheaper competitors.',
    style: 'Aggressive negotiator, dismissive of "value adds", focuses on price.',
    category: 'external',
    associatedScenarios: SALES_SCENARIOS
  },
  {
    id: 'window_shopper',
    name: 'The Window Shopper',
    description: 'Just looking. Non-committal, asks a million questions but has no intention of buying today.',
    style: 'Vague, polite but distant, avoids commitment. "I need to think about it."',
    category: 'external',
    associatedScenarios: SALES_SCENARIOS
  },
  {
    id: 'indecisive_client',
    name: 'The Indecisive Client',
    description: 'Likes the product but is terrified of making the wrong decision. Needs constant reassurance.',
    style: 'Anxious, hesitant, asks "What if..." constantly.',
    category: 'external',
    associatedScenarios: SALES_SCENARIOS
  },
  {
    id: 'confused_user',
    name: 'The Confused End-User',
    description: 'Represents the non-technical majority. Easily overwhelmed by features.',
    style: 'Simple language, easily frustrated, asks "Why?" a lot.',
    category: 'external',
    associatedScenarios: ['new_product', 'strategic_pivot']
  },
  {
    id: 'power_user',
    name: 'The Power User',
    description: 'Demands advanced features, API access, and customization. Never satisfied with "basic".',
    style: 'Demanding, technical, feature-greedy.',
    category: 'external',
    associatedScenarios: ['new_product', 'promotion_push']
  },
  {
    id: 'skeptical_buyer',
    name: 'The Skeptical Buyer',
    description: 'Has been burned by vaporware before. Trusts nothing. Needs social proof.',
    style: 'Cynical, asks for references, doubts claims.',
    category: 'external',
    associatedScenarios: ['new_product', 'promotion_push', ...SALES_SCENARIOS]
  },
  {
    id: 'stubborn_toddler',
    name: 'The Stubborn Toddler',
    description: 'A chaotic force. Ignores logic. Arguing here requires extreme patience.',
    style: 'Irrational, emotional, distracted, uses "because I said so".',
    category: 'external',
    associatedScenarios: ['new_product', 'life_coaching'] // Random chaos factor
  },

  // --- EXTERNAL (LIFE) ---
  {
    id: 'risk_averse_parent',
    name: 'The Risk-Averse Parent',
    description: 'Loves you but fears risk. Wants you to take the safe, stable path with a pension.',
    style: 'Worried, traditional, persistent. "Think about your future."',
    category: 'external',
    associatedScenarios: LIFE_SCENARIOS
  },
  {
    id: 'toxic_boss_voice',
    name: 'The Toxic Boss/Industry',
    description: 'Represents the harsh reality of a competitive industry. Demands sacrifice.',
    style: 'Dismissive, arrogant, exploitative. "You\'re lucky to be here."',
    category: 'external',
    associatedScenarios: LIFE_SCENARIOS
  }
];

export const AVAILABLE_MODELS: AIModel[] = [
  { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro', provider: 'google' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'google' }
];

export const DEFAULT_ROUNDS = 3;

export const LOADING_MESSAGES = [
  "Consulting the oracle...",
  "Running adversarial simulations...",
  "Identifying logic gaps...",
  "Synthesizing counter-arguments...",
  "Calculating viability probability..."
];
