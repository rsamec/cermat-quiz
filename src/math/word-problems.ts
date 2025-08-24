


import M7A_2023 from './M7A-2023/index';
import M7A_2024 from './M7A-2024/index';
import M7A_2025 from './M7A-2025/index';
import M7B_2025 from './M7B-2025/index';

import M5A_2023 from './M5A-2023/index';

import M5A_2024 from './M5A-2024/index';
import M5A_2025 from './M5A-2025/index';
import M5B_2025 from './M5B-2025/index';
import M9A_2023 from './M9A-2023/index';
import M9B_2023 from './M9B-2023/index';
import M9C_2023 from './M9C-2023/index';
import M9D_2023 from './M9D-2023/index';
import M9A_2024 from './M9A-2024/index';
import M9B_2024 from './M9B-2024/index';
import M9I_2025 from './M9I-2025/index';
import M9A_2025 from './M9A-2025/index';
import M9B_2025 from './M9B-2025/index';
import MMA_2025 from './MMA-2025/index';
import { createLazyMap } from '../utils/deduce-utils';

//re export - due to static server rendering
export { inferenceRuleWithQuestion } from '../math/math-configure'
export { formatPredicate } from '../utils/deduce-utils';
export { formatSequencePattern } from '../components/math';

export default createLazyMap({  
  "M5A-2023": () => M5A_2023,
  "M5A-2024": () => M5A_2024,
  "M5A-2025": () => M5A_2025,
  "M5B-2025": () => M5B_2025,
  "M7A-2023": () => M7A_2023,
  "M7A-2024": () => M7A_2024,
  "M7A-2025": () => M7A_2025,
  "M7B-2025": () => M7B_2025,

  "M9A-2023": () => M9A_2023,
  "M9B-2023": () => M9B_2023,
  "M9C-2023": () => M9C_2023,
  "M9D-2023": () => M9D_2023,
  "M9A-2024": () => M9A_2024,
  // "M9C-2024": {
  //   1: pocetObyvatel({ input: { celkem: 86_200, jihlavaPlus: 16_000 } }),
  //   12: sourozenci({ input: { evaPodil: 40, michalPlus: 24, zbyvaNasporit: 72 } }),
  // },
  "M9B-2024": () => M9B_2024,
  "M9I-2025": () => M9I_2025,
  "M9A-2025": () => M9A_2025,
  "M9B-2025": () => M9B_2025,
  "MMA-2025": () => MMA_2025,
})
