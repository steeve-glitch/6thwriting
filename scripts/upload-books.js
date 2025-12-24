
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LIBRARY_FILE = path.resolve(__dirname, '../src/data/library.json');

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ggmdmiubcjnruiymzdze.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseKey) {
    console.error('Error: SUPABASE_SERVICE_KEY is missing in .env');
    console.error('Please add it to your .env file.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadBooks() {
    try {
        console.log('Reading library...');
        const data = await fs.readFile(LIBRARY_FILE, 'utf8');
        const library = JSON.parse(data);

        console.log(`Found ${library.length} books to upload.`);

        for (const book of library) {
            console.log(`Uploading: ${book.title}...`);

            const { error } = await supabase
                .from('books')
                .upsert({
                    id: book.id,
                    title: book.title,
                    author: extractAuthor(book.title, book.info),
                    content: book.content,
                    page_count: book.pageCount,
                    metadata: book.info
                }, { onConflict: 'id' });

            if (error) {
                console.error(`Error uploading ${book.title}:`, error.message);
            } else {
                console.log(`Success: ${book.title}`);
            }
        }

        console.log('Upload complete!');

    } catch (err) {
        console.error('Fatal Error:', err);
    }
}

function extractAuthor(title, info) {
    if (info && info.Author) return info.Author;
    // Basic fallback based on filenames we know
    if (title.includes('Paul Shipton')) return 'Paul Shipton';
    if (title.includes('Lois Lowry')) return 'Lois Lowry';
    if (title.includes('Abby Cooper')) return 'Abby Cooper';
    return 'Unknown';
}

uploadBooks();
