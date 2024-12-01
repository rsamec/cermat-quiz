import invert from 'invert-color';
import {scaleOrdinal} from "d3-scale";
import {schemeTableau10} from "d3-scale-chromatic";

const color = scaleOrdinal([1,2,3,4,5,6,7,8,9,10], schemeTableau10);
const styles = [...Array(50).keys()].map((d,i) => `.group-${d} {
  background-color:${color(d)}; color:${invert(color(d), { black: '#3a3a3a', white: '#fafafa' })};
}
form {
  input[type="text"],input[type="number"],textarea { 
    color: var(--theme-foreground);
  }
}  
`).join("\n");

const common = `
.q { padding: 12px; }
.multi-column { gap: 0px; columns:24rem;}
masonry-layout .q { border-radius:16px;}
h1,h2,h3,h4,h5,h6 { color: inherit;}
`
 process.stdout.write(styles + '\n' + common);