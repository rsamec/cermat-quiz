import fs from 'fs/promises';

export async function readJsonFromFile(filePath) {
  try {
    // Read the file content
    const data = await fs.readFile(filePath, 'utf8');

    // Parse JSON string into an object
    const jsonData = JSON.parse(data);
    return jsonData;
  } catch (error) {
    throw error;
  }
}
