require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Public/anon client for client-side operations
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Admin client with service_role key for server-side operations (bypass RLS)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = { supabase, supabaseAdmin };