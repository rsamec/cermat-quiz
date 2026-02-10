import _20250106 from './2026-01-06/index';
import _20250113 from './2026-01-13/index';
import _20250120 from './2026-01-20/index';
import _20250127 from './2026-01-27/index';
import _20250203 from './2026-02-03/index';
import _20250210 from './2026-02-10/index';

import { createLazyMap } from '../utils/deduce-utils';

//re export - due to static server rendering
export { inferenceRuleWithQuestion } from '../math/math-configure'
export { formatPredicate } from '../utils/deduce-utils';
export { formatSequencePattern } from '../components/math';

export default createLazyMap({  
  "2026-01-06": () => _20250106,
  "2026-01-13": () => _20250113,
  "2026-01-20": () => _20250120,
  "2026-01-27": () => _20250127,  
  "2026-02-03": () => _20250203,
  "2026-02-10": () => _20250210,
})