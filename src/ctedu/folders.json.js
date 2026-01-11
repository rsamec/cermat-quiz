import { readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';

const ctEduPath = resolve(`./src/ctedu`);
const ctEduFolders = readdirSync(ctEduPath, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);


process.stdout.write(JSON.stringify(ctEduFolders));