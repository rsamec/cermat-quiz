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

export async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}


export async function saveJsonToFile(filePath, jsonData) {
  try {
      // Convert JSON data to a string
      const data = JSON.stringify(jsonData, null, 2);

      // Ensure the directory exists
      await fs.mkdir(path.dirname(filePath), { recursive: true });

      // Write JSON string to file
      await fs.writeFile(filePath, data, 'utf8');
  } catch (error) {
      throw error;
  }
}
