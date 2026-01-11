import _20250106 from './2026-01-06/index';

import { createLazyMap } from '../utils/deduce-utils';

//re export - due to static server rendering
export { inferenceRuleWithQuestion } from '../math/math-configure'
export { formatPredicate } from '../utils/deduce-utils';
export { formatSequencePattern } from '../components/math';

export default createLazyMap({  
  "2026-01-06": () => _20250106,
})