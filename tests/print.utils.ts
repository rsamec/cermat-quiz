// Define a union type for allowed page sizes
export type PageSize =
  | "A4"
  | "A3"
  | "A5"
  | "A6"
  | "Letter"
  | "Legal"
  | "Tabloid"
  | "A0"
  | "A1"
  | "A2";

export type PageOrientation = 'portrait' | 'landscape';
const pageDimensions: Record<PageSize, { width: number; height: number }> = {
  Letter: { width: 612, height: 792 },    // 8.5" x 11"
  Legal: { width: 612, height: 1008 },    // 8.5" x 14"
  Tabloid: { width: 792, height: 1224 },  // 11" x 17"
  A0: { width: 2384, height: 3370 },      // ISO A0
  A1: { width: 1684, height: 2384 },      // ISO A1
  A2: { width: 1191, height: 1684 },      // ISO A2
  A3: { width: 842, height: 1191 },       // ISO A3
  A4: { width: 595, height: 842 },        // ISO A4
  A5: { width: 420, height: 595 },        // ISO A5
  A6: { width: 298, height: 420 },        // ISO A6
};

export function calculatePageScale(
  pageSize: PageSize,
  orientation: PageOrientation,
  columnWidth: number,
  numberOfColumns: number,
  margin: number = 0
): number {
  // Define dimensions for Puppeteer-supported paper sizes in points (1 inch = 72 points)


  // Get dimensions based on the selected page size and orientation
  let pageWidth: number, pageHeight: number;
  if (orientation === "portrait") {
    pageWidth = pageDimensions[pageSize].width;
    pageHeight = pageDimensions[pageSize].height;
  } else if (orientation === "landscape") {
    pageWidth = pageDimensions[pageSize].height;
    pageHeight = pageDimensions[pageSize].width;
  } else {
    throw new Error("Invalid orientation. Use 'portrait' or 'landscape'.");
  }
  const dpi = 96;
  // calculate in pixels
  pageWidth = (pageWidth / 72) * dpi
  // Calculate the usable width within the margins
  const usableWidth = pageWidth - (2 * margin); // Apply margin to both sides

  // Calculate the total width needed for all columns
  const totalColumnWidth = columnWidth * numberOfColumns;
  //console.log(usableWidth, ` ${totalColumnWidth} = ${columnWidth} * ${numberOfColumns}`)

  // Calculate the scale factor
  const scaleFactor = usableWidth / totalColumnWidth;

  return scaleFactor;
};
