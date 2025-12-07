[The Green Room](https://the-green-room-94621334034.us-west1.run.app/)
==============

**Anticipate objections. Master the conversation.**

**The Green Room** is a high-fidelity adversarial simulation engine. It allows users to stress-test product ideas, sales pitches, or difficult life decisions by orchestrating a debate between two AI agents with distinct, user-selected personalities.

Instead of a standard chatbot that agrees with you, The Green Room builds a "Red Team" to find holes in your logic before you enter the real meeting.

🚀 Key Features
---------------

*   **Multi-Agent Orchestration**: Simulates a three-way interaction between a **Proponent** (Your Advocate), an **Opponent** (The Skeptic), and a **Moderator** (Fact-Checker).
    
*   **Diverse Scenarios**: Pre-configured frameworks for:
    
    *   🚀 **New Product Launch**: Test market fit and technical viability.
        
    *   🤝 **Sales Negotiation**: Practice against "The Lowballer" or "Procurement Officer".
        
    *   🔥 **Crisis Management**: Simulate a PR disaster response.
        
    *   🌱 **Life Coaching**: Debate career pivots against "Imposter Syndrome".
        
*   **Deep Persona Library**: Choose from over 30 distinct archetypes, including:
    
    *   _The Ruthless CFO_ (ROI-focused)
        
    *   _The Paranoid CISO_ (Security-focused)
        
    *   _The Stubborn Toddler_ (Chaos mode)
        
*   **Strategic Synthesis**: A "Verifier" agent analyzes the entire transcript to generate:
    
    *   **Viability Score (0-100)**
        
    *   **SWOT Analysis**
        
    *   **Battle Card**: Specific counter-arguments and data requirements.
        
*   **Context Awareness**: Upload images or PDFs (architecture diagrams, pitch decks) for agents to analyze during the debate.
    

🛠️ Technology Stack
--------------------

*   **Frontend**: React 19, Vite, Tailwind CSS
    
*   **AI Models**: Google Gemini 3.0 Pro & 2.5 Flash (via Google Gen AI SDK)
    
*   **State Management**: Local Storage (Sessions)
    
*   **Icons**: Lucide React
    
*   **Visualization**: Recharts (Viability Scoring)
    
*   **Backend (Optional)**: Supabase (for remote logging/analytics)
    

    
📖 How It Works
---------------

1.  **Define Context**: Input your idea, pitch, or dilemma. You can attach supporting files for context.
    
2.  **Assemble Your Team**:
    
    *   **Green Team (Proponent)**: Select the persona that best represents your vision (e.g., "Visionary Founder").
        
    *   **Red Team (Opponent)**: Select the critic you are most worried about (e.g., "Skeptical Investor").
        
3.  **The Simulation**: The agents debate for a set number of rounds. You can **Pause** to interject with new facts or steer the conversation.
    
4.  **The Verdict**: The Verifier Agent acts as a judge, analyzing the transcript to provide a final viability score and a list of "Kill Points" you need to address.
    

🧠 System Architecture
----------------------

The application uses a client-side orchestration pattern found in services/geminiService.ts:

1.  **Turn 1**: Proponent analyzes context -> Generates Argument.
    
2.  **Turn 2**: Opponent analyzes Context + Argument -> Generates Rebuttal.
    
3.  **Moderator Loop**: (Async) Checks claims for factual accuracy using Google Search Grounding.
    
4.  **Loop**: Repeats for n rounds.
    
5.  **Synthesis**: The Verifier consumes the full JSON history to output a structured Battle Card.
    

🛡️ License
-----------

This project is licensed under the MIT License - see the LICENSE file for details.
