const range = (start, end) => Array.from(
  Array(Math.abs(end - start) + 1), 
  (_, i) => start + i
);
const quizLangCategories = ["AJA-2023", "AJB-2023", "AJA-2024", "AJB-2024", "DEA-2023"].reduce(
  (out, d) => {
    out[d] = {
      questions: [
        [1, 2, 3, 4],
        range(5, 12),
        range(13,20),
        range(21,24),
        range(25,29),
        range(30,39),
        range(40,44),
        range(45,49),
        range(50,59),
        range(60,64),        
      ].flatMap((arr, i) =>
        arr.map((d) => ({
          id: d,
          category:
            i < 4 ? `LISTENING_${i+1}` : i < 8 ? `READING_${i+1}` : `GRAMMER_${i+1}`
        }))
      )
    };
    return out;
  },
  {}
)

process.stdout.write(JSON.stringify(quizLangCategories));