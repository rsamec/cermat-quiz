import { parseArgs } from "node:util";
import fs from 'fs/promises';
import path from 'path';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';


const {
  values: { subject, period }
} = parseArgs({
  options: { subject: { type: "string" }, period: { type: "string" } }
});

async function processSubDirectory(directoryPath, outputDirPath) {
  const items = await fs.readdir(directoryPath, { withFileTypes: true });

  let out = [];

  for await (const item of items) { 
    const fullPath = path.join(directoryPath, item.name);

    if (item.isDirectory()) {
      // Process each subdirectory recursively
      await fs.mkdir(outputDirPath, { recursive: true });
      const outputFilePath = path.join(outputDirPath, `${item.name}.pdf`);
      out.push([item.name,await mergePDFsFromDirectoryWithLabels(fullPath, outputFilePath)]);
    }
  }
  return out;
}

async function mergePDFsFromDirectory(directoryPath, outputFilePath, fileMask = /\.pdf$/) {
  const mergedPdf = await PDFDocument.create();

  // Read files from the directory and filter by mask
  const pdfFiles = (await fs.readdir(directoryPath))
    .filter(file => fileMask.test(file))
    .map(file => path.join(directoryPath, file));

  // Merge each PDF that matches the mask
  for (const pdfPath of pdfFiles) {
    const pdfBytes = await fs.readFile(pdfPath);
    const pdf = await PDFDocument.load(pdfBytes);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  // Save the merged PDF
  const mergedPdfBytes = await mergedPdf.save();
  await fs.writeFile(outputFilePath, mergedPdfBytes);  
}

async function mergePDFsFromDirectoryWithLabels(directoryPath, outputFilePath, fileMask = /\.pdf$/) {
  const mergedPdf = await PDFDocument.create();
  const pdfFiles = (await fs.readdir(directoryPath))
    .filter(file => fileMask.test(file))
    .sort((f, s) => s.substring(4, 8).localeCompare(f.substring(4, 8)))
    .map(file => path.join(directoryPath, file));
  let font = await mergedPdf.embedFont(StandardFonts.Helvetica);
  let pagesCount = [];
  for (const pdfPath of pdfFiles) {
    const pdfBytes = await fs.readFile(pdfPath);
    const pdf = await PDFDocument.load(pdfBytes);

    const fileName = path.basename(pdfPath);
    const labelName = `${fileName.substring(4, 8)} ${fileName.substring(2, 3)}`;

    const pages = pdf.getPages();
    pagesCount.push([fileName,pages.length])

    // Modify each page of the current PDF by adding a label with the filename
    for (const page of pages) {
      const { width, height } = page.getSize();
      const fontSize = 12;
      const textWidth = font.widthOfTextAtSize(labelName, fontSize);
      const textHeight = fontSize + 4;

      const [copiedPage] = await mergedPdf.copyPages(pdf, [pdf.getPageIndices()[pdf.getPages().indexOf(page)]]);
      mergedPdf.addPage(copiedPage);

      // Draw a "rotated" rectangle for background by adjusting width and height to align with text rotation
      copiedPage.drawRectangle({
        x: 0, // Adjust for margin from left side
        y: height - textWidth - 50, // Adjust for margin from the top
        width: textHeight, // Narrow width to fit vertically
        height: textWidth + 100, // Height of the rectangle accommodates text length
        color: rgb(0.9, 0.9, 0.9), // Light gray background color
        opacity: 0.8 // Slight tranparency for background
      });

      // Add the filename label on the left side of each page
      copiedPage.drawText(labelName, {
        x: 12, // Adjust x position for the margin
        y: height - textWidth - 20, // Adjust y position near the top of the page
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
        rotate: degrees(90) // Rotate text for a vertical label in radians
      });
    }
    
    // // Copy all modified pages to the merged PDF
    // const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    // copiedPages.forEach(page => mergedPdf.addPage(page));
  }

  // Save the merged PDF
  const mergedPdfBytes = await mergedPdf.save();
  await fs.writeFile(outputFilePath, mergedPdfBytes);
  return pagesCount;
}

async function saveJsonToFile(filePath, jsonData) {
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
async function readJsonFromFile(filePath) {
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

async function fileExists(filePath) {
  try {
      await fs.access(filePath);
      return true;
  } catch {
      return false;
  }
}

const subDir = `${subject}-${period}`
const outputDir = path.resolve('./src/assets/pdf', subDir);
const jsonDataFilePath = path.join(outputDir,"data.json");

let outputData = {}
if (!(await fileExists(jsonDataFilePath))){
  const entries = await processSubDirectory(path.resolve('./generated', subDir), outputDir);
  outputData = Object.fromEntries(entries);
  await saveJsonToFile(jsonDataFilePath, outputData)
}
else {
  outputData = await readJsonFromFile(jsonDataFilePath)
}

process.stdout.write(JSON.stringify(outputData));