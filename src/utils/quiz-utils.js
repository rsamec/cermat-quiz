const langCategories = ({
  LISTENING_1:"Poslech - volba obrázková",
  LISTENING_2:"Poslech - volba Ano-Ne",
  LISTENING_3:"Poslech - krátká odpověď",
  LISTENING_4:"Poslech - volba textová",
  READING_5:"Porozumění krátký text",
  READING_6:"Porozumění informační text",
  READING_7:"Porozumění dlouhý text",
  READING_8:"Přirazení textu k jeho významu",
  GRAMMER_9:"Doplnění slov do textu - volba",
  GRAMMER_10:"Doplnění slov do textu",
  
})
export const categories = ({
  cz: {
    LITERARY_TEXT_UNDERSTANDING: "Porozumění uměleckému textu",
    NON_LITERARY_TEXT_UNDERSTANDING: "Porozumění neuměleckému textu",
    WORK_WITH_DEFINITION: "Práce s definicí",
    TEXT_COHERENCE: "Textová návaznost",
    STYLE: "Sloh",
    SPELLING_RULES_CLOSED: "Pravidla českého pravopisu: uzavřené úlohy",
    SPELLING_RULES_OPEN: "Pravidla českého pravopisu: otevřené úlohy",
    WORD_MEANING_RELATIONS: "Význam slov a významové vztahy",
    EMOTIVE_WORDS_FORMALITY: "Citově zabarvená slova, spisovnost/nespisovnost",
    FIXED_EXPRESSIONS: "Ustálená slovní spojení",
    PHONETICS_WORD_STRUCTURE: "Hlásky a stavba slov",
    RELATED_WORDS: "Slova příbuzná",
    SENTENCE_MEMBERS_SUBORDINATE_CLAUSES:
      "Větné členy, vedlejší věty, významové poměry",
    SENTENCE_CONSTRUCTION: "Výstavba věty jednoduché a souvětí",
    DIRECT_INDIRECT_SPEECH: "Přímá/nepřímá řeč",
    PARTS_OF_SPEECH: "Slovní druhy",
    GRAMMATICAL_CATEGORIES: "Mluvnické kategorie",
    WORD_FORMS: "Tvary slov",
    LITERATURE: "Literatura"
  },
  math: {
    NUMBER_OPERATIONS: "Číslo a početní operace",
    NUM_EXPRESSIONS: "Číselné výrazy, zlomky, desetinná čísla, mocniny",
    VARIABLE_EXPRESSIONS: "Výrazy s proměnnou",
    UNIT_CONVERSIONS: "Převody jednotek",
    POLYNOMIALS: "Počítání s mnohočleny",
    LINEAR_EQUATIONS: "Lineární rovnice, soustavy rovnic",
    WORD_PROBLEMS: "Slovní úlohy na číselné obory, rovnice a jejich soustavy",
    GRAPHS_SCHEMES_TABLES: "Grafy, schémata, tabulky",
    PROPORTIONS: "Přímá, nepřímá úměrnost",
    RATIOS_MAPS: "Poměr, mapa",
    PERCENTAGES: "Procenta",
    PYTHAGORAS_THEOREM: "Pythagorova věta",
    PLANE_GEOMETRY: "Geometrie v rovině",
    SOLID_GEOMETRY: "Geometrie v prostoru",
    CONSTRUCTION_PROBLEMS: "Konstrukční úlohy",
    APPLICATION_PROBLEMS: "Aplikační úlohy netypicky zadané",
    SYMMETRY: "Osová, středová souměrnost"
  },
  en: langCategories,
  de: langCategories
})

export function normalizeImageUrlsToAbsoluteUrls(markdown, segments) {
  const regex = /\]\((.*?)\)/g;
  const replacedMarkdown = markdown.replace(regex, (match, imageUrl) => {
    const modifiedImageUrl = segments.concat(imageUrl.replace('./', '')).join('/');
    // Reconstruct the markdown with the modified image URL
    return `](${modifiedImageUrl})`;
  });
  return replacedMarkdown;
}

const generateCode = (code, variants ) => [2023,2024].flatMap(year => variants.flatMap(v => `${code}${v}-${year}`));
export const quizes = [
  { subject: 'en', period: 'diploma', codes: ["AJA-2023", "AJB-2023", "AJA-2024", "AJB-2024"] },
  { subject: 'de', period: 'diploma', codes: ["DEA-2023"] },
  { subject: 'cz', period: '8', codes:generateCode("C5",["A","B"])},
  { subject: 'cz', period: '4', codes:generateCode("C9",["A","B","C","D"])},
  { subject: 'cz', period: '6', codes:generateCode("C7",["A","B"])},
  { subject: 'cz', period: 'diploma', codes:generateCode("CM",["A","B"])},
  { subject: 'math', period: '8', codes:generateCode("M5",["A","B"])},
  { subject: 'math', period: '4', codes:generateCode("M9",["A","B","C","D"])},
  { subject: 'math', period: '6', codes:generateCode("M7",["A","B"])},
  { subject: 'math', period: 'diploma', codes:[]},
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
  return `${formatSubject(subject)} ${formatGrade(grade)} ${year} ${formatVersion({order,period})}`;
}

export function formatVersion({order,period}={}){
  
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

export function convertTree(tree) {
  const isGroup = node => Object.keys(node?.children ?? {}).length > 0;
  const traverse = (id, node) => {
    if (isGroup(node)) {
      const children = []
      for (let key in node.children) {
        children.push(traverse(key, node.children[key]));
      }
      return {
        data: { id, node },
        children,
      }
    }
    else {
      return { data: { id, node }}
    }
  }
  return traverse("root", tree)
}