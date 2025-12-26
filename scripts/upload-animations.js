import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Setup paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..'); // Assuming script is in lit-companion/scripts
const animationsDir = path.join(projectRoot, '../animations'); // D:/lit-apps/6th-grade-writing/animations

// Load .env from lit-companion root
dotenv.config({ path: path.join(projectRoot, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !serviceKey) {
    console.error('Error: VITE_SUPABASE_URL or SUPABASE_SERVICE_KEY not found in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);
const BUCKET_NAME = 'book-assets';

const FILES_MAP = [
    { 
        filename: 'Animated_Bug_Muldoon_Module_Card.mp4', 
        targetName: 'bug-muldoon-card.mp4' 
    },
    { 
        filename: 'Animated_Positive_Words_Video_Ready.mp4', 
        targetName: 'sticks-and-stones-card.mp4' 
    },
    { 
        filename: 'Video_Generation_Based_on_Image.mp4', 
        targetName: 'number-the-stars-card.mp4' 
    }
];

async function upload() {
    console.log('Starting upload process...');

    // 1. Ensure bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
        console.error('Error listing buckets:', listError);
        return;
    }

    const bucket = buckets.find(b => b.name === BUCKET_NAME);
    if (!bucket) {
        console.log(`Bucket '${BUCKET_NAME}' not found. Creating...`);
        const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
            public: true,
            allowedMimeTypes: ['video/mp4', 'image/png', 'image/jpeg']
        });
        if (createError) {
            console.error('Error creating bucket:', createError);
            return;
        }
        console.log('Bucket created.');
    } else {
        console.log(`Bucket '${BUCKET_NAME}' exists.`);
    }

    // 2. Upload files
    for (const file of FILES_MAP) {
        const localPath = path.join(animationsDir, file.filename);
        if (!fs.existsSync(localPath)) {
            console.error(`File not found: ${localPath}`);
            continue;
        }

        console.log(`Uploading ${file.filename}...`);
        const fileContent = fs.readFileSync(localPath);

        const { error: uploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(`animations/${file.targetName}`, fileContent, {
                contentType: 'video/mp4',
                upsert: true
            });

        if (uploadError) {
            console.error(`Failed to upload ${file.filename}:`, uploadError);
        } else {
            const { data } = supabase.storage
                .from(BUCKET_NAME)
                .getPublicUrl(`animations/${file.targetName}`);
            
            console.log(`Uploaded! Public URL: ${data.publicUrl}`);
        }
    }
}

upload();
