/* eslint-disable react/no-unknown-property */
import React, { forwardRef, useRef, useMemo, useLayoutEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { PenLine, Link2, MonitorDot } from "lucide-react";

// --- Shader Logic (Silk Background) ---
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
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

const fragmentShader = `
varying vec2 vUv;
uniform float uTime;
uniform vec3 uColor;
uniform float uSpeed;
uniform float uScale;

void main() {
  vec2 tex = vUv * uScale;
  float t = uTime * uSpeed;
  tex.y += 0.04 * sin(4.0 * tex.x - t);
  tex.x += 0.02 * cos(4.0 * tex.y + t);
  float pattern = 0.6 + 0.4 * sin(3.5 * (tex.x + tex.y + cos(2.0 * tex.x + 3.0 * tex.y) + 0.1 * t));
  gl_FragColor = vec4(uColor * pattern, 1.0);
}
`;

const SilkPlane = forwardRef<THREE.Mesh, { uniforms: any }>(({ uniforms }, ref) => {
  const { viewport } = useThree();
  useLayoutEffect(() => { if (ref && 'current' in ref && ref.current) ref.current.scale.set(viewport.width, viewport.height, 1); }, [viewport, ref]);
  useFrame((state) => { if (ref && 'current' in ref && ref.current) (ref.current.material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.getElapsedTime(); });
  return (
    <mesh ref={ref}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} />
    </mesh>
  );
});

// --- Step Component ---
const Step = ({ number, title, description, icon: Icon, isLast }: any) => (
  <div className="relative flex gap-8 md:gap-16 pb-20 group">
    {/* Left Column: Line and Number */}
    <div className="flex flex-col items-center">
      <div className="relative z-10 flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-b from-[#2A2A2A] to-[#0A0A0A] border border-white/10 text-white font-bold text-sm shadow-xl transition-transform group-hover:scale-110 duration-500">
        {number}
      </div>
      {!isLast && (
        <div className="w-[1px] h-full bg-gradient-to-b from-white/10 via-white/[0.02] to-transparent mt-4" />
      )}
    </div>

    {/* Right Column: Content */}
    <div className="flex-1 pt-1">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg border border-white/[0.04] bg-white/[0.02] mb-4">
        <Icon className="w-4 h-4 text-neutral-400" />
        <span className="text-[11px] uppercase tracking-widest font-semibold text-neutral-500 font-['Poppins']">Process 0{number}</span>
      </div>
      <h3 className="text-white text-2xl md:text-3xl font-bold tracking-tight mb-4 font-['Poppins'] group-hover:text-neutral-200 transition-colors">
        {title}
      </h3>
      <p className="text-neutral-400 font-medium leading-relaxed max-w-lg font-['Poppins'] text-base md:text-lg">
        {description}
      </p>
    </div>
  </div>
);

// --- Main Component ---
export const HowItWorks: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const uniforms = useMemo(() => ({
    uSpeed: { value: 0.6 },
    uScale: { value: 1.6 },
    uColor: { value: new THREE.Color(...hexToNormalizedRGB('#0B0B0B')) },
    uTime: { value: 0 }
  }), []);

  const steps = [
    {
      number: 1,
      icon: PenLine,
      title: "Capture with friction-less speed",
      description: "Open Aterera and start writing instantly. No folders, no tags, just your raw thoughts recorded in a beautiful, distraction-free markdown environment."
    },
    {
      number: 2,
      icon: Link2,
      title: "Link and synthesize ideas",
      description: "Use double brackets to create neural links between notes. Watch as Aterera automatically builds a graph of your second brain, revealing connections you never knew existed."
    },
    {
      number: 3,
      icon: MonitorDot,
      title: "Access from any sanctuary",
      description: "Your digital garden is always with you. Everything is end-to-end encrypted and synced across your desktop, web, and mobile devices in real-time."
    }
  ];

  return (
    <section className="relative w-full py-40 bg-[#050505] overflow-hidden">
      {/* Dynamic Silk Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 1] }}>
          <SilkPlane ref={meshRef} uniforms={uniforms} />
        </Canvas>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-16 md:gap-32">
          
          {/* Sticky Header Side */}
          <div className="md:w-1/3 md:sticky md:top-40 h-fit">
            <span className="text-neutral-500 font-semibold text-xs tracking-[0.2em] uppercase mb-6 block font-['Poppins']">Execution</span>
            <h2 className="text-white text-5xl font-bold tracking-tighter leading-tight font-['Poppins'] mb-6">
              How Aterera <br />works.
            </h2>
            <p className="text-neutral-500 font-medium font-['Poppins'] leading-relaxed">
              We redesigned the note-making process to match the fluid nature of human memory.
            </p>
          </div>

          {/* Steps Side */}
          <div className="md:w-2/3">
            {steps.map((step, i) => (
              <Step 
                key={i} 
                {...step} 
                isLast={i === steps.length - 1} 
              />
            ))}
          </div>

        </div>
      </div>

      {/* Finishing bottom light leak */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#050505] to-transparent z-20" />
    </section>
  );
};

export default HowItWorks;