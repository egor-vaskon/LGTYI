import {Heightmap} from "../Terrain/Heightmap";
import {altitudeFromGrayscale} from "../Terrain/PointColor";
import type {Color} from "../Types/Color";
import type {GrayscaleColor} from "../Types/GrayscaleColor";
import {DefaultGeneratorOptions} from "../Generator/GeneratorOptions";
import {DefaultBiomesDistribution} from "../Generator/Biome";

const remote = require('@electron/remote');
/**
 * Imports `.png`, `.jpg`, `.bmp` image from the selected path.
 * Using JimpJS.
 *
 * @returns Heightmap.
 */
export async function ImageImport(isAlphaMod: boolean, isColorMod: boolean, color: Color, grayscaleColor: GrayscaleColor, waterLevel: number, isInverted: boolean): Promise<Heightmap> {
    // @ts-ignore
    const Jimp = window.jimp;

    // Use the electron dialog module to prompt the user for a file path
    const {filePaths} = await remote.dialog.showOpenDialog({
        filters: [
            {name: 'Image Files', extensions: ['jpg', 'jpeg', 'bmp', 'png']},
        ],
        properties: ['openFile']
    });
    // Exit the function if the user cancels the save dialog
    if (filePaths.length === 0) throw new Error("File was not selected!");
    let promise: Promise<Heightmap>;
    try {
        promise = Jimp.read(filePaths[0]).then(img => {
            // img.flip(false, true, function (err) {
            //     if (err) throw err;
            // })
            let arr = new Float32Array(img.bitmap.width * img.bitmap.height);
            const maxAltitude = DefaultGeneratorOptions.maxAltitude;
            const minAltitude = DefaultGeneratorOptions.minAltitude;
            const HeightmapRandom = Heightmap.simpleGenerate({
                width: img.bitmap.width,
                height: img.bitmap.height,
                minAltitude: minAltitude,
                maxAltitude: maxAltitude,
                roughness: DefaultGeneratorOptions.roughness,
                levelOfDetail: DefaultGeneratorOptions.levelOfDetail,
                waterLevel: DefaultGeneratorOptions.waterLevel,
                seed: DefaultGeneratorOptions.seed,
                numberOfBiomes: DefaultGeneratorOptions.numberOfBiomes,
                biomes: DefaultBiomesDistribution
            });
            let altitude: number;
            img.scan(0, 0, img.bitmap.width, img.bitmap.height, function (x, y, idx) {
                const red = this.bitmap.data[idx + 0];
                const green = this.bitmap.data[idx + 1];
                const blue = this.bitmap.data[idx + 2];
                let alpha = this.bitmap.data[idx + 3];

                if (isColorMod && red == color.r && green == color.g && blue == color.b) {
                    altitude = HeightmapRandom.data[y * img.bitmap.width + x];
                } else {
                    switch (grayscaleColor) {
                        case "red": {
                            altitude = altitudeFromGrayscale(red);
                            break;
                        }
                        case "green": {
                            altitude = altitudeFromGrayscale(green);
                            break;
                        }
                        case "blue": {
                            altitude = altitudeFromGrayscale(blue);
                            break;
                        }
                    }
                }
                /*if (isAlphaMod){
                    if (!isInverted)
                        altitude =  altitude + alpha*((HeightmapRandom.data[y * img.bitmap.width + x] - altitude)/255);
                    else
                        altitude =  altitude + (255 - alpha) * ((HeightmapRandom.data[y * img.bitmap.width + x] - altitude)/255);
                }*/

                alpha /= 255;

                if (isInverted)
                    alpha = 1 - alpha;

                if (isAlphaMod)
                    altitude = (1-alpha)*altitude + alpha*HeightmapRandom.data[y*img.bitmap.width+x];

                arr[y * img.bitmap.width + x] = altitude;
            });

            let heightMap = new Heightmap(img.bitmap.width, img.bitmap.height, arr, waterLevel);
            return heightMap;
        })
    } catch (e) {
        throw new Error(e);
    }
    return promise;
}