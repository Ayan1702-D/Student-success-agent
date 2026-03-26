"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Link from "next/link";
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid 
} from "recharts";
import { 
  BookOpen, AlertTriangle, MessageSquare, LayoutDashboard, Calendar, Send, ArrowLeft, Bot, Sparkles, CheckCircle2, Search, Target, Trophy, Flame, GraduationCap 
} from "lucide-react";

// --- 1. CONFIGURATION & DOMAIN TYPES ---

const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  ENDPOINTS: {
    STUDENTS: "/students",
    DASHBOARD: "/dashboard",
    CHAT: "/chat",
    ROADMAP: "/roadmap"
  }
};

interface StudentProfile {
  student_id: string;
  name: string;
}

interface RiskProfile {
  risk_level: "High" | "Medium" | "Low";
  risk_score: string;
}

interface SubjectScore {
  name: string;
  avg_score: number;
}

interface StudentMetrics {
  profile: StudentProfile;
  attendance: number;
  risk: RiskProfile;
  weak_subjects: SubjectScore[];
  mentorship_insight: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// --- 2. UI UTILITIES ---

const ANIMATIONS = {
  container: { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } },
  item: { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } },
  tab: { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20, transition: { duration: 0.2 } } }
};

// --- 3. MODULAR COMPONENTS ---

