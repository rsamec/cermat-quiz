//////////////////////////////////////////////////
//credit to https://github.com/tldraw/tldraw
//modified
//////////////////////////////////////////////////

// import * as z  from 'zod/v4'
import { z } from "zod";

const SimpleColor = z.enum([
	'red',
	'light-red',
	'green',
	'light-green',
	'blue',
	'light-blue',
	'orange',
	'yellow',
	'black',
	'violet',
	'light-violet',
	'grey',
	'white',
])

export type ISimpleColor = z.infer<typeof SimpleColor>

const SimpleFill = z.enum(['none', 'tint', 'semi', 'solid', 'pattern'])

export type ISimpleFill = z.infer<typeof SimpleFill>

const SimpleLabel = z.string();

export type ISimpleAlign = z.infer<typeof SimpleAlign>

const SimpleAlign = z.enum(['start', 'middle', 'end'])

export const LabelGeoShapeProps = {
	color: SimpleColor.optional(),
	fill: SimpleFill.optional(),
	text: SimpleLabel.optional(),
	align: SimpleAlign.optional(),
	verticalAlign: SimpleAlign.optional(),
}
export const GeoShapeBaseProps = {
	shapeId: z.string(),
	note: z.string(),
	x: z.number(),
	y: z.number(),
	width: z.number(),
	height: z.number(),
}
const SimpleRectangleShape = z.object({
	type: z.literal('rectangle'),
	...GeoShapeBaseProps,
	...LabelGeoShapeProps,	
})

export type ISimpleRectangleShape = z.infer<typeof SimpleRectangleShape>

const SimpleEllipseShape = z.object({
	type: z.literal('ellipse'),
	...GeoShapeBaseProps,
	...LabelGeoShapeProps,
})

export type ISimpleEllipseShape = z.infer<typeof SimpleEllipseShape>

const SimpleOvalShape = z.object({
	type: z.literal('oval'),
	...GeoShapeBaseProps,
	...LabelGeoShapeProps,
})

export type ISimpleOvalShape = z.infer<typeof SimpleOvalShape>

const SimpleCloudShape = z.object({
	type: z.literal('cloud'),
	...GeoShapeBaseProps,
	...LabelGeoShapeProps,
})

export type ISimpleCloudShape = z.infer<typeof SimpleCloudShape>

const SimpleLineShape = z.object({
	type: z.literal('line'),
	shapeId: z.string(),
	note: z.string(),
	x1: z.number(),
	y1: z.number(),
	x2: z.number(),
	y2: z.number(),
	color: SimpleColor.optional(),
})

export type ISimpleLineShape = z.infer<typeof SimpleLineShape>

const SimpleNoteShape = z.object({
	type: z.literal('note'),
	shapeId: z.string(),
	note: z.string(),
	x: z.number(),
	y: z.number(),
	color: SimpleColor.optional(),
	text: SimpleLabel.optional(),
})

export type ISimpleNoteShape = z.infer<typeof SimpleNoteShape>

const SimpleTextShape = z.object({
	type: z.literal('text'),
	shapeId: z.string(),
	note: z.string(),
	x: z.number(),
	y: z.number(),	
	color: SimpleColor.optional(),
	text: z.string().optional(),
	textAlign: z.enum(['start', 'middle', 'end']).optional(),
	scale: z.number(),
})

export type ISimpleBookmarkShape = z.infer<typeof SimpleBookmarkShape>

const SimpleBookmarkShape = z.object({
	type: z.literal('bookmark'),
	shapeId: z.string(),
	url: z.string(),
	x: z.number(),
	y: z.number(),
	width: z.number(),
	height: z.number(),
	title: z.string(),
	description: z.string(),
	favicon: z.string(),
	image: z.string(),
})

export type ISimpleTextShape = z.infer<typeof SimpleTextShape>

const SimpleArrowShape = z.object({
	type: z.literal('arrow'),
	shapeId: z.string(),
	note: z.string(),
	fromId: z.string().nullable(),
	toId: z.string().nullable(),
	x1: z.number(),
	y1: z.number(),
	x2: z.number(),
	y2: z.number(),
	color: SimpleColor.optional(),
	text: SimpleLabel.optional(),
})

export type ISimpleArrowShape = z.infer<typeof SimpleArrowShape>

const SimpleUnknownShape = z.object({
	type: z.literal('unknown'),
	shapeId: z.string(),
	note: z.string(),
	x: z.number(),
	y: z.number(),
})

export type ISimpleGroupShape = z.infer<typeof SimpleGroupShape>

const SimpleGroupShape = z.object({
	type: z.literal('group'),
	parentId: z.string(),
	name: z.string(),
	shapeId: z.string(),
	x: z.number(),
	y: z.number(),
})

export type ISimpleUnknownShape = z.infer<typeof SimpleUnknownShape>

const SimpleShape = z.union([
	SimpleUnknownShape,
	SimpleRectangleShape,
	SimpleEllipseShape,
	SimpleOvalShape,
	SimpleCloudShape,
	SimpleLineShape,
	SimpleTextShape,
	SimpleArrowShape,
	SimpleNoteShape,
	SimpleBookmarkShape,
])

export type ISimpleShape = z.infer<typeof SimpleShape>


// Events

export const SimpleCreateEvent = z.object({
	type: z.enum(['create', 'update']),
	shape: SimpleShape,
	intent: z.string(),
})

export type ISimpleCreateEvent = z.infer<typeof SimpleCreateEvent>

export const SimpleMoveEvent = z.object({
	type: z.literal('move'),
	shapeId: z.string(),
	x: z.number(),
	y: z.number(),
	intent: z.string(),
})

export type ISimpleMoveEvent = z.infer<typeof SimpleMoveEvent>

const SimpleDeleteEvent = z.object({
	type: z.literal('delete'),
	shapeId: z.string(),
	intent: z.string(),
})
export type ISimpleDeleteEvent = z.infer<typeof SimpleDeleteEvent>

const SimpleThinkEvent = z.object({
	type: z.literal('think'),
	text: z.string(),
	intent: z.string(),
})
export type ISimpleThinkEvent = z.infer<typeof SimpleThinkEvent>

export const SimpleEvent = z.union([
	SimpleThinkEvent,
	SimpleCreateEvent, // or update
	SimpleDeleteEvent,
	SimpleMoveEvent,
])

export type ISimpleEvent = z.infer<typeof SimpleEvent>


export const ModelResponse = z.object({
	long_description_of_strategy: z.string(),
	events: z.array(SimpleEvent),
})

export type IModelResponse = z.infer<typeof ModelResponse>
