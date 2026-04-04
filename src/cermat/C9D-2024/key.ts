import { optionBool, group, wordsGroup, sortedOptions, words, option, tasks4Max2Points, threePoints, fourPoints, rootGroup, word, match } from "../../utils/quiz-builder";

const form = rootGroup({
  code: 'C9PDD24C0T04',
  maxPoints: 50,
  questions: {
      closed: 24,
      opened: 6
  }
}, {
1: option("D"),
2: option("C"),
3: option("B"),
4: option("B"),
5: group({
  5.1: wordsGroup({ podmět: "radní", přísudek: "musí projednat" }),
  5.2: wordsGroup({ podmět: 'ty', přísudek: 'bys pomohla' }),
}),
6: group({
  6.1: option("D"),
  6.2: option("A"),
  6.3: option("E"),
}),
7: group({
  7.1: optionBool(false),
  7.2: optionBool(false),
  7.3: optionBool(false),
  7.4: optionBool(true),
},tasks4Max2Points),
8: option("C"),
9: option("C"),
10: option("D"),
11: option("B"),
12: words('kromě, díky, podle', threePoints),
13: group({
  13.1: optionBool(false),
  13.2: optionBool(false),
  13.3: optionBool(true),
  13.4: optionBool(true),
},tasks4Max2Points),
14: words('zauzený, zneuctěný, samouk', threePoints),
15: sortedOptions(['B', 'D', 'A', 'F', 'E', 'C', ], threePoints),
16: words('bezobratlých, spletly, změti, zpočátku', fourPoints),
17: option("C"),
18: match(/^(honit|honiti)$/),
19: group({
19.1: optionBool(true),
19.2: optionBool(false),
19.3: optionBool(false),
19.4: optionBool(true),
},tasks4Max2Points),
20: option("A"),
21: option("B"),
22: option("A"),
23: option("C"),
24: option("D"),
25: group({
  25.1: optionBool(true),
  25.2: optionBool(false),
  25.3: optionBool(false),
  25.4: optionBool(false),
},tasks4Max2Points),
26: option("A"),
27: option("A"),
28: option("D"),
29: group({
  29.1: word("uznávaného"),
  29.2: word("vyhovujícímu"),
}),
30: group({
  30.1: option("E"),
  30.2: option("A"),
  30.3: option("F"),
  30.4 : option("B"),
})
});
export default form