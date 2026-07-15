"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, useGLTF } from "@react-three/drei"
import { Suspense, useEffect, useMemo, useRef, useState } from "react"
import * as THREE from "three"
import type { GLTF } from "three-stdlib"

type PartName = "body" | "lid" | "slider"

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

const hingePivot = new THREE.Vector3(73.8, 71.8, -12.3)
const modelCenter = new THREE.Vector3(39.19, 40.5, -12.32)

const CustomizerPreview = () => {
  const [colors, setColors] = useState(initialColors)
  const [isOpen, setIsOpen] = useState(false)

  return (
    <section className="bg-zinc-950 text-white">
      <div className="content-container grid min-h-[calc(100vh-160px)] grid-cols-1 gap-6 py-5 small:grid-cols-[minmax(0,1fr)_22rem] small:gap-8 small:py-10">
        <div className="min-h-[27rem] overflow-hidden rounded-lg border border-white/10 bg-[radial-gradient(circle_at_32%_18%,rgba(237,143,31,0.18),transparent_34%),#09090b] small:min-h-[calc(100vh-240px)]">
          <Canvas
            camera={{ position: [0, 0, 8], fov: 34 }}
            gl={{ antialias: true, alpha: false }}
          >
            <color attach="background" args={["#09090b"]} />
            <ambientLight intensity={1.35} />
            <directionalLight position={[4, -5, 8]} intensity={3.1} />
            <directionalLight position={[-5, 4, 4]} intensity={1.1} />
            <Suspense fallback={null}>
              <DabPalModel colors={colors} isOpen={isOpen} />
            </Suspense>
            <OrbitControls
              autoRotate
              autoRotateSpeed={0.65}
              enableDamping
              enablePan={false}
              target={[0, 0, 0]}
              minDistance={3}
              maxDistance={10}
            />
          </Canvas>
        </div>

        <aside className="self-start rounded-lg border border-white/10 bg-white/[0.04] p-4 small:sticky small:top-24 small:p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-amber-300">
                Custom preview
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight">
                Build a Dab Pal
              </h1>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen((value) => !value)}
              className="shrink-0 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white hover:border-amber-300 hover:text-amber-200"
            >
              {isOpen ? "Closed" : "Open"}
            </button>
          </div>

          <div className="mt-6 grid gap-5">
            {(Object.keys(palettes) as PartName[]).map((part) => (
              <fieldset key={part} className="min-w-0">
                <legend className="text-sm font-semibold text-white">
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
                            : "border-white/20 hover:border-white/50"
                        }`}
                        style={{ backgroundColor: swatch.value }}
                      />
                    )
                  })}
                </div>
              </fieldset>
            ))}
          </div>

          <div className="mt-6 border-t border-white/10 pt-5">
            <dl className="grid grid-cols-3 gap-2 text-xs">
              {(Object.keys(colors) as PartName[]).map((part) => (
                <div key={part} className="min-w-0">
                  <dt className="text-white/45">{partLabels[part]}</dt>
                  <dd className="mt-1 truncate font-medium text-white">
                    {palettes[part].find((swatch) => swatch.value === colors[part])
                      ?.name ?? "Custom"}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>
      </div>
    </section>
  )
}

const DabPalModel = ({
  colors,
  isOpen,
}: {
  colors: Record<PartName, string>
  isOpen: boolean
}) => {
  const gltf = useGLTF(MODEL_URL) as GLTF
  const groupRef = useRef<THREE.Group>(null)
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
      mesh.geometry = mesh.geometry.clone()
      mesh.castShadow = true
      mesh.receiveShadow = true

      if (part === "lid") {
        mesh.geometry.translate(-hingePivot.x, -hingePivot.y, -hingePivot.z)
        mesh.position.copy(hingePivot)
      }
    })

    return scene
  }, [gltf.scene])

  const materials = useMemo(
    () => ({
      body: new THREE.MeshStandardMaterial({
        color: colors.body,
        roughness: 0.66,
        metalness: 0,
      }),
      lid: new THREE.MeshStandardMaterial({
        color: colors.lid,
        roughness: 0.64,
        metalness: 0,
      }),
      slider: new THREE.MeshStandardMaterial({
        color: colors.slider,
        roughness: 0.62,
        metalness: 0,
      }),
    }),
    [colors.body, colors.lid, colors.slider]
  )

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.z += delta * 0.08
    }
  })

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
        mesh.rotation.set(isOpen ? -1.18 : 0, 0, isOpen ? -0.18 : 0)
      }
    })
  }, [customScene, isOpen, materials.body, materials.lid, materials.slider])

  return (
    <group ref={groupRef} rotation={[1.28, 0, -0.38]} scale={0.036}>
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

useGLTF.preload(MODEL_URL)

export default CustomizerPreview
