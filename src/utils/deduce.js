///modified version from https://observablehq.com/@kelleyvanevert/deduction-trees
import { html } from "npm:htl";
export function deduce(...ts) {
  ts = ts.map(t => (t._proof || t.nodeName) ? t : html`${t}`);
  const proof = html`<div class="proof">
	  <div class="premises">
	  </div>
	  <div class="conclusion">
      <div class="le"></div>
      <div class="ct"></div>
      <div class="ri"></div>
	  </div>
	</div>`;

  // add conclusion
  // '.proof > .conclusion > .ct'
  const conclusion = ts.pop();
  proof.children[1].children[1].appendChild(conclusion);

  // add premises
  const prem = proof.children[0];
  let depth = 0;
  let width = ts.reduce((out,t) => out+=t._statistics?.width ?? 1, 0);
  ts.forEach((t, i) => {
    // add premiss
    prem.appendChild(t);

    // if the premiss is a sub-tree, white-out parts of the horizontal bar for aesthetic reasons
    if (t._proof) {
      depth = Math.max(t._statistics?.depth ?? 0, depth);      
      if (i == 0) {
        // '.proof > .conclusion > .le'
        //t.children[1].children[0].style['border-bottom'] = '2px solid var(--theme-foreground)';
      } else if (i + 1 == ts.length) {
        // '.proof > .conclusion > .ri'
        //t.children[1].children[2].style['border-bottom'] = '2px solid var(--theme-foreground)';
      }
    }

    // add a bit of spacing between premises
    if (i + 1 < ts.length) {
      prem.appendChild(html`<div class="premiss space" style="width: 2em;"></div>`);
    }
  });

  // so that future runs of this function can check that the node is a proof tree
  proof._proof = true;
  proof._statistics = {
    depth: depth + 1,
    width,
  }
  return proof;
}