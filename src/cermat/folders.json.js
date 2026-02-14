import { readdirSync } from 'fs';
import { resolve } from 'path';

const sourcePath = resolve(`./src/cermat`);
const folders = readdirSync(sourcePath, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);


process.stdout.write(JSON.stringify(folders));