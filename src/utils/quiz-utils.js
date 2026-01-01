const langCategories = ({
  LISTENING_1: "Poslech - volba obrázková",
  LISTENING_2: "Poslech - volba Ano-Ne",
  LISTENING_3: "Poslech - krátká odpověď",
  LISTENING_4: "Poslech - volba textová",
  READING_5: "Porozumění krátký text",
  READING_6: "Porozumění informační text",
  READING_7: "Porozumění dlouhý text",
  READING_8: "Přirazení textu k jeho významu",
  GRAMMER_9: "Doplnění slov do textu - volba",
  GRAMMER_10: "Doplnění slov do textu",

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


const generateCode = (code, variants, years = [2023, 2024]) =>
  years.flatMap(year => variants.flatMap(v => `${code}${v}-${year}`));

export const quizes = [
  { subject: 'en', period: 'diploma', tasksRate: 64, codes: ["AJA-2023", "AJB-2023", "AJA-2024", "AJB-2024"] },
  { subject: 'de', period: 'diploma', tasksRate: 64, codes: ["DEA-2023"] },
  { subject: 'cz', period: '8', tasksRate: 28, codes: generateCode("C5", ["A"]).concat("C5B-2023") },
  { subject: 'cz', period: '4', tasksRate: 30, codes: generateCode("C9", ["A", "B", "C", "D"]).concat("C9I-2025", "C9A-2025") },
  { subject: 'cz', period: '6', tasksRate: 28, codes: generateCode("C7", ["A"]) },
  { subject: 'cz', period: 'diploma', tasksRate: 32, codes: generateCode("CM", ["A", "B"]) },
  { subject: 'math', period: '8', tasksRate: 14, codes: generateCode("M5", ["A"]).concat("M5A-2025", "M5B-2025") },
  { subject: 'math', period: '4', tasksRate: 16, codes: generateCode("M9", ["A", "B", "C", "D"], [2023, 2024, 2025]).concat("M9I-2025") },
  { subject: 'math', period: '6', tasksRate: 16, codes: generateCode("M7", ["A"]).concat("M7A-2025", "M7B-2025", "M7I-2018") },
  { subject: 'math', period: 'diploma', tasksRate: 25, codes: ["MMA-2025", "MMA-2023", "MMB-2023"] },
  //{ subject: 'math', period: 'diploma', codes:[]},
]

// export const quizes = [
//   { subject: 'en', period: 'diploma', codes: ["AJA-2023", "AJB-2023", "AJA-2024", "AJB-2024"] },
//   { subject: 'de', period: 'diploma', codes: ["DEA-2023"] },
//   { subject: 'cz', period: '8', codes: generateCode("C5", ["A", "B"]) },
//   { subject: 'cz', period: '4', codes: generateCode("C9", ["A", "B", "C", "D"]) },
//   { subject: 'cz', period: '6', codes: generateCode("C7", ["A", "B"]) },
//   { subject: 'cz', period: 'diploma', codes: generateCode("CM", ["A", "B"]) },
//   { subject: 'math', period: '8', codes: generateCode("M5", ["A", "B"]) },
//   { subject: 'math', period: '4', codes: generateCode("M9", ["A", "B", "C", "D"]) },
//   { subject: 'math', period: '6', codes: generateCode("M7", ["A", "B"]) },
//   { subject: 'math', period: 'diploma', codes: [] },
// ]
export const printedPages = [2, 3, 4].map(columnsCount => ({ pageSize: 'A4', columnsCount, orientation: 'landscape' }))
  .concat([1, 2, 3].map(columnsCount => ({ pageSize: 'A4', columnsCount, orientation: 'portrait' })))
  .concat([4, 5, 6, 7, 8].map(columnsCount => ({ pageSize: 'A3', columnsCount, orientation: 'landscape' })))
  .concat([3, 4, 5, 6].map(columnsCount => ({ pageSize: 'A3', columnsCount, orientation: 'portrait' })));



export const predicatesCategories = new Map([
  ["Hodnota", ["cont"]],
  ["Porov. rozdílem", ["comp", "comp-diff", "diff"]],
  ["Porov. podílem", ["comp-ratio", "complement-comp-ratio"]],
  ["Část z celku", ["ratio", "complement"]],
  ["Část ku části", ["ratios", "nth-part", "ratios-invert", "alligation"]],
  ["Stav/změna stavu", ["delta", "transfer"]],
  ["Rozdělování", ["rate", "quota", "frequency"]],
  ["Seskupování", ["sum", "sum-combine", "product", "product-combine"]],
  ["Úměrnosti", ["proportion"]],
  ["Škálování", ["scale", "scale-invert", "nth-factor", "nth-scale"]],
  ["Posuny", ["slide", "slide-invert", "reverse"]],
  ["Převod jednotek", ["unit"]],
  ["Zaokrouhlování", ["round"]],
  ["NSN, NSD", ["gcd", "lcd"]],
  ["Výrazy, vzorce", ["eval-formula", "eval-expr", "simplify-expr"]],
  ["Proměnné, rovnice", ["linear-equation"]],
  ["Pythagorova věta", ["pythagoras"]],
  ["Vztahy úhlů", ["comp-angle", "triangle-angle"]],
  ["Vzory opakování", ["sequence", "nth", "pattern", "balanced-partition"]],
  ["Selský rozum", ["common-sense"]],
  ["Vyhodnocení", ["eval-option"]],
  
])

export const rulesCategories = new Map([
  ["Porovnání rozdílem", [`compareRule`, 'toCompareRule', `compareDiffRule`, 'toCompareDiffRule', 'toDifferenceRule', 'partEqualRule']],
  ["Porovnání poměrem", [`ratioCompareRule`, 'toRatioCompareRule', "toDifferenceAsRatioRule", "ratioCompareToCompareRule"]],
  ["Část z celku", ["partToWholeRule", "toPartWholeRatio","partWholeComplementRule"]],
  ["Část ku části", ["partToPartRule", "toRatiosRule"]],
  ["Propojení poměru s část–celek", ["partWholeCompareRule", "toPartWholeCompareRule","invertRatioCompareRule", "invertRatiosRule", "reverseRatiosRule"]],
  ["Propojení poměru s část-část", ["compRatiosToCompRule", "convertRatioCompareToRatiosRule"]],
  ["Převod mezi část-celek a poměrem", ['convertPartWholeToRatioCompareRule', 'convertRatioCompareToRatioRule']],
  ["Převod mezi část-část a poměrem", ["convertRatioCompareToTwoPartRatioRule", "convertTwoPartRatioToRatioCompareRule"]],
  ["Převod část-část na část-celek", ["convertPartToPartToPartWholeRule"]],
  ["Převod mezi poměrem a procentem", ["togglePartWholeAsPercentRule", "convertPercentRule"]],
  ["Řetězení poměrů", [`transitiveRatioCompareRule`, "transitiveCompareRule", "transitiveRatioRule", "transitiveRateRule"]],

  ["Spojování", [`sumRule`, `productRule`]],
  ["Rozdělení (rovnoměrně)", [`rateRule`, "toRateRule"]],
  ["Rozdělení dle kvóty", [`quotaRule`, "toQuotaRule"]],
  ["Rozdělení dle rate", ["compareToRateRule"]],

  ["Úměrnosti", [`proportionRule`, "proportionTwoPartRatioRule"]],
  ["Změny stavu", [`deltaRule`, "toDeltaRule", `transferRule`]],
  
  ["NSD, NSN", [`gcdRule`, 'lcdRule']],

  ["Převod jednotek", [`convertToUnitRule`]],
  ["Zaokrouhlení", [`roundToRule`]],
  // ["Rozklad čísla na prvočinitele", ["primeFactorizationRule"]],
  ["Rozklady a uspořádání", ["splitDecimalAndFractionPartsRule", "tupleRule"]],

  ["Pythagorovy věta", [`pythagorasRule`]],
  ["Vztahy úhlů", [`angleCompareRule`, "triangleAngleRule"]],

  ["Posuny", ["toSlideRule"]],
  ["Škálování", ["scaleRule"]],
  ["Škálování část-část", ["mapRationsByFactorRule", "nthPartFactorByRule", "nthPartScaleByRule"]],

  ["Míšení(aligace)", ["alligationRule"]],

  ["Výraz, vzorec", ["evalToQuantityRule", "simplifyExprRule", "evalQuotaRemainderExprRule"]],
  ["Řešení rovnice", ["solveEquationRule"]],

  ["Vzor opakování", ["sequenceRule","nthTermRule","nthPositionRule"]],
  ["Vyvážené rozdělování", ["balancedPartitionRule"]],

  ["Vyhodnocení", ["evalToOptionRule"]],
  ["Selský rozum", ["commonSense"]],

])

