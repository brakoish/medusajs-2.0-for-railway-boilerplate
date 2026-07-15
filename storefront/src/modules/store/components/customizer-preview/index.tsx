"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, useGLTF } from "@react-three/drei"
import { Suspense, useEffect, useMemo, useState } from "react"
import * as THREE from "three"
import type { GLTF } from "three-stdlib"
import { toCreasedNormals } from "three/examples/jsm/utils/BufferGeometryUtils.js"

type PartName = "body" | "lid" | "slider"
type ViewName = "iso" | "side" | "top"

type Swatch = {
  name: string
  value: string
}

const MODEL_URL = "/dab-pal/customizer/dab-pal-customizer.glb"

const palettes: Record<PartName, Swatch[]> = {
  body: [
    { name: "Black", value: "#252525" },
    { name: "White", value: "#f6f6f3" },
    { name: "Pink", value: "#f4a8bf" },
    { name: "Amber", value: "#ed8f1f" },
    { name: "Sage", value: "#8fa78f" },
  ],
  lid: [
    { name: "Black", value: "#252525" },
    { name: "White", value: "#f6f6f3" },
    { name: "Amber", value: "#ed8f1f" },
    { name: "Pink", value: "#f4a8bf" },
    { name: "Blue", value: "#6f95c9" },
  ],
  slider: [
    { name: "White", value: "#f6f6f3" },
    { name: "Black", value: "#252525" },
    { name: "Amber", value: "#ed8f1f" },
    { name: "Pink", value: "#f4a8bf" },
    { name: "Sage", value: "#8fa78f" },
  ],
}

const initialColors: Record<PartName, string> = {
  body: "#252525",
  lid: "#ed8f1f",
  slider: "#f4a8bf",
}

const partLabels: Record<PartName, string> = {
  body: "Body",
  lid: "Lid",
  slider: "Slider",
}

const viewLabels: Record<ViewName, string> = {
  iso: "Iso",
  side: "Side",
  top: "Top",
}

const viewRotations: Record<ViewName, [number, number, number]> = {
  iso: [1.12, 0, -0.48],
  side: [1.52, 0, -1.57],
  top: [0, Math.PI, -0.05],
}

const layerHeightMm = 0.2
const hingePivot = new THREE.Vector3(73.8, 71.8, -12.3)
const modelCenter = new THREE.Vector3(39.19, 40.5, -12.32)

