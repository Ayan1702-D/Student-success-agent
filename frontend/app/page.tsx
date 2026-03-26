"use client";
import Link from "next/link";
import { motion, useScroll, useTransform, Variants } from "framer-motion";
import { 
  ArrowRight, 
  BrainCircuit, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  BarChart, 
  Lock 
} from "lucide-react";

// Animation Variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: "easeOut" } 
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

export default function LandingPage() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]); // Parallax effect
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white overflow-hidden">
      
      {/* 1. NAVBAR - Glassmorphism */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 w-full border-b border-white/5 bg-[#0B1120]/80 backdrop-blur-md z-50"
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <BrainCircuit className="text-white" size={24} />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">StudentSuccess.ai</span>
          </div>
          
          {/* UPDATED: Only Features link remains */}
          <div className="hidden md:flex gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
          </div>

          <div className="flex gap-4">
            <Link 
              href="/dashboard" 
              className="px-6 py-2.5 rounded-full bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/25 flex items-center gap-2 group"
            >
              Dashboard
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* 2. HERO SECTION */}
      <section className="relative pt-40 pb-32 overflow-hidden">
        {/* Animated Background Blobs */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3], 
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] -z-10" 
        />
        
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex flex-col items-center"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold mb-8 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-indigo-50 animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
              POWERED BY DEEPSEEK R1
            </motion.div>
            
            <motion.h1 variants={fadeInUp} className="text-5xl md:text-8xl font-extrabold tracking-tight mb-8 bg-gradient-to-b from-white via-slate-200 to-slate-500 bg-clip-text text-transparent leading-tight">
              Predict Success.<br />
              <span className="text-indigo-500">Prevent Failure.</span>
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
              The autonomous AI agent that analyzes academic patterns, detects risk early, and generates personalized study roadmaps in seconds.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-col md:flex-row items-center justify-center gap-4 w-full md:w-auto">
              <Link 
                href="/dashboard" 
                className="w-full md:w-auto px-10 py-4 rounded-full bg-white text-slate-900 font-bold text-lg hover:bg-indigo-50 transition shadow-xl shadow-white/10 flex items-center justify-center gap-2 group"
              >
                Launch Dashboard 
                <ArrowRight className="group-hover:translate-x-1 transition-transform text-indigo-600" size={20} />
              </Link>
            </motion.div>
          </motion.div>

          {/* Floating UI Preview */}
          <motion.div 
            style={{ y: y1, rotateX: 5 }}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="mt-24 relative mx-auto max-w-6xl perspective-1000"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-transparent to-transparent z-20 h-full w-full pointer-events-none" />
            
            {/* The "Screen" */}
            <div className="bg-[#151e32] rounded-2xl border border-slate-700/50 p-2 shadow-2xl shadow-indigo-900/20 overflow-hidden">
               <div className="bg-[#0f172a] rounded-xl overflow-hidden aspect-[16/9] relative border border-slate-800 grid grid-cols-4 gap-4 p-8">
                  {/* Fake UI Elements for illustration */}
                  <div className="col-span-1 bg-slate-800/50 rounded-xl h-full animate-pulse"></div>
                  <div className="col-span-3 space-y-4">
                     <div className="flex gap-4">
                       <div className="h-32 w-1/3 bg-indigo-600/10 border border-indigo-500/20 rounded-xl"></div>
                       <div className="h-32 w-1/3 bg-slate-800/50 rounded-xl"></div>
                       <div className="h-32 w-1/3 bg-slate-800/50 rounded-xl"></div>
                     </div>
                     <div className="h-64 bg-slate-800/30 rounded-xl w-full border border-slate-800"></div>
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. METRICS SCROLLING */}
      <section className="py-10 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
           {/* Logos or Metrics here */}
           <span className="text-xl font-bold flex items-center gap-2"><CheckCircle2/> 98% Accuracy</span>
           <span className="text-xl font-bold flex items-center gap-2"><Lock/> Secure Data</span>
           <span className="text-xl font-bold flex items-center gap-2"><Zap/> Real-time Analysis</span>
           <span className="text-xl font-bold flex items-center gap-2"><BarChart/> Predictive</span>
        </div>
      </section>

      {/* 4. FEATURES GRID */}
      <section id="features" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Beyond Basic Analytics.</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">Most tools just show you grades. We show you the future.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<BrainCircuit size={40} className="text-indigo-400" />}
              title="Reasoning Engine"
              desc="DeepSeek R1 'thinks' before it speaks, analyzing context to provide mentorship that feels human, not robotic."
              delay={0.1}
            />
            <FeatureCard 
              icon={<ShieldCheck size={40} className="text-emerald-400" />}
              title="Risk Prediction"
              desc="Our algorithms detect academic drift weeks before failure happens, giving you time to intervene."
              delay={0.2}
            />
            <FeatureCard 
              icon={<Zap size={40} className="text-amber-400" />}
              title="Dynamic Roadmaps"
              desc="Static PDF plans fail. Our roadmaps adapt week-by-week based on student progress and new test scores."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-600/10 skew-y-3 transform origin-bottom-right" />
        
        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-8 text-white">Ready to modernize mentorship?</h2>
          <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
            Join hundreds of educators using AI to scale their impact without scaling their workload.
          </p>
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-white text-indigo-900 font-bold text-xl hover:bg-slate-100 transition shadow-2xl shadow-white/20"
          >
            Get Started Now
          </Link>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="py-12 border-t border-white/5 bg-[#0B1120] text-slate-500 text-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="font-bold text-white text-xs">AI</span>
            </div>
            <p className="text-slate-400 font-bold">StudentSuccess.ai</p>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition">Privacy</a>
            <a href="#" className="hover:text-white transition">Terms</a>
            <a href="#" className="hover:text-white transition">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// --- SUB COMPONENTS ---

function FeatureCard({ icon, title, desc, delay }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -10 }}
      className="p-10 rounded-3xl bg-slate-900/50 border border-white/5 hover:border-indigo-500/30 transition-all duration-300 hover:bg-slate-800/50 group hover:shadow-2xl hover:shadow-indigo-500/10"
    >
      <div className="mb-8 p-5 rounded-2xl bg-[#0B1120] border border-white/5 inline-block group-hover:scale-110 group-hover:border-indigo-500/30 transition-all duration-300 shadow-lg">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-indigo-300 transition-colors">{title}</h3>
      <p className="text-slate-400 leading-relaxed text-lg">{desc}</p>
    </motion.div>
  );
}