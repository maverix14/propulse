// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://tbgeogmmbdqvwoqwqgtf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRiZ2VvZ21tYmRxdndvcXdxZ3RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4MjMyNjMsImV4cCI6MjA2MDM5OTI2M30.sZuFeocL4yp5DzQWr616DCzocfHxbPWRzjBI6YFbPmQ";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);