const CustomizerPreview = () => {
  const [colors, setColors] = useState(initialColors)
  const [view, setView] = useState<ViewName>("top")

  return (
    <section className="bg-white text-zinc-950">
      <div className="content-container grid min-h-[calc(100vh-160px)] grid-cols-1 gap-6 py-5 small:grid-cols-[minmax(0,1fr)_22rem] small:gap-10 small:py-10">
        <div className="min-h-[27rem] overflow-hidden bg-white small:min-h-[calc(100vh-240px)]">
          <Canvas
            camera={{ position: [0, 0, 8], fov: 34 }}
            gl={{ antialias: true, alpha: false }}
          >
            <color attach="background" args={["#ffffff"]} />
            <ambientLight intensity={1.45} />
            <hemisphereLight args={["#ffffff", "#d8d4cc", 0.75]} />
            <directionalLight position={[3, -4, 7]} intensity={0.65} />
            <directionalLight position={[-5, 4, 4]} intensity={0.28} />
            <Suspense fallback={null}>
              <DabPalModel colors={colors} view={view} />
            </Suspense>
            <OrbitControls
              enableDamping
              enablePan={false}
              target={[0, 0, 0]}
              minDistance={3}
              maxDistance={10}
            />
          </Canvas>
        </div>

        <aside className="self-start bg-white p-4 small:sticky small:top-24 small:p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-amber-600">
              Coming soon
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              Design your Dab Pal
            </h1>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              Choose the body, lid, and slider colors, preview the build, and
              get a made-to-order case printed in NY.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2 rounded-full bg-zinc-100 p-1">
            {(Object.keys(viewLabels) as ViewName[]).map((viewName) => (
              <button
                key={viewName}
                type="button"
                onClick={() => setView(viewName)}
                className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
                  view === viewName
                    ? "bg-zinc-950 text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-950"
                }`}
              >
                {viewLabels[viewName]}
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-5">
            {(Object.keys(palettes) as PartName[]).map((part) => (
              <fieldset key={part} className="min-w-0">
                <legend className="text-sm font-semibold text-zinc-950">
                  {partLabels[part]}
                </legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {palettes[part].map((swatch) => {
                    const isSelected = colors[part] === swatch.value

                    return (
                      <button
                        key={swatch.name}
                        type="button"
                        aria-label={`${partLabels[part]} ${swatch.name}`}
                        title={swatch.name}
                        onClick={() =>
                          setColors((current) => ({
                            ...current,
                            [part]: swatch.value,
                          }))
                        }
                        className={`h-9 w-9 rounded-full border transition ${
                          isSelected
                            ? "border-amber-300 ring-2 ring-amber-300/35"
                            : "border-zinc-300 hover:border-zinc-500"
                        }`}
                        style={{ backgroundColor: swatch.value }}
                      />
                    )
                  })}
                </div>
              </fieldset>
            ))}
          </div>

          <div className="mt-6 border-t border-zinc-200 pt-5">
            <dl className="grid grid-cols-3 gap-2 text-xs">
              {(Object.keys(colors) as PartName[]).map((part) => (
                <div key={part} className="min-w-0">
                  <dt className="text-zinc-500">{partLabels[part]}</dt>
                  <dd className="mt-1 truncate font-medium text-zinc-950">
                    {palettes[part].find((swatch) => swatch.value === colors[part])
                      ?.name ?? "Custom"}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-sm font-medium text-zinc-600">
              Custom color ordering opens soon.
            </p>
          </div>
        </aside>
      </div>
    </section>
  )
}

const DabPalModel = ({
  colors,
  view,
}: {
  colors: Record<PartName, string>
  view: ViewName
}) => {
  const gltf = useGLTF(MODEL_URL) as GLTF
  const customScene = useMemo(() => {
    const scene = gltf.scene.clone(true)
    const orderedParts: PartName[] = ["body", "slider", "lid"]
    let meshIndex = 0

    scene.traverse((object) => {
      const mesh = object as THREE.Mesh & { isMesh?: boolean }
      if (!mesh.isMesh) return

      const part = getPartName(mesh.name) ?? orderedParts[meshIndex]
      mesh.userData.customizerPart = part
      meshIndex += 1
      mesh.geometry = toCreasedNormals(mesh.geometry.clone(), Math.PI / 5)
      mesh.castShadow = true
      mesh.receiveShadow = true

      if (part === "lid") {
        mesh.geometry.translate(-hingePivot.x, -hingePivot.y, -hingePivot.z)
        mesh.position.copy(hingePivot)
      }

      mesh.add(createEdgeOverlay(mesh.geometry, part))
    })

    return scene
  }, [gltf.scene])

  const materials = useMemo(
    () => ({
      body: createPrintedMaterial(colors.body, "body"),
      lid: createPrintedMaterial(colors.lid, "lid"),
      slider: createPrintedMaterial(colors.slider, "slider"),
    }),
    [colors.body, colors.lid, colors.slider]
  )

  useEffect(() => {
    customScene.traverse((object) => {
      const mesh = object as THREE.Mesh & { isMesh?: boolean }
      if (!mesh.isMesh) return
      const part = mesh.userData.customizerPart as PartName | undefined

      if (part === "body") {
        mesh.material = materials.body
      }
      if (part === "slider") {
        mesh.material = materials.slider
      }
      if (part === "lid") {
        mesh.material = materials.lid
        mesh.rotation.set(0, 0, 0)
      }
    })
  }, [customScene, materials.body, materials.lid, materials.slider])

  return (
    <group rotation={viewRotations[view]} scale={0.036}>
      <group position={modelCenter.clone().multiplyScalar(-1)}>
        <primitive object={customScene} />
      </group>
    </group>
  )
}

const getPartName = (name: string): PartName | null => {
  if (name.includes("Body")) return "body"
  if (name.includes("Slide")) return "slider"
  if (name.includes("Top")) return "lid"

  return null
}

const createEdgeOverlay = (geometry: THREE.BufferGeometry, part: PartName) => {
  const edges = new THREE.EdgesGeometry(geometry, 32)
  const material = new THREE.LineBasicMaterial({
    color: part === "lid" ? "#fff7df" : "#ffffff",
    transparent: true,
    opacity: part === "body" ? 0.1 : 0.09,
    depthWrite: false,
  })

  return new THREE.LineSegments(edges, material)
}

const createPrintedMaterial = (color: string, part: PartName) => {
  const displayColor = color === "#252525" ? "#343330" : color
  const material = new THREE.MeshStandardMaterial({
    color: displayColor,
    emissive: color === "#252525" ? "#141312" : "#000000",
    emissiveIntensity: color === "#252525" ? 0.18 : 0,
    roughness: 0.94,
    metalness: 0,
  })

  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace(
        "void main() {",
        `
varying vec3 vPrintPosition;

void main() {
`
      )
      .replace(
        "#include <begin_vertex>",
        `
#include <begin_vertex>
vPrintPosition = position;
`
      )

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "void main() {",
        `
varying vec3 vPrintPosition;

void main() {
`
      )
      .replace(
        "#include <color_fragment>",
        `
#include <color_fragment>
float layerCoord = vPrintPosition.y / ${layerHeightMm.toFixed(1)};
float layerDistance = abs(fract(layerCoord) - 0.5);
float layerLine = 1.0 - smoothstep(0.025, 0.18, layerDistance);
float printGrain = fract(sin(dot(vPrintPosition.xy, vec2(12.9898, 78.233))) * 43758.5453);
diffuseColor.rgb *= 1.0 - (layerLine * 0.075);
diffuseColor.rgb += (printGrain - 0.5) * 0.008;
`
      )
  }

  material.customProgramCacheKey = () => `dab-pal-printed-${part}-${color}`

  return material
}

useGLTF.preload(MODEL_URL)

export default CustomizerPreview
