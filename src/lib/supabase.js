import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hujtofmlumdleprkeiuw.supabase.co";
const supabaseAnonKey = "sb_publishable_TOmGj-79DNrNzNcc7_DIrw_swQIPvi2";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
