import type { KernelEvent, StateFrame } from "./kernel.js";
import { sha256 } from "./provenance.js";

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

export function appendChainRecord(chain: ChainRecord[], event: KernelEvent, frame?: StateFrame): ChainRecord {
  const previousRecordHash = chain.at(-1)?.recordHash ?? null;
  const recordWithoutHash = {
    recordId: `chain_${chain.length + 1}`,
    previousRecordHash,
    event,
    frameHash: frame?.frameHash,
  };
  return {
    ...recordWithoutHash,
    recordHash: sha256(recordWithoutHash),
  };
}

export function verifyProofOfCoherence(input: {
  chain: ChainRecord[];
  frame?: StateFrame;
  expectedPreviousHash?: string | null;
  available?: boolean;
}): ProofOfCoherence {
  const errors: string[] = [];
  const latest = input.chain.at(-1);
  const provenance = input.chain.every((record) => record.event.timestamp && record.event.qsoId);
  const frameHash = !input.frame || input.frame.frameHash === sha256({ ...input.frame, frameHash: undefined });
  const sequence = latest ? latest.previousRecordHash === (input.expectedPreviousHash ?? input.chain.at(-2)?.recordHash ?? null) : true;
  const availability = input.available ?? true;

  if (!provenance) errors.push("chain contains event without timestamp or qsoId");
  if (!frameHash) errors.push("state frame hash does not match canonical content");
  if (!sequence) errors.push("chain previous hash does not match expected previous record");
  if (!availability) errors.push("state unavailable");

  const checks = { provenance, frameHash, sequence, availability };
  const passed = Object.values(checks).filter(Boolean).length;

  return {
    valid: errors.length === 0,
    score: passed / Object.keys(checks).length,
    checks,
    errors,
  };
}
