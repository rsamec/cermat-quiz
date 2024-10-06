const range = (start, end) => Array.from(
  Array(Math.abs(end - start) + 1), 
  (_, i) => start + i
);
const quizLangCategories = ["AJA-2023", "AJB-2023", "AJA-2024", "AJB-2024", "DEA-2023"].reduce(
  (out, d) => {
    out[d] = {
      questions: [
        [1, 2, 3, 4],
        range(5, 13),
        range(13,21),
        range(21,25),
        range(25,30),
        range(30,40),
        range(40,45),
        range(45,50),
        range(50,60),
        range(60,65),        
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