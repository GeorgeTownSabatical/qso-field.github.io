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
  relations: Array<FabricRelation & { distance: number; coherence: number }>;
}

export interface FabricWeights {
  semantic: number;
  temporal: number;
  goal: number;
  trust: number;
}

const DEFAULT_WEIGHTS: FabricWeights = {
  semantic: 0.35,
  temporal: 0.15,
  goal: 0.25,
  trust: 0.25,
};

export function relationDistance(relation: FabricRelation, weights: FabricWeights = DEFAULT_WEIGHTS): number {
  return (
    relation.semanticDistance * weights.semantic +
    relation.temporalDistance * weights.temporal +
    relation.goalDistance * weights.goal +
    relation.trustDistance * weights.trust
  );
}

export function evaluateFabric(objects: QSOObject[], relations: FabricRelation[], weights = DEFAULT_WEIGHTS): FabricEvaluation {
  const evaluated = relations.map((relation) => {
    const distance = relationDistance(relation, weights);
    const coherence = Math.exp(-distance) * (relation.weight ?? 1);
    return { ...relation, distance, coherence };
  });
  const globalCoherence =
    evaluated.length === 0 ? 1 : evaluated.reduce((sum, relation) => sum + relation.coherence, 0) / evaluated.length;
  const confidenceMean =
    objects.length === 0 ? 0 : objects.reduce((sum, object) => sum + object.confidence.score, 0) / objects.length;
  const contradictionDensity =
    objects.length === 0
      ? 0
      : objects.reduce((sum, object) => sum + Number(object.extensions.contradictionDensity ?? 0), 0) / objects.length;

  return {
    globalCoherence,
    contradictionDensity,
    confidenceMean,
    relations: evaluated,
  };
}
