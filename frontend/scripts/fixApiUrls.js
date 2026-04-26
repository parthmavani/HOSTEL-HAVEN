const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '../src');

const configImport = "import { API_BASE_URL } from '@/config';\n";
const configImportAsAPI = "import { API_BASE_URL as API } from '@/config';\n";

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Replace http://localhost:5000/api
    if (content.includes('http://localhost:5000/api')) {
        // Find where to insert import
        if (!content.includes("@/config")) {
            content = configImport + content;
            changed = true;
        }
        
        // Replace occurrences
        content = content.replace(/['"]http:\/\/localhost:5000\/api(['"])/g, '`${API_BASE_URL}$1');
        // Handle cases without /api suffix if any
        content = content.replace(/['"]http:\/\/localhost:5000\/api\/([^'"]+)['"]/g, '`${API_BASE_URL}/$1`');
        
        changed = true;
    }

    // Specially handle files with "const API = ..."
    if (content.includes("const API = 'http://localhost:5000/api';")) {
        content = content.replace("const API = 'http://localhost:5000/api';", "");
        if (!content.includes("@/config")) {
            content = configImportAsAPI + content;
        } else {
            content = content.replace(/import { API_BASE_URL } from '@\/config';/, configImportAsAPI.trim());
        }
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated: ${filePath}`);
    }
}

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            processFile(fullPath);
        }
    }
}

walk(srcPath);
