import fs from 'fs/promises';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_DIR = path.resolve(__dirname, '../../'); // Project root where PDFs are
const OUTPUT_FILE = path.resolve(__dirname, '../src/data/library.json');

async function processBooks() {
    console.log('Scanning for PDF files in:', SOURCE_DIR);

    try {
        const files = await fs.readdir(SOURCE_DIR);
        const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));

        if (pdfFiles.length === 0) {
            console.log('No PDF files found.');
            return;
        }

        console.log(`Found ${pdfFiles.length} PDF files.`);

        const library = [];

        for (const file of pdfFiles) {
            console.log(`Processing: ${file}...`);
            const filePath = path.join(SOURCE_DIR, file);
            const dataBuffer = await fs.readFile(filePath);

            try {
                const data = await pdf(dataBuffer);

                // Basic cleaning
                // Remove excessive newlines that often appear in PDF extractions
                let cleanText = data.text
                    .replace(/\r\n/g, '\n')
                    .replace(/\n\s*\n/g, '\n\n') // Collapse multiple blank lines
                    .trim();

                library.push({
                    id: file.replace(/\.pdf$/i, '').replace(/\s+/g, '-').toLowerCase(),
                    title: file.replace(/\.pdf$/i, ''),
                    filename: file,
                    content: cleanText,
                    pageCount: data.numpages,
                    info: data.info
                });

                console.log(`  > Success! extracted ${cleanText.length} characters.`);
            } catch (err) {
                console.error(`  > Error processing ${file}:`, err.message);
            }
        }

        // Ensure output directory exists
        await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });

        await fs.writeFile(OUTPUT_FILE, JSON.stringify(library, null, 2));
        console.log(`\nLibrary generated successfully at: ${OUTPUT_FILE}`);
        console.log(`Total books: ${library.length}`);

    } catch (err) {
        console.error('Fatal error:', err);
    }
}

processBooks();
