import * as THREE from "three";
import { DEFAULT_RENDER_DISTANCE, FOG_START_FACTOR, QUALITY_PRESETS, type QualityLevel } from "../config";

export interface ChunkMaterials {
  terrain: THREE.ShaderMaterial;
  water: THREE.ShaderMaterial;
  plants: THREE.ShaderMaterial;
}

const vertexShader = `
attribute float sky;
attribute float block;
varying float vSky;
varying float vBlock;
varying float vShade;
varying vec2 vUv;
varying vec3 vWorldPosition;
void main() {
  vec3 n = normalize(mat3(modelMatrix) * normal);
  vSky = sky;
  vBlock = block;
  vShade = n.y > 0.5 ? 1.0 : n.y < -0.5 ? 0.5 : abs(n.z) > 0.5 ? 0.8 : 0.6;
  vUv = uv;
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
`;

const fragmentShader = `
uniform sampler2D uAtlas;
uniform float uDay;
uniform float uMinLight;
uniform vec3 uFogColor;
uniform float uFogDensity;
uniform float uFogStartFactor;
uniform float uFogDistance;
uniform vec3 uCameraPosition;
uniform float uWaterAlpha;
uniform float uAlphaTest;
varying float vSky;
varying float vBlock;
varying float vShade;
varying vec2 vUv;
varying vec3 vWorldPosition;
void main() {
  vec4 tex = texture2D(uAtlas, vUv);
  if (tex.a < uAlphaTest) discard;
  float light = max(max(uDay * vSky, vBlock), uMinLight);
  vec3 litColor = tex.rgb * light * vShade;
  float fogStart = uFogDistance * uFogStartFactor;
  float fogRange = max(uFogDistance - fogStart, 0.0001);
  float fogProgress = clamp((distance(vWorldPosition, uCameraPosition) - fogStart) / fogRange, 0.0, 1.0);
  float fogAmount = 1.0 - exp(-3.0 * uFogDensity * fogProgress);
  float alpha = tex.a * uWaterAlpha;
  gl_FragColor = vec4(mix(litColor, uFogColor, fogAmount), alpha);
}
`;

export function createChunkMaterials(
  atlas: THREE.Texture,
  quality: QualityLevel = "medium"
): ChunkMaterials {
  const commonUniforms = {
    uAtlas: { value: atlas },
    uDay: { value: 1 },
    uMinLight: { value: 0.12 },
    uFogColor: { value: new THREE.Color(0.62, 0.76, 0.9) },
    uFogDensity: { value: QUALITY_PRESETS[quality].fogDensity },
    uFogStartFactor: { value: FOG_START_FACTOR },
    uFogDistance: { value: DEFAULT_RENDER_DISTANCE * 16 },
    uCameraPosition: { value: new THREE.Vector3() }
  };
  const makeUniforms = (alpha: number, alphaTest: number): THREE.ShaderMaterialParameters["uniforms"] => ({
    ...commonUniforms,
    uWaterAlpha: { value: alpha },
    uAlphaTest: { value: alphaTest }
  });

  return {
    terrain: new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: makeUniforms(1, 0)
    }),
    water: new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: makeUniforms(0.75, 0),
      transparent: true,
      depthWrite: false
    }),
    plants: new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: makeUniforms(1, 0.5),
      side: THREE.DoubleSide,
      alphaTest: 0.5
    })
  };
}
