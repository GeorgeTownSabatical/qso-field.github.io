import { sha256 } from "./provenance.js";
export function detectLocalFabricProvider(env = process.env) {
    return {
        fabricRoot: env.QSO_FABRIC_ROOT ?? "/Users/ALISTAIRE/qso-fabric",
        fieldRoot: env.QSO_FIELD_ROOT ?? "/Users/ALISTAIRE/qso-field",
        fieldRepo: env.QSO_FIELD_REPO ?? "aevespers2/qso-field.github.io",
        fieldRepoUrl: env.QSO_FIELD_REPO_URL ?? "https://github.com/aevespers2/qso-field.github.io",
        fieldSiteUrl: env.QSO_FIELD_SITE_URL ?? "https://vespersinc.com/",
        contractModes: (env.QSO_CONTRACT_MODES ?? "smart,genius")
            .split(",")
            .map((mode) => mode.trim())
            .filter((mode) => mode.length > 0),
        itensorRunner: env.QSO_ITENSOR_RUNNER ?? null,
        deterministicFallback: !env.QSO_ITENSOR_RUNNER,
    };
}
export function qsoObjectToFabricPatch(object) {
    const contradictionDensity = clamp01(Number(object.extensions.contradictionDensity ?? 0));
    const repairDebt = clamp01(object.repairHistory.length / 10);
    const confidence = clamp01(object.confidence.score);
    const support = clamp01((confidence + (1 - contradictionDensity) + (1 - repairDebt)) / 3);
    const patchId = fabricPatchId(object.objectId);
    return {
        id: patchId,
        domain: object.objectType,
        basis: ["|confidence>", "|support>"],
        state: {
            id: `state.${patchId}`,
            vector_real: [confidence, support],
            vector_imag: [0, 0],
            phase: 0,
            uncertainty: contradictionDensity,
            metadata: {
                qso_field_object_id: object.objectId,
                qso_field_object_type: object.objectType,
                qso_version: object.qsoVersion,
                continuity_role: "field_patch",
                retrieval_weight: confidence,
                provenance_refs: object.provenance.map((record) => record.hash ?? sha256(record)),
                repair_history_refs: object.repairHistory.map((record) => sha256(record)),
            },
        },
        metadata: {
            created_at: object.createdAt,
            updated_at: object.updatedAt,
            confidence_method: object.confidence.method,
            contradiction_density: contradictionDensity,
            repair_debt: repairDebt,
            state_hash: sha256(object.state),
        },
    };
}
export function buildQSOFabricPayload(input) {
    const provider = input.provider ?? detectLocalFabricProvider();
    const patches = Object.fromEntries(input.objects.map((object) => [fabricPatchId(object.objectId), qsoObjectToFabricPatch(object)]));
    const overlaps = Object.fromEntries((input.relations ?? []).map((relation) => {
        const overlap = relationToFabricOverlap(relation);
        return [overlap.id, overlap];
    }));
    return {
        id: input.fabricId,
        patches,
        overlaps,
        metadata: {
            qso_field_bridge_version: "0.1.0",
            qso_field_repo: provider.fieldRepo,
            qso_field_site_url: provider.fieldSiteUrl,
            qso_fabric_root: provider.fabricRoot,
            deterministic_fallback: provider.deterministicFallback,
            contract_modes: provider.contractModes,
            ...(input.metadata ?? {}),
        },
    };
}
export function buildQSOFabricExecutionEnvelope(input) {
    const provider = input.provider ?? detectLocalFabricProvider();
    const fabricPayload = buildQSOFabricPayload({ ...input, provider });
    return {
        object_kind: "fabric",
        backend: "fabric_gluing",
        coherence_threshold: input.coherenceThreshold ?? 0.8,
        fabric_payload: fabricPayload,
        metadata: {
            bridge: "qso-field.local-fabric",
            provider,
            execute_with: "services.quantum.fabric.runtime.execute_fabric_payload",
        },
    };
}
export function fabricPatchId(objectId) {
    return `patch.${sha256(objectId).slice("sha256:".length, "sha256:".length + 16)}`;
}
function relationToFabricOverlap(relation) {
    const patchA = fabricPatchId(relation.from);
    const patchB = fabricPatchId(relation.to);
    const overlapId = `overlap.${sha256(relation).slice("sha256:".length, "sha256:".length + 16)}`;
    const metadata = {
        semantic_distance: relation.semanticDistance,
        temporal_distance: relation.temporalDistance,
        goal_distance: relation.goalDistance,
        trust_distance: relation.trustDistance,
        weight: relation.weight ?? 1,
    };
    return {
        id: overlapId,
        patch_a: patchA,
        patch_b: patchB,
        shared_domain: ["qso-field.relation"],
        restriction_a: identityRestriction(`restrict.${overlapId}.a`, patchA, overlapId),
        restriction_b: identityRestriction(`restrict.${overlapId}.b`, patchB, overlapId),
        metadata,
    };
}
function identityRestriction(id, sourcePatch, targetPatch) {
    return {
        id,
        source_patch: sourcePatch,
        target_patch: targetPatch,
        projection_real: [
            [1, 0],
            [0, 1],
        ],
        projection_imag: [
            [0, 0],
            [0, 0],
        ],
        validation_rule: "dimension_match",
        metadata: {},
    };
}
function clamp01(value) {
    if (!Number.isFinite(value))
        return 0;
    return Math.max(0, Math.min(1, value));
}
