/* eslint-disable react/no-unknown-property */
import React, { forwardRef, useRef, useMemo, useLayoutEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Zap, Lock, BrainCircuit, Search, Share2, Palette } from "lucide-react";

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
  
  // High-visibility silk wave distortion
  tex.y += 0.05 * sin(5.0 * tex.x - tOffset);
  tex.x += 0.02 * cos(5.0 * tex.y + tOffset);
  
  float pattern = 0.6 + 0.4 * sin(4.0 * (tex.x + tex.y + 
                  cos(2.0 * tex.x + 4.0 * tex.y) + 
                  0.1 * tOffset));
                  
  vec4 col = vec4(uColor, 1.0) * vec4(pattern) - rnd / 10.0 * uNoiseIntensity;
  gl_FragColor = vec4(col.rgb, 1.0);
}
`;

const SilkPlane = forwardRef<THREE.Mesh, { uniforms: any }>(({ uniforms }, ref) => {
  const { viewport } = useThree();
  
  useLayoutEffect(() => {
    if (ref && 'current' in ref && ref.current) {
      // Ensure the plane covers the full viewport of the canvas
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
      />
    </mesh>
  );
});

SilkPlane.displayName = "SilkPlane";

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const card = cardRef.current.getBoundingClientRect();
    const xPct = ((e.clientX - card.left) / card.width - 0.5) * 16;
    const yPct = ((e.clientY - card.top) / card.height - 0.5) * -16;
    setRotate({ x: yPct, y: xPct });
    setGlare({ x: ((e.clientX - card.left) / card.width) * 100, y: ((e.clientY - card.top) / card.height) * 100, opacity: 1 });
  };

  return (
    <div className="relative [perspective:1200px]" onMouseMove={handleMouseMove} onMouseLeave={() => {setRotate({x:0,y:0}); setGlare(g => ({...g, opacity:0}))}}>
      <div ref={cardRef} style={{ transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`, transition: rotate.x === 0 ? 'all 0.6s ease' : 'none' }}
        className="relative overflow-hidden rounded-[32px] border border-white/[0.08] bg-[#0A0A0A]/50 backdrop-blur-xl p-8 h-full shadow-2xl"
      >
        <div className="pointer-events-none absolute inset-0 z-30" style={{ background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.08) 0%, transparent 60%)`, opacity: glare.opacity }} />
        <div className="relative z-10">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-b from-[#2A2A2A] to-[#0A0A0A] border border-white/10 shadow-lg mb-8">{icon}</div>
          <h3 className="text-white text-xl font-semibold mb-4 font-['Poppins']">{title}</h3>
          <p className="text-neutral-400 font-medium leading-relaxed font-['Poppins'] text-[15px]">{description}</p>
        </div>
      </div>
    </div>
  );
};

export const FeaturesSection: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  const uniforms = useMemo(() => ({
    uSpeed: { value: 0.5 },
    uScale: { value: 2.0 }, // Increased scale for bigger waves
    uNoiseIntensity: { value: 0.5 }, // Increased noise for more "texture"
    uColor: { value: new THREE.Color(...hexToNormalizedRGB('#0C0C0C')) }, // Slightly lighter than #050505 to show up
    uTime: { value: 0 }
  }), []);

  const features = [
    { icon: <Zap className="w-5 h-5 text-white" />, title: "Instant Capture", description: "Launch in milliseconds. Capture thoughts before they escape you." },
    { icon: <Lock className="w-5 h-5 text-white" />, title: "E2E Encryption", description: "Your thoughts are your own. Protected by industry-leading security." },
    { icon: <BrainCircuit className="w-5 h-5 text-white" />, title: "Neural Linking", description: "Build a second brain by connecting ideas with back-links." },
    { icon: <Search className="w-5 h-5 text-white" />, title: "Deep Search", description: "Universal search that understands context and relationships." },
    { icon: <Share2 className="w-5 h-5 text-white" />, title: "Fluid Sync", description: "Work across desktop and mobile without ever hitting refresh." },
    { icon: <Palette className="w-5 h-5 text-white" />, title: "Pure Interface", description: "A minimalist workspace designed to foster deep concentration." }
  ];

  return (
    <section className="relative w-full py-40 px-6 bg-[#050505] overflow-hidden antialiased">
      {/* CRITICAL: The background container must have a fixed height 
          or fill the relative parent 
      */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 1] }}>
          <SilkPlane ref={meshRef} uniforms={uniforms} />
        </Canvas>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-32">
          <span className="text-neutral-500 font-semibold text-xs tracking-[0.2em] uppercase mb-6 block font-['Poppins']">The Aterera Ecosystem</span>
          <h2 className="text-white text-5xl md:text-7xl font-bold tracking-tighter leading-tight font-['Poppins']">
            Tools for the <br /><span className="text-neutral-500">modern mind.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => <FeatureCard key={i} {...f} />)}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;