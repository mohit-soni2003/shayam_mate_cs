import { createClient } from "@supabase/supabase-js";
import { supabase_url, supabase_anon_key } from "../store/keyStore";

// Used only for the Google OAuth redirect handshake. Every other read/write
// goes through our own API (services/api.js) — this app is 3-tier, Supabase
// is never queried directly for app data from the browser.
export const supabase = createClient(supabase_url, supabase_anon_key);
