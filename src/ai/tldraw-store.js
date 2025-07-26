import {
    generateNJitteredKeysBetween,
    generateNKeysBetween,
} from 'fractional-indexing-jittered'
import { schema as basicSchema, MarkdownParser, defaultMarkdownParser } from 'prosemirror-markdown';
const generateKeysFn =
    process.env.NODE_ENV === 'test' ? generateNKeysBetween : generateNJitteredKeysBetween
function getIndexAbove(below) {
    return generateKeysFn(below, null, 1)[0]
}


function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}
function createBindingId() {
    return `binding:${generateUniqueId()}`;
}
function createPageId() {
    return `page:${generateUniqueId()}`;
}
function createAssetId() {
    return `page:${generateUniqueId()}`;
}
const defaultGeoProps = {
    "dash": "draw",
    "growY": 0,
    "url": "",
    "scale": 1,
    "color": "blue",
    "labelColor": "black",
    "fill": "solid",
    "size": "m",
    "font": "draw",
    "align": "middle",
    "verticalAlign": "middle",
}

const defaultArrowProps = {
    kind: 'arc',
    elbowMidPoint: 0.5,
    dash: 'draw',
    size: 'm',
    fill: 'none',
    color: 'black',
    labelColor: 'black',
    bend: 0,
    start: { x: 0, y: 0 },
    end: { x: 2, y: 0 },
    arrowheadStart: 'none',
    arrowheadEnd: 'arrow',
    text: '',
    labelPosition: 0.5,
    font: 'draw',
    scale: 1,
}
const defautShapeProps = {
    rotation: 0,
    isLocked: false,
    opacity: 1,
}

const defaultTextShapeProps = {
    color: 'black',
    size: 'm',
    w: 8,
    font: 'draw',
    textAlign: 'start',
    autoSize: true,
    scale: 1,
}

const defaultNoteShapeProps = {
    color: 'black',
    size: 'm',
    font: 'draw',
    align: 'middle',
    verticalAlign: 'middle',
    labelColor: 'black',
    growY: 0,
    fontSizeAdjustment: 0,
    url: '',
    scale: 1,
}

const defaultLineShapeProps = {
    dash: 'draw',
    size: 'm',
    color: 'black',
    spline: 'line',
    // points: {
    //     [start]: { id: start, index: start, x: 0, y: 0 },
    //     [end]: { id: end, index: end, x: 0.1, y: 0.1 },
    // },
    scale: 1,
}
export function createPage({ name }) {
    return {
        id: createPageId(),
        name,
        typeName: "page",
        index: `a0`,
        meta: {},
    }
}

export function mapShapes(shapes, parentIndex = 'a0') {
    return shapes.map((d, i) => ({
        ...defautShapeProps,
        ...d,
        index: getIndexAbove(parentIndex),
        typeName: "shape",
        meta: {},
        props: {
            ...(d.type == "geo" && defaultGeoProps),
            ...(d.type == "arrow" && defaultArrowProps),
            //...(d.type == "bookmark" && { assetId: null }),
            ...(d.type === "text" && defaultTextShapeProps),
            ...(d.type === "note" && defaultNoteShapeProps),
            ...(d.type === "line" && defaultLineShapeProps),
            ...d.props
        }
    }));
}
export function mapBindings(bindings) {
    return bindings.map(d => ({ ...d, id: createBindingId(), typeName: "binding" }));
}
export function mapAssets(assets) {
    return assets.map(d => ({ ...d, typeName: "asset" }));
}

