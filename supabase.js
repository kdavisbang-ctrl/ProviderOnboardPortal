const SUPABASE_URL = 'https://caiaqqsmvlztfnyyglss.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhaWFxcXNtdmx6dGZueXlnbHNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MzQ3MzIsImV4cCI6MjA5MzQxMDczMn0.b4O-qQwWaU75to0XwFBfe8DegWXfMScuTGTehfYjX0c';

// Custom storage that falls back to memory if the browser blocks localStorage
// (Edge/Safari Tracking Prevention can block CDN-loaded scripts from storage)
const _mem = {};
const safeStorage = {
  getItem(k) {
    try { return window.localStorage.getItem(k); } catch { return _mem[k] ?? null; }
  },
  setItem(k, v) {
    try { window.localStorage.setItem(k, v); } catch { _mem[k] = v; }
  },
  removeItem(k) {
    try { window.localStorage.removeItem(k); } catch { delete _mem[k]; }
  },
};

window.sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { storage: safeStorage, autoRefreshToken: true, persistSession: true },
});
