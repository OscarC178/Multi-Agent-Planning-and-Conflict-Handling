
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATION ---
// Paste your Supabase URL and Key here to avoid entering them in the dashboard every time.
const HARDCODED_URL = "https://wedwcqpezzluathlhmxl.supabase.co";
const HARDCODED_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlZHdjcXBlenpsdWF0aGxobXhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxMDIyNTgsImV4cCI6MjA4MDY3ODI1OH0.fMIwq6wCBMRkr1lY5yeUw3hKD1BDjd9op4Dv0WhlHtg";
// ---------------------

const SUPABASE_URL = HARDCODED_URL || process.env.SUPABASE_URL || '';
const SUPABASE_KEY = HARDCODED_KEY || process.env.SUPABASE_KEY || '';

let supabase: any = null;

export const initSupabase = (url: string, key: string) => {
    try {
        if (url && key) {
            supabase = createClient(url, key);
            console.log("Supabase logging initialized");
        }
    } catch (e) {
        console.error("Failed to init supabase", e);
    }
};

// Auto-init if keys are present
if (SUPABASE_URL && SUPABASE_KEY) {
    initSupabase(SUPABASE_URL, SUPABASE_KEY);
}

// Helper to check if connection is active
export const isConfigured = () => !!supabase;

// --- GENERIC LOGGING (Clicks, Errors) ---
export const logAction = async (sessionId: string, actionType: string, payload: any) => {
    if (!supabase) return;

    try {
        await supabase.from('app_logs').insert({
            session_id: sessionId,
            action_type: actionType,
            payload: payload
        });
    } catch (e) {
        console.warn("Logging failed", e);
    }
};

// --- STRUCTURED ANALYTICS (The rich table) ---
export interface SessionAnalyticsData {
    session_id: string;
    product_name: string;
    scenario_id: string;
    proponent_name: string;
    opponent_name: string;
    model_used: string;
    file_count: number;
    turn_count: number;
    moderator_count: number;
    user_interjected: boolean;
    duration_seconds: number;
    viability_score: number;
    verdict_summary: string;
    full_payload: any;
}

export const logSessionComplete = async (data: SessionAnalyticsData) => {
    if (!supabase) return;

    try {
        // We insert into the new 'session_analytics' table
        const { error } = await supabase.from('session_analytics').insert(data);
        if (error) throw error;
    } catch (e) {
        console.error("Failed to log session analytics", e);
        // Fallback to generic log if table doesn't exist yet
        logAction(data.session_id, 'ANALYTICS_FALLBACK', data);
    }
};

export const fetchAnalytics = async () => {
    if (!supabase) return { data: [], error: { message: "Supabase not initialized" } };
    
    try {
        const { data, error } = await supabase
            .from('session_analytics')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);
            
        if (error) throw error;
        return { data: data || [], error: null };
    } catch (e: any) {
        console.error("Error fetching analytics", e);
        return { data: [], error: e };
    }
};
