/* eslint-disable react/no-unknown-property */
import React, { forwardRef, useRef, useMemo, useLayoutEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { X, Check } from "lucide-react";

// --- The Silk Shader Logic ---
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

void main() {
  vec2 uv = vUv;
  float t = uTime * 0.5; // Increased speed for visibility
  
  // Denser wave math to create "silk threads"
  float wave = sin(uv.x * 6.0 + t) * cos(uv.y * 4.0 + t) * 0.3;
  float wave2 = sin(uv.y * 10.0 + t * 0.8) * 0.1;
  
  float pattern = 0.5 + 0.5 * sin(15.0 * (uv.x + uv.y + wave + wave2));
  
  // High contrast peak for the silk texture
  vec3 finalColor = uColor * pow(pattern, 2.0);
  
  gl_FragColor = vec4(finalColor, 1.0);
}
`;

const SilkPlane = forwardRef<THREE.Mesh, { uniforms: any }>(({ uniforms }, ref) => {
  const { viewport } = useThree();
  
  useLayoutEffect(() => {
    if (ref && 'current' in ref && ref.current) {
      ref.current.scale.set(viewport.width, viewport.height, 1);
    }
  }, [viewport, ref]);

  useFrame((state) => {
    if (ref && 'current' in ref && ref.current) {
      (ref.current.material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.getElapsedTime();
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

export const ProblemSolution: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  const uniforms = useMemo(() => ({
    // Light gray/silver color ensures it "shimmers" on black
    uColor: { value: new THREE.Color('#333333') }, 
    uTime: { value: 0 }
  }), []);

  const items = [
    { p: "Notes are messy", s: "Clean workspace" },
    { p: "Hard to revise", s: "Instant summaries" },
    { p: "Too much content", s: "Smart study tools" },
    { p: "Disconnected ideas", s: "Neural linking" }
  ];

  return (
    <section className="relative w-full min-h-[700px] py-32 bg-[#050505] overflow-hidden antialiased flex items-center justify-center">
      
      {/* THE SILK BACKGROUND - Forced to fill entire section */}
      <div className="absolute inset-0 z-0">
        <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 1] }}>
          <SilkPlane ref={meshRef} uniforms={uniforms} />
        </Canvas>
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-2xl mx-auto px-6 w-full">
        <div className="text-center mb-16">
          <h2 className="text-white text-4xl md:text-5xl font-bold tracking-tighter mb-4 font-['Poppins']">
            The Aterera Shift
          </h2>
          <div className="h-[1px] w-20 bg-white/20 mx-auto" />
        </div>

        <div className="space-y-3">
          {items.map((item, i) => (
            <div 
              key={i} 
              className="flex items-center justify-between gap-4 p-6 rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-xl group hover:border-white/20 transition-all duration-500"
            >
              {/* Problem Side */}
              <div className="flex items-center gap-4 flex-1">
                <X className="w-4 h-4 text-neutral-600 group-hover:text-red-500 transition-colors" />
                <span className="text-neutral-500 text-[15px] font-medium font-['Poppins']">
                  {item.p}
                </span>
              </div>

              {/* Center Divider */}
              <div className="h-6 w-px bg-white/10" />

              {/* Solution Side */}
              <div className="flex items-center gap-4 flex-1 justify-end">
                <span className="text-white text-[15px] font-semibold font-['Poppins'] tracking-tight">
                  {item.s}
                </span>
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-lg">
                  <Check className="w-4 h-4 text-black" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edge Fades for Section Blending */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#050505] to-transparent z-10" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050505] to-transparent z-10" />
    </section>
  );
};

export default ProblemSolution;