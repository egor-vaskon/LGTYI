import * as THREE from 'three'
import { applyDefaults } from '../Defaults'
import type { Chunk } from '../Terrain/Chunk'
import  { type RenderOptions, DefaultRenderOptions } from './RenderOptions'
import { Color } from 'three'

export class RenderChunk extends THREE.Object3D {
    constructor(offset: THREE.Vector3, chunk: Chunk, options: RenderOptions = DefaultRenderOptions) {
        super()

        applyDefaults(options, DefaultRenderOptions)

        const terrain = this.createTerrain(offset, chunk, options)
        super.add(terrain)
    }

    private createTerrain(offset: THREE.Vector3, chunk: Chunk, options: RenderOptions): THREE.Object3D {
        const geometry = new THREE.BufferGeometry()

        const posAttr = new THREE.BufferAttribute(chunk.vertices, 3)
        geometry.setAttribute('position', posAttr)

        if (chunk.useVertexColors) {
            const colorAttr = new THREE.BufferAttribute(chunk.vertexColors, 3)
            geometry.setAttribute('color', colorAttr)
        }

        const indexAttr = new THREE.BufferAttribute(chunk.indices, 1)
        geometry.setIndex(indexAttr)

        if (options.prepareForLighting)
            geometry.computeVertexNormals()

        const mat = this.createTerrainMaterial(options)

        const terrain = new THREE.Mesh(geometry, mat)
        terrain.position.add(offset)

        if (options.useWireframe) {
            const wireframeGeometry = new THREE.WireframeGeometry(geometry)

            const wireframeMat = new THREE.LineBasicMaterial({ 
                color: options.wireframeColor,
                linewidth: options.wireframeLineWidth,
                opacity: options.wireframeOpacity,
                depthTest: true,
                transparent: true
            })

            const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMat)
            terrain.add(wireframe)
        }

        return terrain
    }

    private createTerrainMaterial(options: RenderOptions): THREE.Material {
        const mat = options.prepareForLighting ? 
                                    new THREE.MeshLambertMaterial() :
                                    new THREE.MeshBasicMaterial()

        if (options.vertexColors)
            mat.vertexColors = true
        else
            mat.color.set(0x000000)
        
        return mat
    }
}