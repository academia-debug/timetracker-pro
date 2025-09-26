// CONFIGURACIÓN DE SUPABASE usando CDN
const supabaseUrl = 'https://dewtnkokpjznjinvgxji.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRld3Rua29rcGp6bmppbnZneGppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2NzYyMTAsImV4cCI6MjA3MzI1MjIxMH0.yZbRY-03uht_KL8oERCwWGthi00E1w-rjxTTtiRaHNA';

// Crear cliente usando la instancia global de Supabase
export const supabase = window.supabase ? window.supabase.createClient(supabaseUrl, supabaseAnonKey) : null;
