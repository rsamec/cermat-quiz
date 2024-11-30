import invert from 'invert-color';
import {scaleOrdinal} from "d3-scale";
import {schemeTableau10} from "d3-scale-chromatic";

const color = scaleOrdinal([1,2,3,4,5,6,7,8,9,10], schemeTableau10);
const styles = [...Array(65).keys()].map((d,i) => `.group-${d} {
  background-color:${color(d)}; color:${invert(color(d), { black: '#3a3a3a', white: '#fafafa' })};
}`).join("\n");

 process.stdout.write(styles);