import type { KernelEvent, StateFrame } from "./kernel.js";
export interface ChainRecord {
    recordId: string;
    previousRecordHash: string | null;
    event: KernelEvent;
    frameHash?: string;
    recordHash: string;
}
export interface ProofOfCoherence {
    valid: boolean;
    score: number;
    checks: {
        provenance: boolean;
        frameHash: boolean;
        sequence: boolean;
        availability: boolean;
    };
    errors: string[];
}
export declare function appendChainRecord(chain: ChainRecord[], event: KernelEvent, frame?: StateFrame): ChainRecord;
export declare function verifyProofOfCoherence(input: {
    chain: ChainRecord[];
    frame?: StateFrame;
    expectedPreviousHash?: string | null;
    available?: boolean;
}): ProofOfCoherence;
