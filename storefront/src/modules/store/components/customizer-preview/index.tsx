"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, useGLTF } from "@react-three/drei"
import { Button } from "@medusajs/ui"
import { HttpTypes } from "@medusajs/types"
import { Suspense, useEffect, useMemo, useRef, useState } from "react"
import * as THREE from "three"
import type { GLTF } from "three-stdlib"
import { toCreasedNormals } from "three/examples/jsm/utils/BufferGeometryUtils.js"
import { addToCart } from "@lib/data/cart"
import { dispatchCartChange } from "@lib/util/cart-events"

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

const defaultViewRotation: [number, number, number] = [0, Math.PI, -0.05]
const layerHeightMm = 0.2
const hingePivot = new THREE.Vector3(73.8, 71.8, -12.3)
const modelCenter = new THREE.Vector3(39.19, 40.5, -12.32)

const CUSTOM_SKU = "DABPAL-CUSTOM-SINGLE"
const COUNTRY = "us"

const CustomizerPreview = ({
  product,
  ordersEnabled = false,
}: {
  product?: HttpTypes.StoreProduct | null
  ordersEnabled?: boolean
}) => {
  const [colors, setColors] = useState(initialColors)
  const [isOpen, setIsOpen] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [activePart, setActivePart] = useState<PartName | null>(null)
  const [isCoarsePointer, setIsCoarsePointer] = useState(false)
  const [modelDragRotation, setModelDragRotation] = useState(0)
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const customVariant =
    ordersEnabled
      ? product?.variants?.find((variant) => variant.sku === CUSTOM_SKU) ??
        product?.variants?.[0]
      : undefined
  const selectedColors = getSelectedColors(colors)
  const colorSummary = formatColorSummary(selectedColors)

  useEffect(() => {
    return () => {
      if (tapTimerRef.current) {
        clearTimeout(tapTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const media = window.matchMedia("(pointer: coarse)")
    const update = () => setIsCoarsePointer(media.matches)

    update()
    media.addEventListener("change", update)

    return () => media.removeEventListener("change", update)
  }, [])

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.style.touchAction = isCoarsePointer ? "pan-y" : "auto"
    }
  }, [isCoarsePointer])

  const handleModelTap = () => {
    if (tapTimerRef.current) {
      clearTimeout(tapTimerRef.current)
      tapTimerRef.current = null
      setIsOpen(false)
      return
    }

    tapTimerRef.current = setTimeout(() => {
      setIsOpen((value) => !value)
      tapTimerRef.current = null
    }, 220)
  }

  const handleAddToCart = async () => {
    if (!customVariant?.id) return

    setIsAdding(true)
    try {
      await addToCart({
        variantId: customVariant.id,
        quantity: 1,
        countryCode: COUNTRY,
        metadata: {
          custom_build: "dab-pal",
          custom_colors: selectedColors,
          custom_color_summary: colorSummary,
        },
      })
      dispatchCartChange()
    } finally {
      setIsAdding(false)
    }
  }

  const setPartColor = (part: PartName, value: string) => {
    setColors((current) => ({
      ...current,
      [part]: value,
    }))

    if (part === "slider") {
      setIsOpen(true)
    }
  }

  return (
    <section className="bg-white text-zinc-950">
      <div className="content-container grid min-h-[calc(100vh-160px)] grid-cols-1 gap-6 py-5 small:grid-cols-[minmax(0,1fr)_22rem] small:gap-10 small:py-10">
        <div className="order-2 min-h-[27rem] cursor-pointer overflow-hidden bg-white small:order-none small:min-h-[calc(100vh-240px)]">
          <Canvas
            className="dab-pal-customizer-canvas"
            camera={{ position: [0, 0, 8], fov: 34 }}
            gl={{ antialias: true, alpha: false }}
            onCreated={({ gl }) => {
              canvasRef.current = gl.domElement
              gl.domElement.style.touchAction = isCoarsePointer
                ? "pan-y"
                : "auto"
            }}
            style={{ touchAction: isCoarsePointer ? "pan-y" : "none" }}
          >
            <color attach="background" args={["#ffffff"]} />
            <ambientLight intensity={1.45} />
            <hemisphereLight args={["#ffffff", "#d8d4cc", 0.75]} />
            <directionalLight position={[3, -4, 7]} intensity={0.65} />
            <directionalLight position={[-5, 4, 4]} intensity={0.28} />
            <Suspense fallback={null}>
              <DabPalModel
                dragRotation={modelDragRotation}
                colors={colors}
                isDragEnabled={isCoarsePointer}
                isOpen={isOpen}
                onDrag={(delta) => setModelDragRotation((value) => value + delta)}
                onTap={handleModelTap}
              />
            </Suspense>
            <OrbitControls
              enabled={!isCoarsePointer}
              enableDamping
              enablePan={false}
              target={[0, 0, 0]}
              minDistance={3}
              maxDistance={10}
            />
          </Canvas>
        </div>

        <aside className="order-1 self-start bg-white p-4 small:order-none small:sticky small:top-24 small:p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-amber-600">
              Custom color
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              Design your Dab Pal
            </h1>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              Choose the body, lid, and slider colors, preview the build, and
              get a made-to-order case printed in NY.
            </p>
          </div>

          <div className="relative mt-5 small:hidden">
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(palettes) as PartName[]).map((part) => {
                const selected = getSwatchByValue(part, colors[part])
                const isActive = activePart === part

                return (
                  <button
                    key={part}
                    type="button"
                    onClick={() =>
                      setActivePart((current) =>
                        current === part ? null : part
                      )
                    }
                    className={`min-w-0 rounded-lg border px-2 py-2 text-left transition ${
                      isActive
                        ? "border-amber-400 bg-amber-50"
                        : "border-zinc-200 bg-white"
                    }`}
                    aria-expanded={isActive}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        aria-hidden
                        className="h-5 w-5 shrink-0 rounded-full border border-zinc-300"
                        style={{ backgroundColor: selected.value }}
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-[11px] font-semibold text-zinc-950">
                          {partLabels[part]}
                        </span>
                        <span className="block truncate text-[11px] text-zinc-500">
                          {selected.name}
                        </span>
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>

            {activePart && (
              <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 rounded-lg border border-zinc-200 bg-white p-3 shadow-lg">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-zinc-950">
                    {partLabels[activePart]}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActivePart(null)}
                    className="text-xs font-medium text-zinc-500"
                  >
                    Close
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {palettes[activePart].map((swatch) => {
                    const isSelected = colors[activePart] === swatch.value

                    return (
                      <button
                        key={swatch.name}
                        type="button"
                        aria-label={`${partLabels[activePart]} ${swatch.name}`}
                        title={swatch.name}
                        onClick={() => {
                          setPartColor(activePart, swatch.value)
                          setActivePart(null)
                        }}
                        className={`grid gap-1 rounded-md border p-2 text-center transition ${
                          isSelected
                            ? "border-amber-400 bg-amber-50"
                            : "border-zinc-200 bg-white"
                        }`}
                      >
                        <span
                          aria-hidden
                          className="mx-auto h-8 w-8 rounded-full border border-zinc-300"
                          style={{ backgroundColor: swatch.value }}
                        />
                        <span className="truncate text-[10px] font-medium text-zinc-700">
                          {swatch.name}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 hidden gap-5 small:grid">
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
                        onClick={() => setPartColor(part, swatch.value)}
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

          <div className="hidden small:block">
            <BuildSummary
              colors={colors}
              colorSummary={colorSummary}
              customVariant={customVariant}
              isAdding={isAdding}
              onAddToCart={handleAddToCart}
              ordersEnabled={ordersEnabled}
            />
          </div>
        </aside>

        <div className="order-3 small:hidden">
          <BuildSummary
            colors={colors}
            colorSummary={colorSummary}
            customVariant={customVariant}
            isAdding={isAdding}
            onAddToCart={handleAddToCart}
            ordersEnabled={ordersEnabled}
          />
        </div>
      </div>
    </section>
  )
}

const BuildSummary = ({
  colors,
  colorSummary,
  customVariant,
  isAdding,
  onAddToCart,
  ordersEnabled,
}: {
  colors: Record<PartName, string>
  colorSummary: string
  customVariant?: HttpTypes.StoreProductVariant
  isAdding: boolean
  onAddToCart: () => void
  ordersEnabled: boolean
}) => (
  <div className="mt-6 border-t border-zinc-200 pt-5">
    <dl className="grid grid-cols-3 gap-2 text-xs">
      {(Object.keys(colors) as PartName[]).map((part) => (
        <div key={part} className="min-w-0">
          <dt className="text-zinc-500">{partLabels[part]}</dt>
          <dd className="mt-1 truncate font-medium text-zinc-950">
            {getSwatchByValue(part, colors[part]).name}
          </dd>
        </div>
      ))}
    </dl>
    <p className="mt-4 text-sm font-medium text-zinc-600">{colorSummary}</p>
    <div className="mt-5 grid gap-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-zinc-950">Custom Dab Pal</span>
        <span className="font-semibold text-zinc-950">$35</span>
      </div>
      <Button
        type="button"
        onClick={onAddToCart}
        disabled={!ordersEnabled || !customVariant?.id || isAdding}
        isLoading={isAdding}
        variant="primary"
        className="h-10 w-full rounded-lg"
      >
        {ordersEnabled && customVariant?.id
          ? "Add custom to cart"
          : "Customs opening soon"}
      </Button>
    </div>
  </div>
)

const DabPalModel = ({
  dragRotation,
  colors,
  isDragEnabled,
  isOpen,
  onDrag,
  onTap,
}: {
  dragRotation: number
  colors: Record<PartName, string>
  isDragEnabled: boolean
  isOpen: boolean
  onDrag: (delta: number) => void
  onTap: () => void
}) => {
  const gltf = useGLTF(MODEL_URL) as GLTF
  const dragRef = useRef<{
    lastX: number
    moved: boolean
    pointerId: number
  } | null>(null)
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
        mesh.rotation.set(0, 0, isOpen ? -1.05 : 0)
      }
    })
  }, [customScene, isOpen, materials.body, materials.lid, materials.slider])

  return (
    <group
      onClick={(event) => {
        if (isDragEnabled) return
        event.stopPropagation()
        onTap()
      }}
      onPointerDown={(event) => {
        if (!isDragEnabled) return
        event.stopPropagation()
        dragRef.current = {
          lastX: event.clientX,
          moved: false,
          pointerId: event.pointerId,
        }

        const target = event.target as HTMLElement & {
          setPointerCapture?: (pointerId: number) => void
        }
        target.setPointerCapture?.(event.pointerId)
      }}
      onPointerMove={(event) => {
        if (!isDragEnabled || !dragRef.current) return
        event.stopPropagation()

        const deltaX = event.clientX - dragRef.current.lastX
        if (Math.abs(deltaX) > 2) {
          dragRef.current.moved = true
          dragRef.current.lastX = event.clientX
          onDrag(deltaX * 0.012)
        }
      }}
      onPointerUp={(event) => {
        if (!isDragEnabled || !dragRef.current) return
        event.stopPropagation()

        const wasDrag = dragRef.current.moved
        const pointerId = dragRef.current.pointerId
        dragRef.current = null

        const target = event.target as HTMLElement & {
          releasePointerCapture?: (pointerId: number) => void
        }
        target.releasePointerCapture?.(pointerId)

        if (!wasDrag) {
          onTap()
        }
      }}
      onPointerCancel={() => {
        dragRef.current = null
      }}
      position={isOpen ? [0, -0.55, 0] : [0, 0, 0]}
      rotation={[
        defaultViewRotation[0],
        defaultViewRotation[1] + dragRotation,
        defaultViewRotation[2],
      ]}
      scale={isOpen ? 0.027 : 0.036}
    >
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

const getSwatchByValue = (part: PartName, value: string) =>
  palettes[part].find((swatch) => swatch.value === value) ?? {
    name: "Custom",
    value,
  }

const getSelectedColors = (colors: Record<PartName, string>) => ({
  body: getSwatchByValue("body", colors.body),
  lid: getSwatchByValue("lid", colors.lid),
  slider: getSwatchByValue("slider", colors.slider),
})

const formatColorSummary = (colors: ReturnType<typeof getSelectedColors>) =>
  `Body: ${colors.body.name} (${colors.body.value}), Lid: ${colors.lid.name} (${colors.lid.value}), Slider: ${colors.slider.name} (${colors.slider.value})`

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
  const isBlack = color === "#252525"
  const displayColor = isBlack ? "#343330" : color
  const material = new THREE.MeshStandardMaterial({
    color: displayColor,
    emissive: isBlack ? "#141312" : "#000000",
    emissiveIntensity: isBlack ? 0.18 : 0,
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
