const styles = [...Array(65).keys()].map((d,i) =>  `
${i%2 === 0 ? `.group-${d} { background-color: color-mix(in srgb, var(--theme-foreground) 28%, var(--theme-background-a))}`:''}
${i%3 === 0 ? `.group-${d} { background-color: color-mix(in srgb, var(--theme-foreground) 14%, var(--theme-background-a))}`:''}
${i%4 === 0 ? `.group-${d} { background-color: color-mix(in srgb, var(--theme-foreground) 24%, var(--theme-background-a))}`:''}
${i%5 === 0 ? `.group-${d} { background-color: color-mix(in srgb, var(--theme-foreground) 8%, var(--theme-background-a))}`:''}

`).join("\n");

const common = `
.q { padding: 12px; }
.multi-column { gap: 0px; columns:24rem;}
masonry-layout .q { border-radius:16px;}
`
 process.stdout.write(styles + '\n' + common);