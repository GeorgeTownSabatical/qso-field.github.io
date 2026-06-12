import type { FabricEvaluation, FabricRelation } from "./fabric.js";
import type { JSONObject, QSOObject } from "./qso-object.js";
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
export declare function createCognitiveRenderProjection(input: CreateCognitiveRenderProjectionInput): CognitiveRenderProjection;
export declare function renderProjectionHash(projection: CognitiveRenderProjection): string;
