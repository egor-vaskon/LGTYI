import type {Heightmap} from "../Terrain/Heightmap";
import {importMap} from "./Importer";
/**
 * Adds one map to another.
 * The first map is the current map amd the second open from the `.lgtyi` save.
 *
 *
 * @returns Heightmap.
 */
export async function AddMap(heightMap: Heightmap): Promise<Heightmap> {
    let importedHeightmap;
    try {
        let data = await importMap();
        importedHeightmap = data.heightMap as Heightmap;
    } catch (err) {
        throw  new Error(err);
    }
    let difWidth = (Math.max(heightMap.width, importedHeightmap.width) - Math.min(heightMap.width, importedHeightmap.width)) / 2;
    let difHeight = (Math.max(heightMap.height, importedHeightmap.height) - Math.min(heightMap.height, importedHeightmap.height)) / 2;
    if (heightMap.width < importedHeightmap.width) {
        for (let i = 0; i < heightMap.height; i++) {
            for (let j = 0; j < heightMap.width; j++) {
                importedHeightmap.data[j + difWidth + difHeight * importedHeightmap.width + i * (heightMap.width + 2 * difWidth)] += heightMap.data[j + heightMap.width * i];
            }
        }
        return importedHeightmap;
    } else {
        for (let i = 0; i < importedHeightmap.height; i++) {
            for (let j = 0; j < importedHeightmap.width; j++) {
                heightMap.data[j + difWidth + difHeight * heightMap.width + i * heightMap.width] += importedHeightmap.data[j + importedHeightmap.width * i];
            }
        }
        return heightMap;
    }

}