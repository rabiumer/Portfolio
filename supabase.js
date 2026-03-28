import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://fxgrufdgljflzfxqesog.supabase.co';
const supabaseKey = 'sb_publishable_zTr7YU0RtlpMO8Aom6Awmw_10bdP4gc';

export const supabase = createClient(supabaseUrl, supabaseKey);
