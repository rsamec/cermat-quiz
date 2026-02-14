import M9I_2026 from './M9I-2026/index';

import { createLazyMap } from '../utils/deduce-utils';

//re export - due to static server rendering
export { inferenceRuleWithQuestion } from '../math/math-configure'
export { formatPredicate } from '../utils/deduce-utils';
export { formatSequencePattern } from '../components/math';

export default createLazyMap({  
  "M9I-2026": () => M9I_2026,
})