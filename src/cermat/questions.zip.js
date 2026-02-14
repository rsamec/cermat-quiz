import JSZip from "jszip";
import { normalizeImageUrlsToAbsoluteUrls } from '../utils/quiz-string-utils.js';
import fs from 'fs';
import path from 'path';
import { readTextFromFile } from "../utils/file.utils.js";
import { baseUrl, formatCode } from "./utils.js";

async function main() {

    const ctEduPath = path.resolve(`./src/cermat`);

    const folders = fs.readdirSync(ctEduPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    const zip = new JSZip();
    for await (const code of folders) {

        const content = await readTextFromFile(path.resolve(ctEduPath, `${code}/index.md`));        
        const rawContent = normalizeImageUrlsToAbsoluteUrls(content, [`${baseUrl}/${code}`])
        zip.file(`${formatCode(code)}.md`,rawContent)        
    }
    return zip
}


try {
    const output = await main();
    output.generateNodeStream().pipe(process.stdout);
}
catch (err) {
    console.error("The sample encountered an error:", err);
};
