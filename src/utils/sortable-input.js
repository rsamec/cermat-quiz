import { html } from "npm:htl";
import Sortable from 'sortablejs/modular/sortable.core.esm.js';

export function sortableInput(array, options = {}) {
  let {
    format = d => d,
    footer,
    label
  } = options;


  let list = html`<label>${label}</label><ul class="sortable sortable__list" >`;

  array.forEach((d, i) => {
    let li = html`<li class="sortable__item" value=${i}>${format(d)}</li>`;
    //li.style.cssText += itemStyle;
    list.append(li);
  });

  let form = footer !== null ? html`<div>${list}${footer}</div>` : list;

  let listValue = () => {
    let result = [];
    for (let li of list.querySelectorAll("li")) {
      result.push(array[parseInt(li.value, 10)]);
    }
    return result;
  };

  form.value = listValue();

  var sortable = Sortable.create(list, {
    onSort: () => {
      form.value = listValue();
      form.dispatchEvent(new CustomEvent('input'));
    },
    onUpdate: () => {
      form.value = listValue();
      console.log(form.value)
      form.dispatchEvent(new CustomEvent('input', { bubbles: true }));
    }
  });

  return form;
}
