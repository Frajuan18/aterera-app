/* eslint-disable react/no-unknown-property */
import React, { forwardRef, useRef, useMemo, useLayoutEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { ChevronDown, HelpCircle } from "lucide-react";

// --- Shader Logic (High Visibility Silk) ---
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
  float wave = sin(uv.x * 5.0 + t) * cos(uv.y * 3.0 + t) * 0.3;
  float pattern = 0.5 + 0.5 * sin(12.0 * (uv.x + uv.y + wave));
  gl_FragColor = vec4(uColor * pow(pattern, 1.8), 1.0);
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

// --- Accordion Item Component ---
const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-white/5">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-7 flex items-center justify-between text-left group"
      >
        <span className={`text-lg md:text-xl font-medium font-['Poppins'] transition-colors duration-300 ${isOpen ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-200'}`}>
          {question}
        </span>
        <div className={`transform transition-transform duration-500 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
          <ChevronDown className={`w-5 h-5 ${isOpen ? 'text-white' : 'text-neutral-600'}`} />
        </div>
      </button>
      
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96 opacity-100 pb-8' : 'max-h-0 opacity-0'}`}>
        <p className="text-neutral-500 leading-relaxed font-['Poppins'] text-base max-w-2xl">
          {answer}
        </p>
      </div>
    </div>
  );
};

// --- Main Section ---
export const FAQSection: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const uniforms = useMemo(() => ({
    uColor: { value: new THREE.Color('#252525') }, 
    uTime: { value: 0 }
  }), []);

  const faqs = [
    {
      question: "Is Aterera really end-to-end encrypted?",
      answer: "Yes. We use zero-knowledge encryption, meaning your notes are encrypted locally on your device before they ever hit our servers. Even we can't read them."
    },
    {
      question: "Can I import my notes from Notion or Obsidian?",
      answer: "Absolutely. Aterera supports bulk Markdown import and specialized Notion API migration to ensure your knowledge graph stays intact."
    },
    {
      question: "Does it work offline?",
      answer: "Aterera is local-first. You can capture, link, and edit your notes without an internet connection. Everything syncs once you're back online."
    },
    {
        question: "How does the neural linking work?",
        answer: "By using [[double brackets]], you create a bi-directional link. Aterera's engine then visualizes these connections in a 3D graph, helping you spot patterns in your thinking."
    }
  ];

  return (
    <section className="relative w-full py-40 bg-[#050505] overflow-hidden antialiased border-t border-white/[0.03]">
      
      {/* HIGH-INTENSITY SILK BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
        <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 1] }}>
          <SilkPlane ref={meshRef} uniforms={uniforms} />
        </Canvas>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6">
        <div className="mb-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em] mb-6 backdrop-blur-md">
            <HelpCircle className="w-3 h-3" /> Support
          </div>
          <h2 className="text-white text-4xl md:text-5xl font-bold tracking-tighter font-['Poppins']">
            Common Inquiries
          </h2>
        </div>

        <div className="flex flex-col">
          {faqs.map((faq, i) => (
            <FAQItem key={i} {...faq} />
          ))}
        </div>

        <div className="mt-20 text-center">
            <p className="text-neutral-600 text-sm font-['Poppins']">
                Still have questions? <a href="#" className="text-white hover:underline underline-offset-4">Contact our sanctuary guides.</a>
            </p>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;