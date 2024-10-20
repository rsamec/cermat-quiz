export function getTestUrl(...pathes:string[]){
  return ['http://localhost:3000'].concat(...pathes).join("/");
}
