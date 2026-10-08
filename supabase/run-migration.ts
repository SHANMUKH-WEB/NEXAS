import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://csdusdduodzbehqxffly.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzZHVzZGR1b2R6YmVocXhmZmx5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTM3NDg4OCwiZXhwIjoyMTA2OTUwODg4fQ.kcf-Mark-R0Tf7RGAg7N5_MTGL4oNh0PrA5tSFVhRaE';

import WebSocket from 'ws';

async function runMigration() {
  console.log('🚀 NEXUS AI: Supabase Migration Runner');
  console.log(`Connecting to: ${SUPABASE_URL}`);

  const migrationFilePath = path.join(__dirname, 'migrations', '001_initial_schema.sql');
  if (!fs.existsSync(migrationFilePath)) {
    console.error(`❌ Migration file not found at: ${migrationFilePath}`);
    process.exit(1);
  }

  const sqlContent = fs.readFileSync(migrationFilePath, 'utf8');
  console.log(`📄 Loaded migration file: 001_initial_schema.sql (${sqlContent.length} bytes)`);

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
    realtime: { transport: WebSocket as any },
  });

  // Verify connection by attempting to query or ping
  try {
    const { data, error } = await supabase.from('missions').select('id, title').limit(1);
    if (!error) {
      console.log('✅ Supabase database is connected and "missions" table already exists!');
      console.log('Missions sample:', data);
      return;
    }

    if (error && error.code === 'PGRST205') {
      console.log('\n⚠️ Notice: Supabase tables are not yet created in the public schema.');
      console.log('To apply the schema directly to your Supabase Cloud instance:');
      console.log('1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/csdusdduodzbehqxffly/sql/new');
      console.log('2. Paste the contents of supabase/migrations/001_initial_schema.sql');
      console.log('3. Click "RUN".');
      console.log('\n💡 NEXUS AI automatically runs with full local data persistence and fallback store if cloud tables are pending.\n');
    } else {
      console.log('Supabase status:', error?.message);
    }
  } catch (err: any) {
    console.error('Migration runner notice:', err?.message || err);
  }
}

runMigration().catch(console.error);
