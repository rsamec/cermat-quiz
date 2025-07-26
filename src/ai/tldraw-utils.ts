import type { TLTextShape, TLLineShape, TLArrowShape, TLGeoShape, TLNoteShape, TLShapePartial, IndexKey, TLArrowBinding, TLBindingCreate, TLDefaultFillStyle, TLShapeId, TLBookmarkShape, TLFrameShape, TLAsset, TLAssetId } from "@tldraw/tldraw";
import type { ISimpleBookmarkShape, ISimpleFill, ISimpleShape } from "./schema";

type TLShapes = TLShapePartial<TLTextShape> | TLShapePartial<TLLineShape> | TLShapePartial<TLArrowShape> | TLShapePartial<TLNoteShape> | TLShapePartial<TLGeoShape> | TLShapePartial<TLBookmarkShape>;
function generateUniqueId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}
export function createShapeId() {
    return `shape:${generateUniqueId()}` as TLShapeId;
}

export function createAssetId() {
    return `asset:${generateUniqueId()}` as TLAssetId;
}

export function createFrame({ id, name, h, w, color }) {
    const root: Partial<TLFrameShape> = {
        type: "frame",
        id,
        props: {
            name,
            color,
            h,
            w,
        },
        x: 0,
        y: 0,
    };
    return root;
}
export function createBookmarks(shapes: ISimpleBookmarkShape[]) {
    return convertToShapes(shapes)
}

type TLDraw = {
    shapes: TLShapes[],
    bindings: TLBindingCreate<TLArrowBinding>[]
    assets: TLAsset[]
}

const FILL_MAP: Record<ISimpleFill, TLDefaultFillStyle> = {
    none: 'none',
    solid: 'fill',
    semi: 'semi',
    tint: 'solid',
    pattern: 'pattern',
}

function simpleFillToShapeFill(fill: ISimpleFill): TLDefaultFillStyle {
    return FILL_MAP[fill]
}
function toRichText(text: string | { content: [], type: string }) {

    if (typeof text !== 'string') {
        if (text.content == null) {
            return {
                type: 'doc',
                content: [
                    {
                        type: 'paragraph',
                        content: [{ type: 'text', text: 'NOTHING' }],
                    }
                ],
            }
        }
        return text;
    }
    const lines = text.split('\n')
    const content = lines.map((text) => {
        if (!text) {
            return {
                type: 'paragraph',
            }
        }

        return {
            type: 'paragraph',
            content: [{ type: 'text', text: text ?? '' }],
        }
    })

    return {
        type: 'doc',
        content,
    }
}

export function convertToShapes(shapes: ISimpleShape[]
) {
    const result: TLDraw = {
        shapes: [],
        bindings: [],
        assets: []
    };
    for (const shape of shapes.sort((a, b) => -(a.type.localeCompare(b.type)))) {
        switch (shape.type) {
            case 'text': {
                result.shapes.push({
                    id: shape.shapeId as any,
                    type: 'text',
                    x: shape.x,
                    y: shape.y,
                    props: {
                        richText: toRichText(shape.text ?? ''),
                        color: shape.color ?? 'black',
                        scale: shape.scale ?? 1,
                        textAlign: shape.textAlign ?? 'middle',
                    },

                })
                break
            }
            case 'line': {
                const minX = Math.min(shape.x1, shape.x2)
                const minY = Math.min(shape.y1, shape.y2)

                result.shapes.push({
                    id: shape.shapeId as any,
                    type: 'line',
                    x: minX,
                    y: minY,
                    props: {
                        points: {
                            a1: {
                                id: 'a1',
                                index: 'a2' as IndexKey,
                                x: shape.x1 - minX,
                                y: shape.y1 - minY,
                            },
                            a2: {
                                id: 'a2',
                                index: 'a2' as IndexKey,
                                x: shape.x2 - minX,
                                y: shape.y2 - minY,
                            },
                        },
                        color: shape.color ?? 'black',
                    }
                });

                break
            }
            case 'arrow': {
                const { shapeId, fromId, toId, x1, x2, y1, y2 } = shape

                // Make sure that the shape itself is the first change
                result.shapes.push({
                    id: shapeId as any,
                    type: 'arrow',
                    x: 0,
                    y: 0,
                    props: {
                        color: shape.color ?? 'black',
                        text: shape.text ?? '',
                        start: { x: x1, y: y1 },
                        end: { x: x2, y: y2 },
                    }
                });


                // Does the arrow have a start shape? Then try to create the binding
                const startShape = fromId ? result.shapes.find((s) => s.id === fromId) : null

                if (startShape) {
                    result.bindings.push({

                        type: 'arrow',
                        //id: createBindingId(),
                        fromId: shapeId as any,
                        toId: startShape.id,
                        props: {
                            normalizedAnchor: { x: 0.5, y: 0.5 },
                            isExact: false,
                            isPrecise: true,
                            terminal: 'start',
                            snap: "none",
                        },
                        meta: {},
                        typeName: 'binding',
                    })
                }

                // Does the arrow have an end shape? Then try to create the binding

                const endShape = toId ? result.shapes.find((s) => s.id === toId) : null

                if (endShape) {
                    result.bindings.push({
                        type: 'arrow',
                        //id: createBindingId(),
                        fromId: shapeId as any,
                        toId: endShape.id,
                        props: {
                            normalizedAnchor: { x: 0.5, y: 0.5 },
                            isExact: false,
                            isPrecise: true,
                            terminal: 'end',
                            snap: "none",
                        },
                        meta: {},
                        typeName: 'binding',
                    })
                }
                break
            }
            case 'cloud':
            case 'rectangle':
            case 'oval':
            case 'ellipse': {
                result.shapes.push({

                    id: shape.shapeId as any,
                    type: 'geo',
                    x: shape.x,
                    y: shape.y,
                    props: {
                        geo: shape.type,
                        w: shape.width,
                        h: shape.height,
                        color: shape.color ?? 'black',
                        fill: simpleFillToShapeFill(shape.fill ?? 'none'),
                        richText: toRichText(shape.text ?? ''),
                        align: shape.align ?? 'middle',
                        verticalAlign: shape.align ?? 'middle'
                    },

                })
                break
            }

            case 'note': {
                result.shapes.push({
                    id: shape.shapeId as any,
                    type: 'note',
                    x: shape.x,
                    y: shape.y,
                    props: {
                        color: shape.color ?? 'black',
                        richText: toRichText(shape.text ?? ''),
                    },
                })
                break
            }

            case 'bookmark': {
                const assetId = createAssetId();
                result.shapes.push({
                    id: shape.shapeId as any,
                    type: 'bookmark',
                    x: shape.x,
                    y: shape.y,
                    props: {
                        url: shape.url,
                        w: shape.width ?? 300,
                        h: shape.height ?? 300,
                        assetId,
                    },
                });
                result.assets.push({
                    id: assetId,
                    typeName: "asset",
                    type: "bookmark",
                    props: {
                        src: shape.url,
                        description: shape.description ?? "",
                        image: shape.image ?? "",
                        favicon: shape.favicon ?? "",
                        title: shape.title ?? ""
                    },
                    meta: {}
                });
                break
            }
        }
    }
    return result;
}