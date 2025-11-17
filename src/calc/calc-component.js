import { html as rhtml } from '../utils/reactive-htl.js';
import { computed } from '@preact/signals-core';
import mdPlus from "../utils/md-utils.js";
import { formatPredicate } from "../utils/deduce-utils.js";

import { inferenceRuleWithQuestion } from "../math/math-configure.js";



export function renderCalc({ context$, currentState$, nextEvents$, axioms, actor, steps, key }) {

    const insertSeparators = (arr, sep = () => rhtml`<i class="fa-solid fa-link yellow"></i>`) => arr.flatMap((v, i, a) => i < a.length - 1 ? [v, sep()] : [v])
    const wrapWithBadge = ({ predicate, badge }) => badge != null ? rhtml`<div class="h-stack" style="justify-content:space-between"><div class="badge badge--${badge.type}">${badge.text}</div><div class="badge">${predicate.kind}</div></div>` : rhtml`<div class="badge" style="align-self:flex-end;">${predicate.kind}</div>`
    const inferToMessage = (predicates) => {
        try {
            const result = inferenceRuleWithQuestion(predicates.concat({}))
            return result != null ? mdPlus.unsafe(formatPredicate(result.result)) : null
        }
        catch (e) {
            return rhtml`<span class='red'>${e}</span>`;
        }
    }

    const play = async () => {
        for (let j = 0; j != steps.length; j++) {
            for await (let value of steps[j]) {
                await new Promise((resolve) => setTimeout(() => {
                    actor.send({ type: 'next', value })
                    return resolve();
                }, 300));
            }
            await new Promise((resolve) => setTimeout(() => {
                actor.send({ type: 'deduce' })
                if (j != steps.length - 1) actor.send({ type: 'delete' })
                return resolve();
            }, 500));
        }
    }
    

    return rhtml`<div class="grid grid-cols-2 calc" style="grid-auto-rows: auto;">
<div class="v-stack v-stack--s">
    <div class="h-stack h-stack--m"><div style="flex:1;"><span class="badge">Úloha ${key}</span></div><span class=${computed(() => currentState$.value == "Error state" ? 'badge badge--danger' : currentState$.value == "Success state" ? 'badge badge--success' : 'badge')}>${computed(() => currentState$.value)}</span></div>
    <div class="calc-display">
        <div class="calc-display__input">${computed(() => insertSeparators(context$.value.predicates.map(d => rhtml`${mdPlus.unsafe(formatPredicate(d))}`)))}</div>
        <div class="calc-display__output">${computed(() => context$.value.predicates.length > 1 ? inferToMessage(context$.value.predicates) : '')}</div>
    </div>

    <div class="calc-buttons__common">
        <div class="calc-buttons__common--start">
            <button class="btn--calc" disabled=${computed(() => !nextEvents$.value.includes('reset'))} onclick=${() => actor.send({ type: 'reset' })} title="Smazat kompletně"><i class="fa-solid fa-c font-large"></i></button>
            <button class="btn--calc" disabled=${computed(() => currentState$.value != "Initial state")} onclick=${() => play()} title="Spustit"><i class="fa-solid fa-play  font-large"></i></button>            
        </div>
        <div class="calc-buttons__common--end">
            <button class="btn--calc" disabled=${computed(() => !nextEvents$.value.includes('deduce'))} onclick=${() => actor.send({ type: 'deduce' })} title="Vyhodnotit"><i class="fa-solid fa-equals  font-large"></i></button>
            <button class="btn--calc" disabled=${computed(() => !nextEvents$.value.includes('delete'))} onclick=${() => actor.send({ type: 'delete' })} title="Smazat poslední zadaný"><i class="fa-solid fa-delete-left  font-large"></i></button>            
        </div>
    </div>

    <div class="calc-buttons__axioms">${axioms.map(d => rhtml`<button class="btn--calc v-stack v-stack--s" disabled=${computed(() => !nextEvents$.value.includes('next'))} onclick=${() => actor.send({ type: 'next', value: d })}>${wrapWithBadge({ predicate: d, ...(d.label && { badge: { type: 'input', text: d.label } }) })}<div style="flex:1;align-content:center">${mdPlus.unsafe(formatPredicate(d))}</div></button>`)}</div>
    <div class="calc-buttons__deductions">
      ${computed(() => context$.value.steps.map((d, i) => rhtml`<div class="h-stack">
        <button class="btn--calc v-stack v-stack--s" disabled=${computed(() => !nextEvents$.value.includes('next'))} onclick=${() => actor.send({ type: 'next', value: d })}>${wrapWithBadge({ predicate: d, badge: { type: 'deduce', text: i + 1 } })}<div style="flex:1;align-content:center">${mdPlus.unsafe(formatPredicate(d))}</div></button>
        <button class="btn--calc" style="min-width:auto" disabled=${computed(() => !nextEvents$.value.includes('remove'))} onclick=${() => actor.send({ type: 'remove', value: d })}><i class="fa-solid fa-trash" style="align-self:center"></i></button></div>`))}        
    </div>
</div>
<div class="v-stack v-stack--m">
${computed(() => context$.value.history.map(h => {
        return [h,inferenceRuleWithQuestion(h.concat({}))]
    }).map(([h,d], i) => {
        const promises = rhtml`<details><summary>Predikáty ${h.length}</summary><div class="v-stack v-stack--s">${h.map(d => mdPlus.unsafe(formatPredicate(d)))}</div></details>`;
        const counter = i + 1;
        const option = d.options?.find(opt => opt.ok);
        const message = option == null
            ? rhtml`<div class="v-stack"><div class="h-stack h-stack--s"><span class="badge badge--deduce">${counter}</span>${mdPlus.unsafe(formatPredicate(d.result))}</div>${promises}</div>`
            : rhtml`<div class="v-stack"><div class="h-stack h-stack--s"><span class="badge badge--deduce">${counter}</span>${mdPlus.unsafe(formatPredicate(d.result))}</div>
    <div>Dotaz: <span>${d.question}</span></div>    
    <div>Výpočet: <span>${option.tex} = ${option.result}</span></div>
    ${promises}
    </div>`
        return message;
    }))}
</div>
</div>

</div>`
}
