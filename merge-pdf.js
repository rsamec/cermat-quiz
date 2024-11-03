// const fs = require('fs');
// const path = require('path');
// const { PDFDocument } = require('pdf-lib');
import fs from 'fs/promises';
import path from 'path';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
// Recursive function to process all subdirectories and merge PDFs
async function processDirectory(directoryPath) {
  const items = await fs.readdir(directoryPath, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(directoryPath, item.name);

    if (item.isDirectory()) {
      // Process each subdirectory recursively
      const outputFilePath = path.join(fullPath, 'merged.pdf');
      await mergePDFsFromDirectory(fullPath, outputFilePath);
      await processDirectory(fullPath);
    }
  }
}

async function processSubDirectory(directoryPath) {
  const items = await fs.readdir(directoryPath, { withFileTypes: true });

  let out = [];

  for await (const item of items) { 
    const fullPath = path.join(directoryPath, item.name);

    if (item.isDirectory()) {
      // Process each subdirectory recursively
      const outputFilePath = path.join(directoryPath, `${item.name}-merged.pdf`);
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
  console.log(`PDFs from ${directoryPath} merged successfully into ${outputFilePath}`);
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
    pagesCount.push([fileName,pages.count])

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
  console.log(`PDFs from ${directoryPath} merged successfully with labels into ${outputFilePath}`);
  return pagesCount;
}
// Get command-line arguments
const args = process.argv.slice(2);
const directoryPath = args[0] || './generated'; // Default directory if not provided


const dirs = ['cz-diploma', 'cz-4', 'math-4']
// Function to reduce information
async function processAll(subDirs) {
  const output = [];

  for await (const subDir of subDirs) {
    const out = await processSubDirectory(path.resolve(directoryPath, subDir));
    output.push([subDir, Object.fromEntries(out)]);
  }

  return output;


}
// Run the merge function with the provided arguments
//processSubDirectory(path.resolve(directoryPath,"cz-diploma"))

const output = await processAll(dirs);
console.log(output)