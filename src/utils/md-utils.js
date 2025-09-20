import markdownit from "markdown-it";
import katex from '@vscode/markdown-it-katex';
import MarkdownItFootnote from "markdown-it-footnote";
import sup from 'markdown-it-sup';
import mark from 'markdown-it-mark';

//const inlineTextColor = import('https://cdn.skypack.dev/@gerhobbelt/markdown-it-inline-text-color@1.0.1-1?min');
//import textBgColor from 'https://cdn.jsdelivr.net/npm/markdown-it-color-plus/+esm';
import html5Media from 'markdown-it-html5-embed';
let counter = 1;
const ATXRenderer = function () {
  const mapping = {
    h1: "h2",
    h2: "h3"
  };
  function getTagName(token) {
    return token.markup == "-" || token.markup == "="
      ? "h1"
      : mapping[token.tag] ?? token.tag;
  }

  function open(tokens, idx) {
    const token = tokens[idx];
    const tag = getTagName(token);
    return tag === "h1" ? `<${tag} id=${idx + (counter++)}>` : `<${tag}>`;
  }

  function close(tokens, idx) {
    const token = tokens[idx];
    const tag = getTagName(token);

    return `</${tag}>`;
  }

  return function (md) {
    // Custom rule to wrap the first word of H1 headings in a <span>
    md.core.ruler.push("wrap_first_word_in_h1", function (state) {
      // Iterate over all tokens in the markdown content
      state.tokens.forEach((token, i) => {
        // Check if it's an opening tag for a heading and it's a first-level heading (h1)
        if (token.type === "heading_open" && token.tag === "h1") {
          const inlineToken = state.tokens[i + 1]; // The next token is the inline token that holds the content

          if (inlineToken.type === "inline") {
            // Find the first text token in the inline token's children
            const textToken = inlineToken.children.find(
              (child) => child.type === "text"
            );

            if (textToken) {
              // Split the text content into words
              const words = textToken.content.split(" ");

              if (words.length > 0) {
                // Modify the content: replace the first word with an HTML span and keep the rest as text
                const firstWord = words.shift(); // Extract the first word

                // Create a new token for the span-wrapped first word
                const firstWordToken = new state.Token("html_inline", "", 0);
                firstWordToken.content = `<span>${firstWord}</span>`;

                // Update the original text token to contain the remaining words
                textToken.content = textToken.content.substr(firstWord.length);

                // Insert the new firstWordToken before the textToken in the children array
                inlineToken.children.unshift(firstWordToken);
              }
            }
          }
        }
      });
    });
    md.renderer.rules.heading_open = open;
    md.renderer.rules.heading_close = close;
  };
}

const underline = (md) => {

  function renderStrong(tokens, idx, opts, _, self) {
    var token = tokens[idx];
    if (token.markup === '__') {
      token.tag = 'u';
    }
    return self.renderToken(tokens, idx, opts);
  }

  md.renderer.rules.strong_open = renderStrong;
  md.renderer.rules.strong_close = renderStrong;
}

const MarkdownWithKatex = new markdownit({ html: false, })
  .use(underline)
  .use(katex.default ?? katex, {
  })
  .use(sup)
  .use(mark)
  .use(MarkdownItFootnote)
  // .use(textBgColor.default, { inline: false, isMultiLine: true })
  .use(html5Media, {
    html5embed: {
      useImageSyntax: false, // Enables video/audio embed with ![]() syntax (default)
      useLinkSyntax: true // Enables video/audio embed with []() syntax
    }
  })
  .use(ATXRenderer())

const Markdown = new markdownit({ html: false, })
  .use(underline)
  .use(sup)
  .use(mark)
  .use(MarkdownItFootnote)
  // .use(textBgColor.default, { inline: false, isMultiLine: true })
  .use(html5Media, {
    html5embed: {
      useImageSyntax: false, // Enables video/audio embed with ![]() syntax (default)
      useLinkSyntax: true // Enables video/audio embed with []() syntax
    }
  })
  .use(ATXRenderer())

const mdPlus = {
  unsafe(string, env) {
    // var head = document.head || document.getElementsByTagName("head")[0];
    // const href =
    //   "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.5.1/katex.min.css";

    // const existingLink = document.querySelector(`head link[href="${href}"]`);
    // if (!existingLink) {
    //   var link = document.createElement("link");
    //   head.appendChild(link);

    //   link.rel = "stylesheet";
    //   link.href = href;
    // }

    const template = document.createElement("template");
    template.innerHTML = env?.withoutKatex === true
      ? Markdown.render(string, env)
      : MarkdownWithKatex.render(string, env);
    return template.content.cloneNode(true);
  },
  renderToString(string, env) {
    return env?.withoutKatex === true
      ? Markdown.render(string, env)
      : MarkdownWithKatex.render(string, env)
  }
};

export default mdPlus;
