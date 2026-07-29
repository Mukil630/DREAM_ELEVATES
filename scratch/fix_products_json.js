import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';

const url = 'https://cgifsifzgrhsujexmtvc.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnaWZzaWZ6Z3Joc3VqZXhtdHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3OTg5OTAsImV4cCI6MjEwMDM3NDk5MH0.3uYYxAVNhJxjl6uDyfHSaraOrGEKkBEWGhmblNxA5bU';
const supabase = createClient(url, key);

async function cleanProductsJson() {
  const jsonPath = path.join(process.cwd(), 'products.json');
  console.log('Reading products.json...');
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  console.log(`Processing ${data.length} items for max compression...`);

  const optimized = [];
  for (const item of data) {
    let img = item.image_url || item.image || '';

    if (img && img.startsWith('data:image/')) {
      try {
        const base64Data = img.replace(/^data:image\/\w+;base64,/, '');
        const imgBuffer = Buffer.from(base64Data, 'base64');

        const compressed = await sharp(imgBuffer)
          .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 60, progressive: true })
          .toBuffer();

        img = `data:image/jpeg;base64,${compressed.toString('base64')}`;
      } catch (e) {
        console.warn(`Could not compress item ${item.id}:`, e.message);
      }
    }

    const newItem = {
      ...item,
      image: img,
      image_url: img
    };
    optimized.push(newItem);
  }

  fs.writeFileSync(jsonPath, JSON.stringify(optimized, null, 2), 'utf8');
  console.log(`Saved clean products.json! New file size: ${(fs.statSync(jsonPath).size / (1024 * 1024)).toFixed(2)} MB`);

  // Update Supabase in batches of 10
  console.log('Syncing ultra-compact images to Supabase...');
  for (const item of optimized) {
    if (item.id) {
      await supabase.from('menu_items').update({ image_url: item.image_url }).eq('id', item.id);
    }
  }
  console.log('Supabase sync complete!');
}

cleanProductsJson();
