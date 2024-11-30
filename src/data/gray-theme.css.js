const styles = [...Array(65).keys()].map((d,i) =>  `
${i%2 === 0 ? `.group-${d} { background-color: color-mix(in srgb, var(--theme-foreground) 27%, var(--theme-background-a))}`:''}
${i%3 === 0 ? `.group-${d} { background-color: color-mix(in srgb, var(--theme-foreground) 14%, var(--theme-background-a))}`:''}
`).join("\n");

 process.stdout.write(styles);