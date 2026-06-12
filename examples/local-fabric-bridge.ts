import { createLocalFabricBridgeFixture } from "../src/index.js";

const fixture = createLocalFabricBridgeFixture();

console.log(JSON.stringify(fixture.envelope, null, 2));
