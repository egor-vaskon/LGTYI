import type {Heightmap} from "../Terrain/Heightmap";
import {importMap} from "./Importer";

export default async function AddMap(heightMap: Heightmap): Promise<Heightmap> {
    let importedHeightmap;
    try {
        importedHeightmap = await importMap()
    } catch (err) {
        throw  new Error(err);
    }
    let difWidth = (Math.max(heightMap.width, importedHeightmap.width) - Math.min(heightMap.width, importedHeightmap.width)) / 2;
    let difHeight = (Math.max(heightMap.height, importedHeightmap.height) - Math.min(heightMap.height, importedHeightmap.height)) / 2;
    if (heightMap.width < importedHeightmap.width) {
        for (let i = 0; i < heightMap.height; i++) {
            for (let j = 0; j < heightMap.width; j++) {
                importedHeightmap.data[j + difWidth + difHeight * importedHeightmap.width + i * (heightMap.width + 2 * difWidth)] += heightMap.data[j + heightMap.width*i];
            }
        }
        return importedHeightmap;
    } else {
        for (let i = 0; i < heightMap.height; i++) {
            for (let j = 0; j < heightMap.width; j++) {
                heightMap.data[j + difWidth + difHeight * heightMap.width + i * (importedHeightmap.width + 2 * difWidth)] += importedHeightmap.data[j + importedHeightmap.width*i];
            }
        }
        return heightMap;
    }

}