import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';

const url = 'https://cgifsifzgrhsujexmtvc.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnaWZzaWZ6Z3Joc3VqZXhtdHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3OTg5OTAsImV4cCI6MjEwMDM3NDk5MH0.3uYYxAVNhJxjl6uDyfHSaraOrGEKkBEWGhmblNxA5bU';
const supabase = createClient(url, key);

async function ultraCompress() {
  const jsonPath = path.join(process.cwd(), 'products.json');
  console.log('Reading products.json...');
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  console.log(`Ultra-compressing ${data.length} items to 300x300 ~6KB JPEG...`);

  const optimized = [];
  for (const item of data) {
    let img = item.image_url || item.image || '';

    if (img && img.startsWith('data:image/')) {
      try {
        const base64Data = img.replace(/^data:image\/\w+;base64,/, '');
        const imgBuffer = Buffer.from(base64Data, 'base64');

        const compressed = await sharp(imgBuffer)
          .resize(300, 300, { fit: 'cover' })
          .jpeg({ quality: 50, progressive: true })
          .toBuffer();

        img = `data:image/jpeg;base64,${compressed.toString('base64')}`;
      } catch (e) {
        console.warn(`Compression fallback for ${item.id}:`, e.message);
      }
    }

    optimized.push({
      ...item,
      image: img,
      image_url: img
    });
  }

  fs.writeFileSync(jsonPath, JSON.stringify(optimized, null, 2), 'utf8');
  const sizeMB = (fs.statSync(jsonPath).size / (1024 * 1024)).toFixed(2);
  console.log(`Saved ultra-compressed products.json! New file size: ${sizeMB} MB`);

  console.log('Syncing ultra-fast payload to Supabase menu_items table...');
  for (const item of optimized) {
    const payload = {
      id: item.id,
      name: item.name,
      price_label: item.price_label || `₹${item.price}`,
      rating: item.rating || 4.8,
      review_count: item.review_count || 25,
      image_url: item.image_url,
      category: item.category || 'Baking Tools',
      description: item.description || ''
    };
    await supabase.from('menu_items').upsert(payload, { onConflict: 'id' });
  }
  console.log('Supabase ultra-fast sync complete!');
}

ultraCompress();
