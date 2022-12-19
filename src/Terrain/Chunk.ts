import type { Heightmap } from './Heightmap'
import { colorGrayScaleFromAltitude, colorRGBFromAltitude, rgb } from './PointColor';

export class Chunk {
    // chunk width and height
    readonly scale: number;

    // number of vertices in each column or row 
    readonly size: number;

    // terrain vertices on xy place (row-major, rows along x-axis)
    // all values in [-scale; scale]
    vertices: Float32Array;

    vertexColors: Float32Array;

    // terrain indices on xy plane
    // suitable for rendering with GL_TRIANGLES (Mesh in three.js)
    indices: Uint32Array;

    // terrain heightmap
    heightmap: Heightmap;

    constructor(scale: number, heightmap: Heightmap) {
        this.scale = scale
        this.size = heightmap.size
        this.heightmap = heightmap

        this.generateVertices()
        this.generateVertexColors()
        this.generateIndices()
    }

    private generateVertices() {
        this.vertices = new Float32Array(3*this.size*this.size)
        
        const spaceBetweenVertices = this.scale / (this.size - 1)
        const offset = this.scale / 2;

        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const base = this.mIndex(i, j)
                const hBase = this.mIndex(
                    this.heightmap.offsetY + i,
                    this.heightmap.offsetX + j
                )

                this.vertices[3*base] = spaceBetweenVertices * j - offset
                this.vertices[3*base+1] = spaceBetweenVertices * i - offset
                this.vertices[3*base+2] = this.heightmap.data[hBase]
            }
        }
    }

    private generateVertexColors() {
        this.vertexColors = new Float32Array(3*this.size*this.size)

        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const base = this.mIndex(i, j)
                const hBase = this.mIndex(
                    this.heightmap.offsetY + i,
                    this.heightmap.offsetX + j
                )

                const colorRGB = colorRGBFromAltitude(this.heightmap.data[hBase])

                this.vertexColors[3*base] = ((colorRGB >> 16) & 0xFF) / 255
                this.vertexColors[3*base+1] = ((colorRGB >> 8) & 0xFF) / 255
                this.vertexColors[3*base+2] = (colorRGB & 0xFF) / 255

                /*const colorGrayScale = colorGrayScaleFromAltitude(this.heightmap.data[hBase]) / 255
                console.log(colorGrayScale)

                for (let k = 0; k < 3; k++)
                    this.vertexColors[3*base+k] = colorGrayScale*/
             }
        }        
    }

    private generateIndices() {
        const triangleCount = 2 * this.size * this.size
        this.indices = new Uint32Array(3 * triangleCount)

        for (let i = 0; i < this.size - 1; i++) {
            for (let j = 0; j < this.size - 1; j++) {
                const base = this.mIndex(i, j)

                this.indices[3*(2*base)] = base
                this.indices[3*(2*base)+1] = base + 1
                this.indices[3*(2*base)+2] = base + this.size

                this.indices[3*(2*base+1)] = base + this.size
                this.indices[3*(2*base+1)+1] = base + 1;
                this.indices[3*(2*base+1)+2] = base + this.size + 1
            }
        }
    }

    private mIndex(i: number, j: number): number {
        return i * this.size + j
    }


}