const StatCard = ({ label, value, subtext, color = "bg-white", icon: Icon, status }: any) => (
  <motion.div 
    variants={ANIMATIONS.item}
    whileHover={{ y: -5, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)" }}
    className={`relative overflow-hidden ${color} p-6 rounded-2xl shadow-sm border border-slate-100 transition-all`}
  >
    <div className="flex justify-between items-start">
      <div>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
        <h3 className="text-3xl font-extrabold text-slate-800">{value}</h3>
      </div>
      <div className="p-3 bg-white/50 rounded-xl backdrop-blur-sm">
        <Icon size={20} className="text-slate-600" />
      </div>
    </div>
    <div className="mt-4 flex items-center gap-2">
      {status ? (
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${status === 'good' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
          {subtext}
        </span>
      ) : (
        <p className="text-xs text-slate-400 font-medium">{subtext}</p>
      )}
    </div>
  </motion.div>
);

const RoadmapDisplay = ({ content }: { content: string }) => {
  const sections = content.split('---').map(s => s.trim()).filter(s => s);

  return (
    <div className="space-y-6">
      {sections[0] && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
              <Target size={32} className="text-white" />
            </div>
            <div>
               <h3 className="text-2xl font-bold mb-2">Personalized Study Plan</h3>
               <div className="prose prose-invert text-indigo-100 leading-relaxed max-w-none">
                 <ReactMarkdown>{sections[0]}</ReactMarkdown>
               </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {[
          { title: "Weekly Goals", icon: Calendar, key: "Weekly Goals", color: "blue" },
          { title: "Quick Wins", icon: Trophy, key: "Quick Wins", color: "emerald" },
          { title: "Motivation", icon: Flame, key: "Motivation", color: "amber" }
        ].map((area) => (
          <div key={area.key} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-50">
              <div className={`w-10 h-10 bg-${area.color}-50 text-${area.color}-600 rounded-full flex items-center justify-center`}>
                <area.icon size={20} />
              </div>
              <h4 className="font-bold text-slate-800">{area.title}</h4>
            </div>
            <div className={`prose prose-sm prose-${area.color} text-slate-600 flex-1`}>
               <ReactMarkdown>{sections.find(s => s.includes(area.key)) || "Generating insights..."}</ReactMarkdown>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-8 p-10">
    <div className="grid grid-cols-4 gap-6">
      {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>)}
    </div>
    <div className="h-96 bg-slate-200 rounded-2xl"></div>
  </div>
);

// --- 4. MAIN DASHBOARD CONTROLLER ---

export default function StudentSuccessDashboard() {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");

  const [metrics, setMetrics] = useState<StudentMetrics | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "roadmap" | "chat">("overview");
  
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatting, setIsChatting] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [roadmapContent, setRoadmapContent] = useState("");
  const [isCreatingRoadmap, setIsCreatingRoadmap] = useState(false);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const { data } = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.STUDENTS}`);
        setStudents(data);
        if (data.length > 0) setSelectedStudentId(data[0].student_id);
      } catch (err) {
        console.error("Failed to load students", err);
      }
    };
    loadStudents();
  }, []);

  useEffect(() => {
    if (!selectedStudentId) return;
    setMetrics(null); 
    
    const loadMetrics = async () => {
      try {
        await new Promise(r => setTimeout(r, 600)); 
        const { data } = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DASHBOARD}/${selectedStudentId}`);
        setMetrics(data);
        setChatHistory([]); 
        setRoadmapContent("");
      } catch (err) {
        console.error("Failed to load metrics", err);
      }
    };
    loadMetrics();
  }, [selectedStudentId]);

  const displayedStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.student_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = async () => {
    if (!chatInput || !metrics) return;
    const userMsg = chatInput;
    
    setChatInput("");
    setChatHistory(prev => [...prev, { role: "user", content: userMsg }]);
    setIsChatting(true);

    try {
      const { data } = await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHAT}`, {
        student_id: selectedStudentId,
        message: userMsg,
        context: {
          name: metrics.profile.name,
          risk: metrics.risk.risk_level,
          weak_subjects: metrics.weak_subjects.map(s => s.name).join(", ")
        }
      });
      setChatHistory(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      console.error("Chat Error", err);
    } finally {
      setIsChatting(false);
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleCreateRoadmap = async () => {
    if (!metrics) return;
    setIsCreatingRoadmap(true);
    try {
      const { data } = await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ROADMAP}`, {
        student_id: selectedStudentId,
        risk_level: metrics.risk.risk_level,
        weak_subjects: metrics.weak_subjects.map(s => s.name).join(", ")
      });
      setRoadmapContent(data.roadmap);
    } catch (err) {
      console.error("Roadmap Error", err);
    } finally {
      setIsCreatingRoadmap(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      
      {/* --- SIDEBAR: CLASS LIST --- */}
      <motion.aside 
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-80 bg-white border-r border-slate-200 flex flex-col z-20 shadow-xl"
      >
        <div className="p-6 pb-4 border-b border-slate-100">
           <div className="flex items-center gap-2 mb-6 text-indigo-700">
             <div className="p-2 bg-indigo-100 rounded-lg">
               <GraduationCap size={20} />
             </div>
             <span className="font-bold text-lg tracking-tight">Student Success</span>
           </div>

           <div className="relative">
             <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
             {/* 👇 THE FIX IS HERE: suppressHydrationWarning */}
             <input 
                suppressHydrationWarning
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                placeholder="Find a student..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
             />
           </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1 custom-scrollbar">
           <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Class Roster</p>
           {displayedStudents.map((s) => (
             <button
               key={s.student_id}
               onClick={() => setSelectedStudentId(s.student_id)}
               className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group ${
                 selectedStudentId === s.student_id 
                 ? "bg-indigo-600 shadow-md shadow-indigo-200" 
                 : "hover:bg-slate-50"
               }`}
             >
               <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${
                 selectedStudentId === s.student_id 
                 ? "bg-white text-indigo-700" 
                 : "bg-indigo-50 text-indigo-600 group-hover:bg-white group-hover:shadow-md"
               }`}>
                 {s.name.charAt(0)}
               </div>
               
               <div className="text-left flex-1 flex flex-col">
                 <span className={`text-sm font-semibold ${selectedStudentId === s.student_id ? "text-white" : "text-slate-700"}`}>
                   {s.name}
                 </span>
                 <span className={`text-xs ${selectedStudentId === s.student_id ? "text-indigo-200" : "text-slate-400"}`}>
                   {s.student_id}
                 </span>
               </div>

               {selectedStudentId === s.student_id && (
                 <div className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></div>
               )}
             </button>
           ))}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <div className="flex justify-around mb-4">
               {[
                 { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
                 { id: 'roadmap', icon: Target, label: 'Roadmap' },
                 { id: 'chat', icon: MessageSquare, label: 'AI Mentor' },
               ].map((item: any) => (
                 <button
                   key={item.id}
                   onClick={() => setActiveTab(item.id)}
                   className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs font-medium transition-all ${
                     activeTab === item.id 
                     ? 'text-indigo-600 bg-indigo-50' 
                     : 'text-slate-400 hover:text-slate-600'
                   }`}
                 >
                   <item.icon size={20} />
                   {item.label}
                 </button>
               ))}
            </div>
            <Link href="/" className="flex items-center justify-center gap-2 text-slate-400 hover:text-slate-600 transition text-xs font-bold py-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200">
              <ArrowLeft size={14} /> EXIT DASHBOARD
            </Link>
        </div>
      </motion.aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto bg-slate-50 relative">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none" />
        
        {!metrics ? (
          <LoadingSkeleton />
        ) : (
          <motion.div 
            variants={ANIMATIONS.container}
            initial="hidden"
            animate="show"
            className="p-10 max-w-7xl mx-auto space-y-10 relative z-10"
          >
            {/* STATS ROW */}
            <div className="grid grid-cols-4 gap-6">
              <StatCard 
                label="Attendance" 
                value={`${metrics.attendance}%`} 
                subtext={metrics.attendance >= 75 ? "Good Standing" : "Needs Improvement"}
                icon={CheckCircle2}
                status={metrics.attendance >= 75 ? "good" : "bad"}
                color="bg-white"
              />
              <StatCard 
                label="Risk Level" 
                value={metrics.risk.risk_level} 
                subtext={`Score: ${parseFloat(metrics.risk.risk_score).toFixed(2)}`}
                icon={AlertTriangle}
                status={metrics.risk.risk_level === "High" ? "bad" : "good"}
                color={metrics.risk.risk_level === 'High' ? 'bg-red-50 border-red-100' : 'bg-white'}
              />
              <StatCard 
                label="Focus Areas" 
                value={metrics.weak_subjects.length} 
                subtext="Subjects to Improve"
                icon={BookOpen}
                color="bg-white"
              />
              <StatCard 
                label="AI Mentor" 
                value="Online" 
                subtext="DeepSeek R1 Active"
                icon={Bot}
                color="bg-indigo-600 text-white"
              />
            </div>

            {/* CONTENT MODULES */}
            <AnimatePresence mode="wait">
              
              {/* 1. OVERVIEW TAB */}
              {activeTab === "overview" && (
                <motion.div 
                  key="overview"
                  variants={ANIMATIONS.tab}
                  initial="initial" animate="animate" exit="exit"
                  className="grid grid-cols-3 gap-8"
                >
                  <div className="col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100 h-[500px] flex flex-col">
                    <h3 className="font-bold text-xl text-slate-800 mb-6">Subject Performance</h3>
                    <div className="flex-1 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={metrics.weak_subjects} barSize={60}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis 
                            dataKey="name" 
                            stroke="#64748b" 
                            fontSize={10} 
                            fontWeight="bold" 
                            tickLine={false} 
                            axisLine={false} 
                            interval={0} 
                            angle={0} 
                            textAnchor="middle" 
                            dy={10} 
                          />
                          <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                          <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}} />
                          <Bar dataKey="avg_score" radius={[8, 8, 8, 8]}>
                            {metrics.weak_subjects.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={entry.avg_score < 40 ? '#f43f5e' : '#6366f1'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div className="col-span-1 bg-gradient-to-br from-indigo-900 to-slate-900 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[80px] opacity-20 -mr-16 -mt-16"></div>
                    <h3 className="font-bold text-xl mb-6 flex items-center gap-2 relative z-10">
                      <Sparkles size={20} className="text-yellow-400"/> Mentor Insight
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-light relative z-10">
                      {metrics.mentorship_insight}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* 2. ROADMAP TAB */}
              {activeTab === "roadmap" && (
                <motion.div 
                  key="roadmap"
                  variants={ANIMATIONS.tab}
                  initial="initial" animate="animate" exit="exit"
                  className="max-w-4xl mx-auto"
                >
                   <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100">
                      <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-100">
                        <div>
                          <h2 className="text-2xl font-bold text-slate-800">Study Strategy</h2>
                          <p className="text-slate-500 mt-1">AI-generated plan based on current performance</p>
                        </div>
                        <button 
                          onClick={handleCreateRoadmap}
                          disabled={isCreatingRoadmap}
                          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-70 shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
                        >
                          {isCreatingRoadmap ? <Sparkles className="animate-spin" size={18} /> : <Sparkles size={18} />}
                          {isCreatingRoadmap ? "Designing Plan..." : "Create New Plan"}
                        </button>
                      </div>

                      {roadmapContent ? (
                        <RoadmapDisplay content={roadmapContent} />
                      ) : (
                        <div className="py-20 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                          <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                            <Sparkles className="text-indigo-400" size={32} />
                          </div>
                          <h3 className="font-bold text-slate-800 text-lg">No Active Plan</h3>
                          <p className="text-slate-500 max-w-sm mt-2">Generate a roadmap to see a week-by-week breakdown of what to study.</p>
                        </div>
                      )}
                   </div>
                </motion.div>
              )}

              {/* 3. CHAT TAB */}
              {activeTab === "chat" && (
                <motion.div 
                   key="chat"
                   variants={ANIMATIONS.tab}
                   initial="initial" animate="animate" exit="exit"
                   className="h-[650px] max-w-4xl mx-auto bg-white rounded-3xl shadow-xl shadow-indigo-100/50 border border-slate-100 flex flex-col overflow-hidden"
                >
                    <div className="p-6 border-b border-slate-100 bg-white flex justify-between items-center">
                       <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                              <Bot className="text-indigo-600" size={24} />
                            </div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-800">AI Mentor</h3>
                            <p className="text-xs text-indigo-500 font-medium bg-indigo-50 px-2 py-1 rounded-full inline-block mt-1">DeepSeek R1 • Online</p>
                          </div>
                       </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 scroll-smooth">
                       {chatHistory.length === 0 && (
                          <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                             <Bot size={48} className="text-slate-300 mb-4" />
                             <p className="text-slate-400 font-medium">Ask for study tips or clarification.</p>
                          </div>
                       )}
                       {chatHistory.map((msg, idx) => (
                         <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                           <div className={`max-w-[80%] p-5 rounded-2xl shadow-sm text-sm leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'}`}>
                             {msg.content}
                           </div>
                         </div>
                       ))}
                       {isChatting && <div className="text-slate-400 text-xs animate-pulse pl-4">Typing...</div>}
                       <div ref={chatEndRef}></div>
                    </div>

                    <div className="p-4 bg-white border-t border-slate-100">
                       <div className="relative flex items-center gap-2">
                         <input 
                           className="w-full bg-slate-100 border-none rounded-2xl pl-6 pr-14 py-4 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all outline-none text-slate-700"
                           placeholder="Type your question..."
                           value={chatInput}
                           onChange={(e) => setChatInput(e.target.value)}
                           onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                         />
                         <button onClick={handleSendMessage} disabled={isChatting || !chatInput} className="absolute right-2 p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition disabled:opacity-50">
                           <Send size={18} />
                         </button>
                       </div>
                    </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </main>
    </div>
  );
}