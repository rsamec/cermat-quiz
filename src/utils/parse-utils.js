export const Abbreviations = {
    H1: "ATXHeading1",
    H2: "ATXHeading2",
    H3: "ATXHeading3",
    H4: "ATXHeading4",
    H5: "ATXHeading5",
    H6: "ATXHeading6",
    CB: "CodeBlock",
    FC: "FencedCode",
    Q: "Blockquote",
    HR: "HorizontalRule",
    BL: "BulletList",
    OL: "OrderedList",
    LI: "ListItem",
    HB: "HTMLBlock",
    P: "Paragraph",
    BR: "HardBreak",
    Em: "Emphasis",
    St: "StrongEmphasis",
    Im: "Image",
    C: "InlineCode",
    HT: "HTMLTag",
    CM: "Comment",
    q: "QuoteMark",
    l: "ListMark",
    L: "LinkMark",
    ST: "SetextHeading1",
};
export function renderHtmlTree(tree) {
    let lists = '';
    tree.iterate({
        enter({ type, from, to }) {
            lists += `<ul><li>${type.name} (${from},${to})`;
        },
        leave({ type, from, to }) {
            lists += '</ul>';
        }
    });
    return lists;
}
export function chunkByAbbreviationType(tree, input, abbr) {
    const abbrs = Array.isArray(abbr) ? abbr : [abbr];
    const chunks = [];
    let lastPosition = 0;
    tree.iterate({
        enter({ type, from, to }) {
            if (abbrs.some(d => type.name == Abbreviations[d])) {
                chunks.push(input.substring(lastPosition, from));
                lastPosition = to;
            }
        },
        leave({ type, from, to }) {
        }
    });
    return chunks.length > 0 ? chunks : [input];
}
export function chunkHeadingsList(tree, input) {
    const children = [];
    let lastState = { position: 0, header: '', options: [], excludeChunks: [] };
    const computedExcludeChunks = () => lastState.excludeChunks.map(d => ({
        from: d.from - lastState.position,
        to: d.to - lastState.position,
    }));
    tree.iterate({
        enter({ type, from, to }) {
            if (type.name == Abbreviations.H1 || type.name == Abbreviations.H2 || type.name == Abbreviations.ST) {
                if (lastState.position != 0) {
                    const content = input.substring(lastState.position, from);
                    children.push({
                        type: lastState.type,
                        header: lastState.header,
                        content,
                        contentWithoutOptions: excludeChunks(content, computedExcludeChunks()),
                        options: lastState.options
                    });
                }
                lastState = { position: to, type, header: input.substring(from, to), options: [], excludeChunks: [] };
            }
            if (type.name == "Option") {
                const optionText = input.substring(from, to);
                const range = extractOptionRange(optionText);
                lastState.options?.push(range != null ? { value: range[0], name: range[1] } : { value: optionText, name: optionText });
            }
        },
        leave({ type, from, to }) {
            if (type.name == Abbreviations.BL && lastState.options?.length > 0) {
                lastState.excludeChunks.push({ from, to });
            }
            if (type.name == "Document") {
                const content = input.substring(lastState.position, to);
                children.push({
                    type: lastState.type,
                    header: lastState.header,
                    content,
                    contentWithoutOptions: excludeChunks(content, computedExcludeChunks()),
                    options: lastState.options
                });
            }
        }
    });
    return children;
}
export const OptionList = {
    defineNodes: [
        { name: "Option", block: true },
        { name: "OptionMarker" }
    ],
    parseBlock: [{
            name: "OptionList",
            leaf(cx, leaf) {
                return /^\[[\w\d]*\][ \t]/.test(leaf.content) && cx.parentType().name == "ListItem" ? new OptionParser : null;
            },
            after: "SetextHeading"
        }]
};
class OptionParser {
    nextLine() { return false; }
    finish(cx, leaf) {
        cx.addLeafElement(leaf, cx.elt("Option", leaf.start, leaf.start + leaf.content.length, [
            cx.elt("OptionMarker", leaf.start, leaf.start + 3),
            ...cx.parser.parseInline(leaf.content.slice(3), leaf.start + 3)
        ]));
        return true;
    }
}
export const ShortCodeMarker = {
    defineNodes: [{
            name: "ShortCodeMarker",
        }],
    parseInline: [{
            name: "ShortCodeMarker",
            parse(cx, next, pos) {
                let match;
                if (next != 123 /* '{' */ || !(match = /^[a-zA-Z_0-9\.]+\}/.exec(cx.slice(pos + 1, cx.end))))
                    return -1;
                return cx.addElement(cx.elt("ShortCodeMarker", pos, pos + 1 + match[0].length));
            },
        }]
};
export function excludeChunks(inputString, chunks) {
    if (chunks.length === 0) {
        return inputString; // No chunks to exclude, return the original string
    }
    // Sort chunks by start index in descending order
    const sortedChunks = chunks.sort((a, b) => b.from - a.from);
    let result = inputString;
    for (const chunk of sortedChunks) {
        const { from: start, to: end } = chunk;
        // Ensure start and end indices are within the bounds of the string
        if (start >= 0 && end <= result.length && start <= end) {
            // Exclude the chunk from the result string
            result = result.slice(0, start) + result.slice(end);
        }
    }
    return result;
}
export function countMaxChars(str, charToCount) {
    const pattern = new RegExp(`${charToCount}+`, 'g');
    const matches = str.match(pattern) || [];
    const maxCount = matches.length == 0 ? 0 : Math.max(...matches.map(match => match.length));
    return maxCount;
}
export function getQuizBuilder(tree, input, baseRenderOptions = { render: "content" }) {
    const rawHeadings = chunkHeadingsList(tree, input);
    function order(name) {
        if (name == Abbreviations.ST)
            return 1;
        if (name == Abbreviations.H1)
            return 2;
        return 3;
    }
    const headingsTree = createTree(rawHeadings.map(data => ({ data })), (child, potentionalParent) => order(child.type?.name) > order(potentionalParent.type?.name));
    const rootQuestions = getNodesWithAncestors({ data: {}, children: headingsTree }, d => d.type?.name == Abbreviations.H1, (parent, child, node) => {
        //copy some children property bottom up from leafs to its parent
        if ((child.options?.length > 0 || (node.children.some(d => d.data.options?.length > 0)))) {
            //!!! - fallback to reduce options for subquestions - potentional bug...
            parent.options = child.options?.length > 0 ? child.options : node.children.map(d=> d.data.options).filter(d => d?.length > 0)?.[0];
            console.log(parent.options);
        }
    });
    const isInRange = (number, range) => range != null ? number >= range[0] && number <= range[1] : false;
    const toContent = (items, { renderHeader, render }) => items.map(d => (renderHeader ? d.header ?? "" : "") +
        (render === "content"
            ? d.content ?? ""
            : render === "contentWithoutOptions"
                ? d.contentWithoutOptions ?? ""
                : "")).join("");
    const values = rootQuestions.map(d => {
        const root = d.ancestors[1].data;
        const id = Math.floor(parseFloat(replaceAll(d.leaf.data.header, "#", "")));
        const range = root.type?.name == Abbreviations.ST ? extractNumberRange(root.header) : null;
        return {
            title: d.leaf.data.header,
            id,
            content: (selectedIds, renderOptions) => {
                const { rootOnly, render } = renderOptions != null ? { ...baseRenderOptions, ...renderOptions } : baseRenderOptions;
                const children = d.ancestors.slice(-1)[0].children ?? [];
                const items = [d.leaf.data].concat(children.map(d => d.data));
                return isInRange(id, range) && !selectedIds?.some(d => d < id && isInRange(d, range))
                    ? toContent([root], { renderHeader: true, render }) + toContent(items, { renderHeader: !rootOnly, render })
                    : toContent(items, { renderHeader: !rootOnly, render });
            },
            options: d.leaf.data.options?.length > 0 ? d.leaf.data.options : d.ancestors[d.ancestors.length - 2].data.options
        };
    });
    const output = {
        questions: values.map(d => ({ id: d.id, title: d.title, options: d.options })),
        content: (ids, renderOptions) => {
            const filteredQuestions = values.filter(d => ids.includes(d.id));
            return filteredQuestions.map(d => d.content(renderOptions?.ids ?? ids, renderOptions)).join("");
        }
    };
    return output;
}
function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
function replaceAll(str, find, replace) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}
export function extractNumberRange(text) {
    text = text.split("\n")[0].trim();
    const match = text.match(/^([\s\S]*?)(\d+)(?:[-–](\d+))?$/);
    if (match) {
        const prefix = match[1];
        const start = parseInt(match[2], 10);
        const end = match[3] ? parseInt(match[3], 10) : start;
        return [start, end];
    }
    else {
        return null;
    }
}
export function extractOptionRange(text) {
    const match = text.match(/^\[([\w\d]*)\][ \t]/);
    if (match) {
        const prefix = match[1];
        return [prefix, text.replace(`[${prefix}] `, '')];
    }
    else {
        return null;
    }
}
export function createTree(sortedList, isChild) {
    const tree = [];
    let currentDepthNodes = tree;
    sortedList.forEach((item) => {
        const node = { ...item, children: [] };
        // Find the appropriate level in the tree based on the depth of indentation
        while (currentDepthNodes.length > 0 && !isChild(node.data, currentDepthNodes[currentDepthNodes.length - 1].data)) {
            currentDepthNodes.pop();
        }
        if (currentDepthNodes.length === 0) {
            tree.push(node);
            currentDepthNodes = [node];
        }
        else {
            currentDepthNodes[currentDepthNodes.length - 1].children.push(node);
            currentDepthNodes.push(node);
        }
    });
    return tree;
}
export function getAllLeafsWithAncestors(tree, applyChildSetToParent) {
    const result = [];
    function traverse(node, ancestors = []) {
        const currentAncestors = [...ancestors, node];
        if (!node.children || node.children.length === 0) {
            // Node is a leaf
            applyChildSetToParent?.(ancestors[ancestors.length - 1].data, node.data);
            result.push({ leaf: node, ancestors: currentAncestors });
        }
        else {
            // Node has children, continue traversal
            node.children.forEach((child) => traverse(child, currentAncestors));
        }
    }
    traverse(tree);
    return result;
}
export function getNodesWithAncestors(tree, selector, applyChildSetToParent) {
    const result = [];
    function traverse(node, ancestors = []) {
        const currentAncestors = [...ancestors, node];
        if (selector(node.data)) {
            applyChildSetToParent?.(ancestors[ancestors.length - 1].data, node.data, node);
            result.push({ leaf: node, ancestors: currentAncestors });
        }
        else if (!node.children || node.children.length === 0) {
            // Node is a leaf - end of recursion
        }
        else {
            // Node has children, continue traversal
            node.children.forEach((child) => traverse(child, currentAncestors));
        }
    }
    traverse(tree);
    return result;
}
