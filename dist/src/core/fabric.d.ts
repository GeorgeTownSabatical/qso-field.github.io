import type { QSOObject } from "./qso-object.js";
export interface FabricRelation {
    from: string;
    to: string;
    semanticDistance: number;
    temporalDistance: number;
    goalDistance: number;
    trustDistance: number;
    weight?: number;
}
export interface FabricEvaluation {
    globalCoherence: number;
    contradictionDensity: number;
    confidenceMean: number;
    relations: Array<FabricRelation & {
        distance: number;
        coherence: number;
    }>;
}
export interface FabricWeights {
    semantic: number;
    temporal: number;
    goal: number;
    trust: number;
}
export declare function relationDistance(relation: FabricRelation, weights?: FabricWeights): number;
export declare function evaluateFabric(objects: QSOObject[], relations: FabricRelation[], weights?: FabricWeights): FabricEvaluation;
