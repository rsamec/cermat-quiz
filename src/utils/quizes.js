const generateCode = (code, variants ) => 
  [2023,2024].flatMap(year => variants.flatMap(v => `${code}${v}-${year}`));

export const quizes = [
  { subject: 'en', period: 'diploma', codes: ["AJA-2023", "AJB-2023", "AJA-2024", "AJB-2024"] },
  { subject: 'de', period: 'diploma', codes: ["DEA-2023"] },
  { subject: 'cz', period: '8', codes:generateCode("C5",["A"]).concat("C5B-2023")},
  { subject: 'cz', period: '4', codes:generateCode("C9",["A","B"]).concat("C9C-2023")},
  { subject: 'cz', period: '6', codes:generateCode("C7",["A"])},
  { subject: 'cz', period: 'diploma', codes:generateCode("CM",["A","B"])},
  { subject: 'math', period: '8', codes:generateCode("M5",["A"])},
  { subject: 'math', period: '4', codes:generateCode("M9",["A","B","C","D"])},
  { subject: 'math', period: '6', codes:generateCode("M7",["A"])},
  //{ subject: 'math', period: 'diploma', codes:[]},
]


export function parseCode(code){
  const subject = code[0] === "C" ? 'cz': code[0] === "M" ? 'math' : code[0] === "A" ? 'en' :code[0] === "D" ? 'de' :null;
  const grade = code[1];
  const period = grade == 5 ? "8" : grade == 7 ? "6" : grade == 9 ? "4" : "diploma"   
  const order = code[2];
  
  const year = code.slice(-4);
  return {subject,grade,order, period, year}
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
  return `${formatSubject(subject)} ${formatGrade(grade)} ${year} ${version}`;
}
