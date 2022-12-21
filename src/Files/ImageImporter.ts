import {Heightmap} from "../Terrain/Heightmap";

const remote = require('@electron/remote');

export async function ImageImport(): Promise<Heightmap> {
    const Jimp = window.require('jimp');

    // Use the electron dialog module to prompt the user for a file path
    const {filePaths} = await remote.dialog.showOpenDialog({
        filters: [
            { name: 'PNG Files', extensions: ['png'] },
            { name: 'BMP Files', extensions: ['bmp'] },
        ],
        properties: ['openFile']
    });
    // Exit the function if the user cancels the save dialog
    if (!filePaths) throw new Error('No file selected');
    let promise: Promise<Heightmap>;

    try {

        promise = Jimp.read(filePaths[0]).then(img => {
            let arr = new Float32Array(img.bitmap.width * img.bitmap.height);
            img.scan(0, 0, img.bitmap.width, img.bitmap.height, function(x, y, idx) {
                const alpha = this.bitmap.data[idx + 3];
                arr[y * img.bitmap.width + x] = (alpha-122.5)/5;
            });


            let heightMap = new Heightmap(img.bitmap.width, img.bitmap.height, arr, 0 , 0);
            return heightMap;
        })
    }
    catch (e) {
        throw new Error(e);
    }
    return promise;
}