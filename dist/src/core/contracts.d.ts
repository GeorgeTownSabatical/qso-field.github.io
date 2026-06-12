import type { JSONObject, QSOObject } from "./qso-object.js";
export type ContractMode = "smart" | "genius";
export interface ContractContext {
    provenanceScore: number;
    confidenceScore: number;
    contradictionDensity: number;
    repairDebt: number;
    trustScore: number;
    trainingTraceScore?: number;
}
export interface ContractExecutionResult<TState extends JSONObject = JSONObject> {
    mode: ContractMode;
    accepted: boolean;
    object: QSOObject<TState>;
    stateHash: string;
    reasons: string[];
    context: ContractContext;
}
export interface SmartContract<TState extends JSONObject = JSONObject> {
    mode: "smart";
    contractId: string;
    description: string;
    execute: (state: TState) => TState;
    validate?: (state: TState) => string[];
}
export interface GeniusContract<TState extends JSONObject = JSONObject> {
    mode: "genius";
    contractId: string;
    description: string;
    propose: (state: TState, context: ContractContext) => TState;
    threshold?: number;
}
export type QSOContract<TState extends JSONObject = JSONObject> = SmartContract<TState> | GeniusContract<TState>;
export declare function deriveContractContext(object: QSOObject): ContractContext;
export declare function executeContract<TState extends JSONObject>(object: QSOObject<TState>, contract: QSOContract<TState>, context?: ContractContext): ContractExecutionResult<TState>;
