// @ts-check
import { loadResources } from "../engine/loaders/resources.js";

export const resources = await loadResources({
    "mesh": new URL("../extern/models/floor/floor.json", import.meta.url),
    "image": new URL("../extern/models/floor/grass.png", import.meta.url),
});
