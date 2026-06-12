import type { FabricEvaluation, FabricRelation } from "./fabric.js";
import { evaluateFabric } from "./fabric.js";
import type { JSONObject, QSOObject } from "./qso-object.js";
import { sha256 } from "./provenance.js";

export interface CognitiveRenderNode {
  id: string;
  label: string;
  objectType: string;
  confidence: number;
  contradictionDensity: number;
  x: number;
  y: number;
  radius: number;
  color: string;
  metadata: JSONObject;
}

export interface CognitiveRenderEdge {
  id: string;
  from: string;
  to: string;
  distance: number;
  coherence: number;
  weight: number;
  width: number;
  status: "stable" | "strained" | "obstructed";
  metadata: JSONObject;
}

export interface CognitiveRenderProjection {
  projectionType: "cognitive.render.v0";
  fabricId: string;
  generatedAt: string;
  summary: {
    objectCount: number;
    relationCount: number;
    globalCoherence: number;
    contradictionDensity: number;
    confidenceMean: number;
  };
  nodes: CognitiveRenderNode[];
  edges: CognitiveRenderEdge[];
}

export interface CreateCognitiveRenderProjectionInput {
  fabricId: string;
  objects: QSOObject[];
  relations: FabricRelation[];
  evaluation?: FabricEvaluation;
  now?: string;
}

const DEFAULT_GENERATED_AT = "1970-01-01T00:00:00.000Z";

export function createCognitiveRenderProjection(input: CreateCognitiveRenderProjectionInput): CognitiveRenderProjection {
  const objects = [...input.objects].sort((a, b) => a.objectId.localeCompare(b.objectId));
  const relations = [...input.relations].sort((a, b) => relationKey(a).localeCompare(relationKey(b)));
  const evaluation = input.evaluation ?? evaluateFabric(objects, relations);
  const evaluatedRelations = [...evaluation.relations].sort((a, b) => relationKey(a).localeCompare(relationKey(b)));

  return {
    projectionType: "cognitive.render.v0",
    fabricId: input.fabricId,
    generatedAt: input.now ?? DEFAULT_GENERATED_AT,
    summary: {
      objectCount: objects.length,
      relationCount: relations.length,
      globalCoherence: round(evaluation.globalCoherence),
      contradictionDensity: round(evaluation.contradictionDensity),
      confidenceMean: round(evaluation.confidenceMean),
    },
    nodes: objects.map((object, index) => objectToNode(object, index, objects.length)),
    edges: evaluatedRelations.map(relationToEdge),
  };
}

export function renderProjectionHash(projection: CognitiveRenderProjection): string {
  return sha256(projection);
}

function objectToNode(object: QSOObject, index: number, total: number): CognitiveRenderNode {
  const angle = total <= 1 ? 0 : (Math.PI * 2 * index) / total;
  const confidence = clamp01(object.confidence.score);
  const contradictionDensity = clamp01(Number(object.extensions.contradictionDensity ?? 0));

  return {
    id: object.objectId,
    label: object.objectId.split(":").at(-1) ?? object.objectId,
    objectType: object.objectType,
    confidence: round(confidence),
    contradictionDensity: round(contradictionDensity),
    x: round(Math.cos(angle)),
    y: round(Math.sin(angle)),
    radius: round(0.2 + confidence * 0.6),
    color: nodeColor(confidence, contradictionDensity),
    metadata: {
      qsoVersion: object.qsoVersion,
      updatedAt: object.updatedAt,
      confidenceMethod: object.confidence.method,
    },
  };
}

function relationToEdge(relation: FabricEvaluation["relations"][number]): CognitiveRenderEdge {
  const coherence = clamp01(relation.coherence);
  return {
    id: `edge.${shortHash({ from: relation.from, to: relation.to })}`,
    from: relation.from,
    to: relation.to,
    distance: round(relation.distance),
    coherence: round(coherence),
    weight: round(relation.weight ?? 1),
    width: round(0.1 + coherence * 0.9),
    status: edgeStatus(coherence),
    metadata: {
      semanticDistance: round(relation.semanticDistance),
      temporalDistance: round(relation.temporalDistance),
      goalDistance: round(relation.goalDistance),
      trustDistance: round(relation.trustDistance),
    },
  };
}

function nodeColor(confidence: number, contradictionDensity: number): string {
  if (contradictionDensity >= 0.5) return "#d64f45";
  if (confidence < 0.5) return "#c99a2e";
  return "#2f8f83";
}

function edgeStatus(coherence: number): CognitiveRenderEdge["status"] {
  if (coherence >= 0.75) return "stable";
  if (coherence >= 0.45) return "strained";
  return "obstructed";
}

function relationKey(relation: Pick<FabricRelation, "from" | "to">): string {
  return `${relation.from}\u0000${relation.to}`;
}

function shortHash(value: unknown): string {
  return sha256(value).replace("sha256:", "").slice(0, 16);
}

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function round(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000;
}
