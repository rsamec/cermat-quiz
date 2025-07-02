import mermaid from "npm:mermaid/dist/mermaid.esm.mjs/+esm";

const mermaidPlus = {
  async unsafe(string, env) {
    var nextId = 0;
    const template = document.createElement("template");
    template.innerHTML = (await mermaid.render(`mermaid-${++nextId}`, string)).svg;
    return template.content.cloneNode(true);
  },
  // renderToString(string, env) {
  //   return env?.withoutKatex === true
  //     ? Markdown.render(string, env)
  //     : MarkdownWithKatex.render(string, env)
  // }
};

export default mermaidPlus;