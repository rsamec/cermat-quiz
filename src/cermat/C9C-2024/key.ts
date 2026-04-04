import { optionBool, group, wordsGroup, sortedOptions, words, option, tasks4Max2Points, threePoints, fourPoints, rootGroup, wordsGroupPattern, word } from "../../utils/quiz-builder";

const form = rootGroup({
  code: 'C9PCD24C0T03',
  maxPoints: 50,
  questions: {
      closed: 24,
      opened: 6
  }
}, {
1: option("A"),
2: option("B"),
3: option("C"),
4: option("B"),
5: group({
  5.1: wordsGroupPattern({ podmět: "(nejen) spánek, (ale i) strava", přísudek: "chybí" }),
  5.2: wordsGroup({ podmět: 'sklenice', přísudek: 'byly osvěžením' }),
}),
6: group({
  6.1: option("D"),
  6.2: option("B"),
  6.3: option("A"),
}),
7: group({
  7.1: optionBool(false),
  7.2: optionBool(true),
  7.3: optionBool(false),
  7.4: optionBool(true),
},tasks4Max2Points),
8: option("A"),
9: option("A"),
10: option("C"),
11: option("D"),
12: words('a, či, že', threePoints),
13: group({
  13.1: optionBool(true),
  13.2: optionBool(true),
  13.3: optionBool(true),
  13.4: optionBool(false),
},tasks4Max2Points),
14: words('nadávka, podíl, předlouhý', threePoints),
15: sortedOptions(['A', 'D', 'B', 'F', 'E', 'C', ], threePoints),
16: words('týdenní, nalákaly, soutěsky, extrémně', fourPoints),
17: option("C"),
18: word('nemastná'),
19: group({
19.1: optionBool(false),
19.2: optionBool(true),
19.3: optionBool(false),
19.4: optionBool(true),
},tasks4Max2Points),
20: option("B"),
21: option("C"),
22: option("A"),
23: option("D"),
24: option("D"),
25: group({
  25.1: optionBool(false),
  25.2: optionBool(true),
  25.3: optionBool(false),
  25.4: optionBool(false),
},tasks4Max2Points),
26: option("C"),
27: option("B"),
28: option("D"),
29: group({
  29.1: word("provedeného"),
  29.2: word("předloženou"),
}),
30: group({
  30.1: option("E"),
  30.2: option("A"),
  30.3: option("D"),
  30.4 : option("C"),
})
});
export default form