import { createClient } from '@supabase/supabase-js';
import type { Database } from './src/integrations/supabase/types';

const SUPABASE_URL = "https://visflgdxbccivhzjbohg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpc2ZsZ2R4YmNjaXZoempib2hnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3NzEwODYsImV4cCI6MjA2NDM0NzA4Nn0.2Vo4jmn3MkJavngC34pTJUxr-BzjOHfaz5dAlEtT11U";

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function testConnection() {
  try {
    console.log('Testando conexão com o Supabase...');
    const { data, error } = await supabase.from('products').select('count');
    
    if (error) {
      console.error('Erro ao conectar com o Supabase:', error);
      return;
    }
    
    console.log('Conexão bem-sucedida!');
    console.log('Dados recebidos:', data);
  } catch (error) {
    console.error('Erro ao testar conexão:', error);
  }
}

testConnection();