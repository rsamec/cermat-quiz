import { optionBool, group, selfEvaluateText, wordsGroup, sortedOptions, words, option, tasks4Max2Points, threePoints, fourPoints, twoPoints, rootGroup } from "../../utils/quiz-builder";

const form = rootGroup({
  code: 'C9PCD23C0T03',
  maxPoints: 50,
  questions: {
      closed: 24,
      opened: 6
  }
}, {
1: option("D"),
2: option("D"),
3: option("A"),
4: option("A"),
5: option("C"),
6: option("C"),
7: group({
  7.1: option("E"),
  7.2: option("A"),
  7.3: option("B"),
}),
8: group({
  8.1: optionBool(true),
  8.2: optionBool(false),
  8.3: optionBool(false),
  8.4: optionBool(false),
},tasks4Max2Points),
9: option("A"),
10: option("D"),
11: option("C"),
12: words('netvorovi, příteli, bytu', threePoints),
13: group({
  13.1: optionBool(true),
  13.2: optionBool(true),
  13.3: optionBool(true),
  13.4: optionBool(true),
},tasks4Max2Points),
14: group({
  14.1: wordsGroup({ podmět: 'porada', přísudek: 'přesvědčila' }),
  14.2: wordsGroup({ podmět: 'nápad', přísudek: 'není praštěný' }),
}),
15: sortedOptions(['B', 'E', 'C', 'F', 'A', 'D', ], threePoints),
16: group({
  16.1: words("pořádaném"),
  16.2: words("článkem"),
}),
17: option("B"),
18: words('zvolí,poměrně,zkušené,nedotčené', fourPoints),
19: group({
19.1: optionBool(true),
19.2: optionBool(true),
19.3: optionBool(false),
19.4: optionBool(false),
},tasks4Max2Points),
20: option("B"),
21: option("D"),
22: option("C"),
23: option("B"),
24: group({
  24.1:  words("občerstvení"),
  24.2: words("dávka"),
  
}),
25: group({
  25.1: optionBool(true),
  25.2: optionBool(false),
  25.3: optionBool(false),
  25.4: optionBool(false),
},tasks4Max2Points),
26: option("A"),
27: option("D"),
28: group({
  28.1: words("přívlastek"),
  28.2: words("předmět"),

}),
29: option("A"),
30: group({
  30.1: option("D"),
  30.2: option("E"),
  30.3: option("C"),
  30.4 : option("A"),
})
});
export default form