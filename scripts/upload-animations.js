
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load env vars explicitly from the parent directory
// logic assumes script is run from inside 'animations' or root, but looking for .env in lit-companion
const ENV_PATH = path.resolve('D:/lit-apps/6th-grade-writing/lit-companion/.env');
dotenv.config({ path: ENV_PATH });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase URL or Service Key. Checked path:', ENV_PATH);
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// We are running this script from the 'animations' workspace, but the files are in 'lit-companion/public/animations'
// Actually, let's just upload the files from the 'lit-companion/public/animations' folder we just populated.
const SOURCE_DIR = 'D:/lit-apps/6th-grade-writing/lit-companion/public/animations';
const BUCKET = 'book-assets';
const STORAGE_PATH = 'animations';

const files = [
  'Animated_Bug_Muldoon_Module_Card.mp4', // bug-muldoon-card.mp4
  'Animated_Positive_Words_Video_Ready.mp4', // sticks-and-stones-card.mp4
  'Video_Generation_Based_on_Image.mp4' // number-the-stars-card.mp4
];

// Map local filenames to the specific remote filenames expected by the app (or just overwrite the same names)
// The dashboard used specific names before:
// bug-muldoon-card.mp4
// number-the-stars-card.mp4
// sticks-and-stones-card.mp4
// I should probably rename them on upload to match these cleaner names, or update the dashboard to use the new names. 
// Updating the dashboard is safer as it avoids confusion about what file is what content. I will keep the new names.

async function uploadFile(filename) {
  const filePath = path.join(SOURCE_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }

  const fileBuffer = fs.readFileSync(filePath);
  // We upload with the exact filename
  const targetPath = `${STORAGE_PATH}/${filename}`;

  console.log(`Uploading ${filename} to ${BUCKET}/${targetPath}...`);

  const { data, error } = await supabase
    .storage
    .from(BUCKET)
    .upload(targetPath, fileBuffer, {
      contentType: 'video/mp4',
      upsert: true
    });

  if (error) {
    console.error(`Error uploading ${filename}:`, error.message);
  } else {
    console.log(`Success! Uploaded ${filename}`);
  }
}

async function main() {
  for (const file of files) {
    await uploadFile(file);
  }
}

main();
