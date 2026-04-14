/* eslint-disable react/no-unknown-property */
import React, { forwardRef, useRef, useMemo, useLayoutEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Check, Zap } from "lucide-react";

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

void main() {
  vec2 tex = vUv * uScale;
  float t = uTime * uSpeed;
  tex.y += 0.05 * sin(4.0 * tex.x - t);
  float pattern = 0.6 + 0.4 * sin(3.0 * (tex.x + tex.y + cos(2.0 * tex.x + t)));
  gl_FragColor = vec4(uColor * pattern, 1.0);
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

// --- Tilted Pricing Card with Glare ---
const PricingCard = ({ title, price, description, features, highlighted = false }: any) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const card = cardRef.current.getBoundingClientRect();
    const mouseX = e.clientX - card.left;
    const mouseY = e.clientY - card.top;
    
    // Calculate rotation (max 12 degrees for pricing cards to keep them readable)
    const xPct = (mouseX / card.width - 0.5) * 12;
    const yPct = (mouseY / card.height - 0.5) * -12;
    
    setRotate({ x: yPct, y: xPct });
    setGlare({ x: (mouseX / card.width) * 100, y: (mouseY / card.height) * 100, opacity: 1 });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setGlare(prev => ({ ...prev, opacity: 0 }));
  };

  return (
    <div 
      className="relative [perspective:1200px]"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={cardRef}
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transition: rotate.x === 0 ? 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)' : 'none'
        }}
        className={`relative flex flex-col p-8 rounded-[32px] border h-full overflow-hidden ${
          highlighted 
            ? 'bg-[#0F0F0F]/60 border-white/20 shadow-[0_0_50px_rgba(255,255,255,0.03)]' 
            : 'bg-[#0A0A0A]/40 border-white/[0.08]'
        } backdrop-blur-xl shadow-2xl`}
      >
        {/* Dynamic Glare Overlay */}
        <div 
          className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.07) 0%, transparent 65%)`,
            opacity: glare.opacity
          }}
        />

        {highlighted && (
          <div className="absolute -top-0 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-b-xl bg-white text-black text-[10px] font-bold uppercase tracking-widest z-40">
            Most Popular
          </div>
        )}

        <div className="relative z-10">
          <div className="mb-8">
            <h3 className="text-neutral-400 font-medium text-sm uppercase tracking-widest mb-2 font-['Poppins']">{title}</h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-white text-4xl font-bold font-['Poppins']">{price}</span>
              {price !== "Free" && <span className="text-neutral-500 text-sm font-medium">/month</span>}
            </div>
            <p className="text-neutral-500 text-sm font-medium leading-relaxed font-['Poppins']">
              {description}
            </p>
          </div>

          <div className="space-y-4 mb-10">
            {features.map((feature: string, i: number) => (
              <div key={i} className="flex items-center gap-3 text-sm text-neutral-300 font-['Poppins']">
                <Check className="w-4 h-4 text-white/30" />
                {feature}
              </div>
            ))}
          </div>

          <button className={`w-full py-4 rounded-xl font-bold text-sm transition-all active:scale-95 font-['Poppins'] ${
            highlighted 
              ? 'bg-white text-black hover:bg-neutral-200 shadow-[0_10px_20px_rgba(255,255,255,0.1)]' 
              : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
          }`}>
            {price === "Free" ? "Get Started" : "Start Free Trial"}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Section ---
export const PricingSection: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const uniforms = useMemo(() => ({
    uSpeed: { value: 0.5 },
    uScale: { value: 1.5 },
    uColor: { value: new THREE.Color(...hexToNormalizedRGB('#0D0D0D')) },
    uTime: { value: 0 }
  }), []);

  const tiers = [
    { title: "Seed", price: "Free", description: "For individuals starting their digital garden.", features: ["Unlimited notes", "Standard Markdown", "Local storage", "Basic linking"] },
    { title: "Growth", price: "$8", highlighted: true, description: "Perfect for deep thinkers building a second brain.", features: ["E2E Encrypted Sync", "Graph visualization", "Mobile & Desktop apps", "Unlimited neural links", "Priority support"] },
    { title: "Forest", price: "$15", description: "Collaborative workspaces for research teams.", features: ["Shared sanctuaries", "Real-time collaboration", "Advanced version history", "Custom domains", "API access"] }
  ];

  return (
    <section className="relative w-full py-40 px-6 bg-[#050505] overflow-hidden border-t border-white/[0.04]">
      {/* Visual Silk Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
        <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 1] }}>
          <SilkPlane ref={meshRef} uniforms={uniforms} />
        </Canvas>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-6 backdrop-blur-md">
            <Zap className="w-3 h-3" /> Selection
          </div>
          <h2 className="text-white text-5xl md:text-7xl font-bold tracking-tighter leading-tight font-['Poppins']">
            Invest in your <br /><span className="text-neutral-500 font-medium">second brain.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {tiers.map((tier, i) => (
            <PricingCard key={i} {...tier} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;