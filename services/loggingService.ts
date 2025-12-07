
import { createClient } from '@supabase/supabase-js';

// NOTE: In a real production app, you should use environment variables.
// For this prototype, if you don't have env vars, you can hardcode them here temporarily
// or use the input fields in the Admin Dashboard to "Activate" logging.
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';

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

// Try to auto-init if env vars exist
if (SUPABASE_URL && SUPABASE_KEY) {
    initSupabase(SUPABASE_URL, SUPABASE_KEY);
}

export const logAction = async (sessionId: string, actionType: string, payload: any) => {
    if (!supabase) return;

    try {
        await supabase.from('app_logs').insert({
            session_id: sessionId,
            action_type: actionType,
            payload: payload
        });
    } catch (e) {
        // Fail silently so we don't break the user experience
        console.warn("Logging failed", e);
    }
};

export const fetchLogs = async () => {
    if (!supabase) return [];
    
    try {
        const { data, error } = await supabase
            .from('app_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);
            
        if (error) throw error;
        return data || [];
    } catch (e) {
        console.error("Error fetching logs", e);
        return [];
    }
};
