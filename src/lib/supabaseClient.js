// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://btkpoatofouzcswwfkky.supabase.co'
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY  // si usas Create React App

export const supabase = createClient(supabaseUrl, supabaseKey)
