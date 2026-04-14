/* eslint-disable react/no-unknown-property */
import React, { forwardRef, useRef, useMemo, useLayoutEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Mail, MessageSquare, Send } from "lucide-react";

// --- High-Fidelity Silk Shader ---
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
  float t = uTime * 0.4;
  float wave = sin(uv.x * 5.0 + t) * cos(uv.y * 3.0 + t) * 0.2;
  float pattern = 0.5 + 0.5 * sin(10.0 * (uv.x + uv.y + wave));
  gl_FragColor = vec4(uColor * pow(pattern, 2.0), 1.0);
}
`;

const SilkPlane = forwardRef<THREE.Mesh, { uniforms: any }>(({ uniforms }, ref) => {
  const { viewport } = useThree();
  useLayoutEffect(() => { if (ref && 'current' in ref && ref.current) ref.current.scale.set(viewport.width, viewport.height, 1); }, [viewport, ref]);
  useFrame((state) => { if (ref && 'current' in ref && ref.current) (ref.current.material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.getElapsedTime(); });
  return (
    <mesh ref={ref}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} transparent />
    </mesh>
  );
});

// --- Main Contact Section ---
export const ContactSection: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const uniforms = useMemo(() => ({
    uColor: { value: new THREE.Color('#2A2A2A') }, 
    uTime: { value: 0 }
  }), []);

  return (
    <section className="relative w-full py-40 bg-[#050505] overflow-hidden antialiased border-t border-white/[0.03]">
      
      {/* PERSISTENT SILK BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 1] }}>
          <SilkPlane ref={meshRef} uniforms={uniforms} />
        </Canvas>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          
          {/* Left Side: Copy */}
          <div>
            <span className="text-neutral-500 font-bold text-xs tracking-[0.3em] uppercase mb-6 block font-['Poppins']">Connect</span>
            <h2 className="text-white text-5xl md:text-7xl font-bold tracking-tighter leading-tight font-['Poppins'] mb-8">
              Reach the <br /><span className="text-neutral-500">sanctuary.</span>
            </h2>
            <p className="text-neutral-400 text-lg font-medium leading-relaxed font-['Poppins'] max-w-md mb-12">
              Have questions about your knowledge graph? Our guides are here to help you navigate your digital garden.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4 text-white/60 hover:text-white transition-colors cursor-pointer group">
                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white/5">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="font-['Poppins'] font-medium">hello@aterera.app</span>
              </div>
              <div className="flex items-center gap-4 text-white/60 hover:text-white transition-colors cursor-pointer group">
                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white/5">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <span className="font-['Poppins'] font-medium">Join our Discord</span>
              </div>
            </div>
          </div>

          {/* Right Side: Glass Form */}
          <div className="relative p-8 md:p-10 rounded-[40px] border border-white/[0.08] bg-[#0A0A0A]/40 backdrop-blur-2xl shadow-2xl">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1 font-['Poppins']">Name</label>
                  <input type="text" placeholder="Your Name" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-neutral-700 focus:outline-none focus:border-white/20 transition-all font-['Poppins']" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1 font-['Poppins']">Email</label>
                  <input type="email" placeholder="email@address.com" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-neutral-700 focus:outline-none focus:border-white/20 transition-all font-['Poppins']" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1 font-['Poppins']">Inquiry</label>
                <textarea rows={4} placeholder="How can we help?" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-neutral-700 focus:outline-none focus:border-white/20 transition-all font-['Poppins'] resize-none"></textarea>
              </div>

              <button className="w-full group bg-white text-black font-bold py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-neutral-200 transition-all active:scale-[0.98] font-['Poppins']">
                Send Message
                <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* Footer Edge Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#050505] to-transparent z-10" />
    </section>
  );
};

export default ContactSection;