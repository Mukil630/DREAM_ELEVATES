import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const url = 'https://cgifsifzgrhsujexmtvc.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnaWZzaWZ6Z3Joc3VqZXhtdHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3OTg5OTAsImV4cCI6MjEwMDM3NDk5MH0.3uYYxAVNhJxjl6uDyfHSaraOrGEKkBEWGhmblNxA5bU';
const supabase = createClient(url, key);

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function optimizeImages() {
  console.log('Fetching all menu items from Supabase...');
  const { data, error } = await supabase.from('menu_items').select('*');
  if (error || !data) {
    console.error('Error fetching items:', error);
    return;
  }

  console.log(`Found ${data.length} items. Starting compression pass 2...`);
  let initialTotalBytes = 0;
  let optimizedTotalBytes = 0;
  let updatedCount = 0;

  for (const item of data) {
    const rawUrl = item.image_url || item.image || '';
    if (!rawUrl || !rawUrl.startsWith('data:image/')) {
      optimizedTotalBytes += (rawUrl ? rawUrl.length : 0);
      initialTotalBytes += (rawUrl ? rawUrl.length : 0);
      continue;
    }

    initialTotalBytes += rawUrl.length;

    // Skip if already small (< 40KB base64 string length ~ 55,000 chars)
    if (rawUrl.length < 55000) {
      optimizedTotalBytes += rawUrl.length;
      continue;
    }

    try {
      const base64Data = rawUrl.replace(/^data:image\/\w+;base64,/, '');
      const imgBuffer = Buffer.from(base64Data, 'base64');

      const compressedBuffer = await sharp(imgBuffer)
        .resize(500, 500, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 60, progressive: true })
        .toBuffer();

      const newBase64 = `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;
      optimizedTotalBytes += newBase64.length;

      let success = false;
      for (let attempt = 1; attempt <= 3; attempt++) {
        const { error: updErr } = await supabase
          .from('menu_items')
          .update({ image_url: newBase64 })
          .eq('id', item.id);

        if (!updErr) {
          success = true;
          updatedCount++;
          break;
        }
        await sleep(300);
      }

      if (!success) {
        console.error(`Failed item ${item.id} (${item.name}) after 3 attempts`);
      }
    } catch (err) {
      console.warn(`Could not compress image for item ${item.id} (${item.name}):`, err.message);
      optimizedTotalBytes += rawUrl.length;
    }

    await sleep(50);
  }

  console.log('--- COMPRESSION PASS COMPLETE ---');
  console.log(`Newly updated ${updatedCount} items.`);

  // Sync to local products.json
  const { data: freshData } = await supabase
    .from('menu_items')
    .select('*')
    .order('created_at', { ascending: false });

  if (freshData && freshData.length > 0) {
    let freshTotal = 0;
    freshData.forEach(i => { if (i.image_url) freshTotal += i.image_url.length; });
    console.log(`Final total Supabase image payload: ${(freshTotal / (1024 * 1024)).toFixed(2)} MB`);

    const localPath = path.join(process.cwd(), 'products.json');
    fs.writeFileSync(localPath, JSON.stringify(freshData, null, 2), 'utf8');
    console.log(`Synced ${freshData.length} items to products.json`);
  }
}

optimizeImages();
