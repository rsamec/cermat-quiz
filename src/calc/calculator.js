import { createMachine } from 'xstate';
import { inferenceRule, inferenceRuleWithQuestion } from "../components/math.js";
import { removeItemWithSlice } from '../utils/common-utils.js';

export function getNextEvents(snapshotValue) {
  return [...new Set([...snapshotValue._nodes.flatMap((sn) => sn.ownEvents)])];
}

export function getStateValueString(snapshotValue) {
  const stateValueString = snapshotValue._nodes
    .filter((s) => s.type === 'atomic' || s.type === 'final')
    .map((s) => s.id)
    .join(', ')
    .split('.')
    .slice(1)
    .join('.');
  return stateValueString;
}
const eps = 0.001
const closeTo = (value, center) => {
  const start = center - eps;
  const end = center + eps;
  return start <= value && value <= end;
}
export const calcMachine = createMachine({
  context: ({ input }) => ({
    predicates: [],
    steps: [],
    history: [],
    input,
  }),
  id: 'Untitled',
  initial: 'Initial state',
  states: {
    'Initial state': {
      on: {
        next: {
          target: 'Adding state',
          actions: ['add'],
        },
        // toggle: {
        //   target: 'Playing state',
        //   actions: ['reset']
        // }
      },
    },
    'Adding state': {
      on: {
        next: [
          {
            target: 'Adding state',
            actions: ['add'],
          },
        ],
        deduce: [
          {
            guard: { type: 'hasError' },
            target: 'Error state',
          },
          {
            guard: { type: 'isCorrect' },
            target: 'Success state',
            actions: ['deduce'],
          },
          {
            target: 'Adding state',
            actions: ['deduce'],
          },
        ],
        delete: [
          {
            target: 'Adding state',
            actions: ['deletePredicate'],
          },
        ],
        remove: [
          {
            target: 'Adding state',
            actions: ['removeStep'],
          },
        ],
        reset: [
          {
            target: 'Initial state',
            actions: ['reset'],
          },
        ],
      },
    },
    'Success state': {
      on: {
        next: [
          {
            target: 'Adding state',
            actions: ['add'],
          },
        ],
        delete: [
          {
            target: 'Adding state',
            actions: ['deletePredicate'],
          },
        ],
        remove: [
          {
            target: 'Adding state',
            actions: ['removeStep'],
          },
        ],
        reset: [
          {
            target: 'Initial state',
            actions: ['reset'],
          },
        ],
      },
    },
    'Error state': {
      on: {
        reset: [
          {
            target: 'Initial state',
            actions: ['reset'],
          },
        ],
      },
    },
  },
}).provide({
  actions: {
    add: ({ context, event }) => {
      // Add predicate
      context.predicates.push(event.value);
    },
    deduce: ({ context, event }) => {
      // Add your action code here
      const result = inferenceRule(...context.predicates);
      context.steps.push(result);
      context.history.push(context.predicates);
      context.predicates = [];
      context.predicates.push(result);
    },
    deletePredicate: ({ context, event }) => {
      // Add your action code here
      context.predicates.pop();
    },
    removeLastStep: ({ context, event }) => {
      // Add your action code here
      context.history.pop();
      context.steps.pop();
    },
    removeStep: ({ context, event }) => {
      // Add your action code here
      const index = context.steps.findIndex(d => d == event.value);
      if (index != -1) {
        context.steps = removeItemWithSlice(context.steps, index)
        context.history = removeItemWithSlice(context.history, index)
      }
    },
    reset: ({ context, event }) => {
      // Add your action code here
      context.predicates = [];
      context.steps = [];
      context.history = [];
    },  
  },
  guards: {
    hasError: ({ context, event }) => {
      if (context.predicates.length < 2) return true;
      let result = true;
      try {
        const result = inferenceRule(...context.predicates);
        return result == null;
      }
      catch (e) {
        console.error(e)
      }
      return result;
    },
    isCorrect: ({ context, event }) => {
      if (context.predicates.length < 2) return false;
      let result = false
      try {
        const result = inferenceRule(...context.predicates);
        if (result == null) {
          return false;
        }
        else {
          const { verifyBy } = context.input;
          const resultQuantity = (result.quantity ?? result.ratio);

          if (verifyBy.kind === "equal" && typeof verifyBy.args === "number") {
            if (result.kind === "comp-ratio" && result.asPercent) {
              return closeTo(Math.abs((resultQuantity - 1) * 100), verifyBy.args)
            }
            else {
              return closeTo(resultQuantity, verifyBy.args)
            }
          }
          else if (verifyBy.kind === "equalOption") {
            return result.value == verifyBy.args
          }
          else {
            return false;
          }
        }
      }
      catch (e) {
        console.error(e);
      }
      return result;
    },

  },
});