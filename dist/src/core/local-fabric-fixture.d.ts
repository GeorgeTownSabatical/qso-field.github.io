import { type QSOFabricExecutionEnvelope } from "./local-fabric.js";
import { type QSOObject } from "./qso-object.js";
import type { FabricRelation } from "./fabric.js";
export interface LocalFabricBridgeFixture {
    objects: QSOObject[];
    relations: FabricRelation[];
    envelope: QSOFabricExecutionEnvelope;
}
export declare function createLocalFabricBridgeFixture(): LocalFabricBridgeFixture;