export function serialize(records) {
    return JSON.stringify({
        "tldrawFileFormatVersion": 1,
        "schema": {
            "schemaVersion": 2,
            "sequences": {
                "com.tldraw.store": 4,
                "com.tldraw.asset": 1,
                "com.tldraw.camera": 1,
                "com.tldraw.document": 2,
                "com.tldraw.instance": 25,
                "com.tldraw.instance_page_state": 5,
                "com.tldraw.page": 1,
                "com.tldraw.instance_presence": 6,
                "com.tldraw.pointer": 1,
                "com.tldraw.shape": 4,
                "com.tldraw.asset.bookmark": 2,
                "com.tldraw.asset.image": 5,
                "com.tldraw.asset.video": 5,
                "com.tldraw.shape.arrow": 6,
                "com.tldraw.shape.bookmark": 2,
                "com.tldraw.shape.draw": 2,
                "com.tldraw.shape.embed": 4,
                "com.tldraw.shape.frame": 1,
                "com.tldraw.shape.geo": 10,
                "com.tldraw.shape.group": 0,
                "com.tldraw.shape.highlight": 1,
                "com.tldraw.shape.image": 5,
                "com.tldraw.shape.line": 5,
                "com.tldraw.shape.note": 9,
                "com.tldraw.shape.text": 3,
                "com.tldraw.shape.video": 4,
                "com.tldraw.binding.arrow": 1,
                ...(false && { "com.tldraw.binding.markdown": 0 })
            }
        },
        records
    }, null, 2)
}

export function mdToRichText(inputMarkdown) {

    const parser = new MarkdownParser(
        basicSchema,
        defaultMarkdownParser.tokenizer,
        defaultMarkdownParser.tokens,
    )

    // Parse the markdown into a ProseMirror Node
    const doc = parser.parse(inputMarkdown)
    const docJson = doc.toJSON();

    // Convert the ProseMirror Node to JSON (Tiptap-compatible)
    //const json = doc.toJSON();
    //console.log(JSON.stringify(doc.toJSON(), null, 2))
    const remapNodes = new Map([
        ['strong', 'bold'],
        ['hard_break', 'paragraph'],
        ['blockquote', 'paragraph'],
        ['bullet_list', 'bulletList'],
        ['list_item', 'listItem']
    ]);

    const extractedImages = extractImages(docJson);
    const filteredJson = filterByNodeTypes(docJson, availableNodes);

    let filteredJsonAsString = JSON.stringify(filteredJson);
    for (let [value, newValue] of remapNodes.entries()) {
        filteredJsonAsString = filteredJsonAsString.replaceAll(value, newValue);
    }
    filteredJsonAsString = filteredJsonAsString.replaceAll("\"em\"", "\"bold\"").replaceAll("list_item", "listItem");

    return {
        extractedImages,
        richText: JSON.parse(filteredJsonAsString)
    }

}

function filterByNodeTypes(jsonDoc, availableNodes) {
    // Check if the current node is valid
    // console.log(jsonDoc.type)
    if (!availableNodes.includes(jsonDoc.type)) {
        return null;
    }

    // check if the 
    // const keys = [...remapNodes.keys()]
    // if (keys.includes(jsonDoc.type)) {
    //   return { ...jsonDoc, type: remapNodes.get(jsonDoc.type) }
    // }



    // If the node has content, apply validation to each child
    if (jsonDoc.content) {
        // Filter the content array, removing invalid nodes
        jsonDoc.content = jsonDoc.content
            .map(child => filterByNodeTypes(child, availableNodes))
            .filter(child => child !== null);
    }

    return jsonDoc;
}

function extractImages(jsonDoc) {
    const result = []
    // Check if the current node is valid
    // console.log(jsonDoc.type)
    if (jsonDoc.type === "image") {
        return jsonDoc;
    }
    if (jsonDoc.content) {
        // Filter the content array, removing invalid nodes
        const images = jsonDoc.content
            .flatMap(child => extractImages(child));
        if (images.length > 0) {
            result.push(...images);
        }
    }

    return result;
}

const availableNodes = [
    'doc',
    'paragraph',
    'text',
    'heading',
    'bullet_list',
    //'ordered_list',
    'list_item',
    //'image',
    'hard_break',
    'blockquote',
    // Add any additional custom nodes here
]