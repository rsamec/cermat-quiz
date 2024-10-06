const generateCode = (code, variants ) => 
  [2023,2024].flatMap(year => variants.flatMap(v => `${code}${v}-${year}`));

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