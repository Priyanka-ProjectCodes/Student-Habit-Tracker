import { createClient } from "@supabase/supabase-js";

// --- PASTE YOUR SUPABASE URL AND PUBLIC KEY HERE ---
const SUPABASE_URL = "https://wurbomywmhxvvblacahq.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_BlXIORAtj-lf8rqejUPF2g_rChkOJUG";

// This is the "Magic Key" that lets your app talk to the Cloud!
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
