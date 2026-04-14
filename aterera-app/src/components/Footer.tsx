/* eslint-disable react/no-unknown-property */
import React, { forwardRef, useRef, useMemo, useLayoutEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import * as Icons from "lucide-react"; // Bulletproof icons

// --- Silk Shader for Footer ---
const vertexShader = `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

const fragmentShader = `
varying vec2 vUv;
uniform float uTime;
uniform vec3 uColor;
void main() {
  vec2 uv = vUv;
  float t = uTime * 0.2;
  float wave = sin(uv.x * 3.0 + t) * cos(uv.y * 2.0 + t) * 0.2;
  float pattern = 0.5 + 0.5 * sin(8.0 * (uv.x + uv.y + wave));
  gl_FragColor = vec4(uColor * pow(pattern, 2.5), 1.0);
}
`;

const SilkPlane = forwardRef<THREE.Mesh, { uniforms: any }>(({ uniforms }, ref) => {
  const { viewport } = useThree();
  useLayoutEffect(() => { 
    if (ref && 'current' in ref && ref.current) ref.current.scale.set(viewport.width, viewport.height, 1); 
  }, [viewport, ref]);
  
  useFrame((state) => { 
    if (ref && 'current' in ref && ref.current) (ref.current.material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.getElapsedTime(); 
  });

  return (
    <mesh ref={ref}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} transparent />
    </mesh>
  );
});

SilkPlane.displayName = "SilkPlane";

export const Footer: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  const uniforms = useMemo(() => ({
    uColor: { value: new THREE.Color('#252525') }, // Silver shimmer color
    uTime: { value: 0 }
  }), []);

  return (
    <footer className="relative w-full py-20 bg-[#050505] overflow-hidden border-t border-white/[0.04] antialiased">
      
      {/* SILK BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 1] }}>
          <SilkPlane ref={meshRef} uniforms={uniforms} />
        </Canvas>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-10">
          
          {/* Brand & Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-2xl">
              <Icons.Command className="w-6 h-6 text-black" />
            </div>
            <span className="text-white font-bold text-2xl tracking-tighter font-['Poppins']">
              Aterera
            </span>
          </div>

          {/* Centered Nav Links */}
          <nav className="flex gap-8">
            {["Features", "Pricing", "Privacy", "Journal"].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`} 
                className="text-neutral-500 hover:text-white text-sm font-medium transition-colors font-['Poppins']"
              >
                {item}
              </a>
            ))}
          </nav>

          
        </div>

        {/* Bottom Metadata */}
        <div className="mt-16 pt-8 border-t border-white/[0.04] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-neutral-600 text-[11px] font-medium font-['Poppins'] tracking-wider">
            © 2026 ATERERA INC. ALL RIGHTS RESERVED.
          </p>
          <p className="text-neutral-500 text-[11px] font-['Poppins']">
            Crafted for the <span className="text-white font-semibold italic">Sanctuary of Mind.</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;