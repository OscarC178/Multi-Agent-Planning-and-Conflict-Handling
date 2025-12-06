import { FeedbackData } from "../types";

/**
 * MOCK SERVICE
 * Firebase removed in favor of Google Forms.
 * These stubs exist to prevent compilation errors in existing components.
 */

export interface ConnectionResult {
    success: boolean;
    logs: string[];
}

export const testConnection = async (): Promise<ConnectionResult> => {
    return { 
        success: true, 
        logs: ["Firebase has been disabled.", "Feedback is now handled via external Google Forms."] 
    };
};

export const submitFeedback = async (data: FeedbackData): Promise<boolean> => {
  console.log("Feedback submission mocked:", data);
  return true;
};

export const getFeedbackHistory = async (): Promise<FeedbackData[]> => {
  return [];
};