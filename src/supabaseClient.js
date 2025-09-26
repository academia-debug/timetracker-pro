// CONFIGURACIÓN DE SUPABASE usando CDN
const supabaseUrl = 'https://oivpyyinkcdtuqstqmsn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pdnB5eWlua2NkdHVxc3RxbXNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyODM1MTksImV4cCI6MjA3Mzg1OTUxOX0.UiPjNnSdTd-UaYrj2f8iFexkDKSj7KY5Oy94G_qH5M8';

// Crear cliente usando la instancia global de Supabase
export const supabase = window.supabase ? window.supabase.createClient(supabaseUrl, supabaseAnonKey) : null;
