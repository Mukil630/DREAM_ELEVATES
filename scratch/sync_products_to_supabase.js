import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const url = 'https://cgifsifzgrhsujexmtvc.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnaWZzaWZ6Z3Joc3VqZXhtdHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3OTg5OTAsImV4cCI6MjEwMDM3NDk5MH0.3uYYxAVNhJxjl6uDyfHSaraOrGEKkBEWGhmblNxA5bU';
const supabase = createClient(url, key);

async function syncAllToSupabase() {
  const jsonPath = path.join(process.cwd(), 'products.json');
  console.log('Reading local products.json...');
  const localItems = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  console.log(`Syncing all ${localItems.length} items from products.json to Supabase menu_items table...`);

  let count = 0;
  for (const item of localItems) {
    const payload = {
      id: item.id,
      name: item.name,
      price_label: item.price_label || (typeof item.price === 'number' ? `₹${item.price}` : String(item.price || '')),
      rating: item.rating || 4.8,
      review_count: item.review_count || 25,
      image_url: item.image_url || item.image || '',
      category: item.category || 'Baking Tools',
      description: item.description || ''
    };

    const { error } = await supabase
      .from('menu_items')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn(`Upsert error for ${item.name}:`, error.message);
    } else {
      count++;
    }
  }

  console.log(`Successfully synced ${count}/${localItems.length} items to Supabase!`);
}

syncAllToSupabase();
