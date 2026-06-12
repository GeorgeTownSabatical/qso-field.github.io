import type { Confidence } from "./qso-object.js";
export declare function clampConfidence(score: number): number;
export declare function createConfidence(score: number, method?: string, notes?: string): Confidence;
export declare function combineConfidence(values: Confidence[]): Confidence;
