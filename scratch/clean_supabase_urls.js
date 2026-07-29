import { createClient } from '@supabase/supabase-js';

const url = 'https://cgifsifzgrhsujexmtvc.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnaWZzaWZ6Z3Joc3VqZXhtdHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3OTg5OTAsImV4cCI6MjEwMDM3NDk5MH0.3uYYxAVNhJxjl6uDyfHSaraOrGEKkBEWGhmblNxA5bU';
const supabase = createClient(url, key);

async function cleanSupabaseUrls() {
  console.log('Fetching all menu_items from Supabase...');
  const { data, error } = await supabase.from('menu_items').select('id, name, image_url');

  if (error || !data) {
    console.error('Fetch error:', error);
    return;
  }

  console.log(`Checking ${data.length} items for URL quote sanitization...`);

  let updated = 0;
  for (const item of data) {
    let raw = item.image_url || '';
    if (typeof raw === 'string') {
      const clean = raw.replace(/^[\\"'\s]+|[\\"'\s]+$/g, '').trim();
      if (clean !== raw) {
        await supabase.from('menu_items').update({ image_url: clean }).eq('id', item.id);
        updated++;
      }
    }
  }

  console.log(`Sanitized ${updated} image_urls in Supabase!`);
}

cleanSupabaseUrls();
