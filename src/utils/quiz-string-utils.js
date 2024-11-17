export const baseDomain = "https://raw.githubusercontent.com/rsamec/cermat/refs/heads/main";
export const baseDomainPublic = `${baseDomain}/public`;

export function formatPdfFileName({pageSize, columnsCount, orientation}){
  return `${pageSize}-sloupce-${columnsCount}${orientation == 'landscape' ? '-landscape':''}`
}

export function normalizeImageUrlsToAbsoluteUrls(markdown, segments) {
  const regex = /\]\((.*?)\)/g;
  const replacedMarkdown = markdown.replace(regex, (match, imageUrl) => {
    const modifiedImageUrl = segments.concat(imageUrl.replace('./', '')).join('/');
    // Reconstruct the markdown with the modified image URL
    return `](${modifiedImageUrl})`;
  });
  return replacedMarkdown;
}

export function parseCode(code) {
  const subject = code[0] === "C" ? 'cz' : code[0] === "M" ? 'math' : code[0] === "A" ? 'en' : code[0] === "D" ? 'de' : null;
  const grade = code[1];
  const period = grade == 5 ? "8" : grade == 7 ? "6" : grade == 9 ? "4" : "diploma"
  const order = code[2];

  const year = code.slice(-4);
  return { subject, grade, order, period, year }
}

export function formatGrade(grade) {
  switch (grade) {
    case "9":
      return "čtyřleté";
    case "7":
      return "šestileté";
    case "5":
      return "osmileté";
    default:
      return "maturita";
  }
}

export function formatSubject(subject) {
  switch (subject) {
    case "cz":
      return "Čeština";
    case "math":
      return "Matika";
    case "en":
      return "Angličtina";
    case "de":
      return "Němčina";
    default:
      return subject;
  }
}

export function formatPeriod(period) {
  switch (period) {
    case '4':
      return "čtyřleté";
    case '6':
      return "šestileté";
    case '8':
      return "osmileté";
    default:
      return "maturita";
  }
}
export function formatCode(code) {
  const { subject, grade, order, year, period } = parseCode(code);
  return `${formatSubject(subject)} ${formatGrade(grade)} ${year} ${formatVersion({ order, period })}`;
}
export function formatShortCode(code) {
  const { order, year, period } = parseCode(code);
  return `${year} - ${formatVersion({ order, period })}`;
}
export function formatVersionByCode(code) {
  const { order, period } = parseCode(code);
  return formatVersion({ order, period });
}

export function formatVersion({ order, period } = {}) {

  let version = order;
  if (period === "diploma") {
    version = order === "A" ? "jaro" : order === "B" ? "podzim" : order;
  } else {
    version =
      order === "A"
        ? "1.řádný"
        : order === "B"
          ? "2.řádný"
          : order === "C"
            ? "1.náhr."
            : order === "D"
              ? "2.náhr."
              : order;
  }
  return version;
}