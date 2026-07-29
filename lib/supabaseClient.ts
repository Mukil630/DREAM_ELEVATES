import { createClient } from "@supabase/supabase-js";

const defaultUrl = "https://cgifsifzgrhsujexmtvc.supabase.co";
const defaultKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnaWZzaWZ6Z3Joc3VqZXhtdHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3OTg5OTAsImV4cCI6MjEwMDM3NDk5MH0.3uYYxAVNhJxjl6uDyfHSaraOrGEKkBEWGhmblNxA5bU";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || defaultUrl;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || defaultKey;

export const isSupabaseConfigured = true;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


