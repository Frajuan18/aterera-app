/* eslint-disable react/no-unknown-property */
import React, { forwardRef, useRef, useMemo, useLayoutEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { ArrowRight, Sparkles } from "lucide-react";

// --- Types ---
interface SilkPlaneProps {
  uniforms: { [key: string]: { value: any } };
}

// --- Shader Utilities ---
const hexToNormalizedRGB = (hex: string): [number, number, number] => {
  const cleanHex = hex.replace('#', '');
  return [
    parseInt(cleanHex.slice(0, 2), 16) / 255,
    parseInt(cleanHex.slice(2, 4), 16) / 255,
    parseInt(cleanHex.slice(4, 6), 16) / 255
  ];
};

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
uniform float uTime;
uniform vec3 uColor;
uniform float uSpeed;
uniform float uScale;
uniform float uNoiseIntensity;

const float e = 2.71828182845904523536;

float noise(vec2 texCoord) {
  float G = e;
  vec2 r = (G * sin(G * texCoord));
  return fract(r.x * r.y * (1.0 + texCoord.x));
}

void main() {
  float rnd = noise(gl_FragCoord.xy);
  vec2 tex = vUv * uScale;
  float tOffset = uSpeed * uTime;
  tex.y += 0.03 * sin(8.0 * tex.x - tOffset);
  float pattern = 0.6 + 0.4 * sin(5.0 * (tex.x + tex.y + cos(3.0 * tex.x + 5.0 * tex.y) + 0.02 * tOffset));
  vec4 col = vec4(uColor, 1.0) * vec4(pattern) - rnd / 15.0 * uNoiseIntensity;
  gl_FragColor = vec4(col.rgb, 1.0);
}
`;

// --- SilkPlane Component ---
const SilkPlane = forwardRef<THREE.Mesh, SilkPlaneProps>(({ uniforms }, ref) => {
  const { viewport } = useThree();
  
  useLayoutEffect(() => {
    if (ref && 'current' in ref && ref.current) {
      ref.current.scale.set(viewport.width, viewport.height, 1);
    }
  }, [viewport, ref]);

  useFrame((_, delta) => {
    if (ref && 'current' in ref && ref.current) {
      (ref.current.material as THREE.ShaderMaterial).uniforms.uTime.value += 0.1 * delta;
    }
  });

  return (
    <mesh ref={ref}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial 
        uniforms={uniforms} 
        vertexShader={vertexShader} 
        fragmentShader={fragmentShader} 
        transparent={true}
      />
    </mesh>
  );
});

SilkPlane.displayName = "SilkPlane";

// --- Main Hero Section ---
export const HeroSection: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  const uniforms = useMemo(() => ({
    uSpeed: { value: 1.2 }, // Slightly slower for a "thoughtful" atmosphere
    uScale: { value: 1.3 },
    uNoiseIntensity: { value: 0.3 },
    uColor: { value: new THREE.Color(...hexToNormalizedRGB('#080808')) },
    uTime: { value: 0 }
  }), []);

  return (
    <div className="relative min-h-screen w-full bg-[#050505] font-['Poppins',sans-serif] overflow-hidden antialiased text-white">
      
      {/* Interactive Background Canvas */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-60">
        <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 1] }}>
          <SilkPlane ref={meshRef} uniforms={uniforms} />
        </Canvas>
      </div>

      {/* Hero Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center pt-20">
        
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-[12px] font-medium text-neutral-400 mb-10 backdrop-blur-md shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-neutral-200" />
          Capture thoughts at the speed of light
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-8xl font-bold tracking-tighter max-w-5xl leading-[1.05] mb-8">
          The sanctuary <br />
          <span className="text-neutral-500 font-medium">for your thoughts.</span>
        </h1>

        {/* Description */}
        <p className="max-w-xl text-neutral-400 text-lg md:text-xl font-medium mb-12 leading-relaxed">
          Aterera is a minimal, encrypted space for deep thinkers. 
          Capture ideas, link notes, and build your digital second brain.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-5 items-center">
          <button className="h-12 px-10 rounded-xl bg-white text-black font-bold text-sm hover:bg-neutral-200 transition-all flex items-center gap-2 shadow-lg shadow-white/5 active:scale-95">
            Start Writing Free <ArrowRight className="w-4 h-4" />
          </button>
          <button className="h-12 px-10 rounded-xl border border-white/10 bg-white/5 text-white font-bold text-sm hover:bg-white/10 backdrop-blur-md transition-all active:scale-95">
            Download Desktop App
          </button>
        </div>
      </main>

      {/* Section Transition Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050505] to-transparent z-20" />
    </div>
  );
};

export default HeroSection;