import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Server, Database, BrainCircuit, Globe, ArrowRight, X } from 'lucide-react';

interface TechNode {
  id: string;
  title: string;
  icon: React.ElementType;
  description: string;
  details: string[];
  color: string;
}

const nodes: TechNode[] = [
  {
    id: 'frontend',
    title: 'Frontend Client',
    icon: Globe,
    description: 'React + TypeScript SPA built with Vite.',
    details: [
      'Tailwind CSS for responsive, utility-first styling.',
      'Framer Motion for smooth animations and transitions.',
      'Axios/Fetch for API communication with Spring Boot.',
      'Clerk for secure frontend authentication.'
    ],
    color: 'bg-blue-500'
  },
  {
    id: 'backend',
    title: 'Spring Boot API',
    icon: Server,
    description: 'Java REST API handling business logic.',
    details: [
      'Spring Boot 3 + Java 17 for robust enterprise backend.',
      'Spring Security + OAuth2 for verifying Clerk JWT tokens.',
      'JPA/Hibernate for object-relational mapping.',
      'Multipart file upload handling for media integration.'
    ],
    color: 'bg-green-600'
  },
  {
    id: 'database',
    title: 'Database Layer',
    icon: Database,
    description: 'Relational storage for app data.',
    details: [
      'SQLite database for fast, file-based persistence.',
      'Stores Users, Posts, Farms, and Comment entities.',
      'Automated schema generation via Hibernate.'
    ],
    color: 'bg-indigo-500'
  },
  {
    id: 'ai',
    title: 'AI Services',
    icon: BrainCircuit,
    description: 'Deep thought and intelligence integration.',
    details: [
      'Provides smart suggestions for crop management.',
      'Integrates via REST or external APIs (e.g., OpenAI/Local LLM).',
      'Helps farmers with predictive insights based on location.'
    ],
    color: 'bg-purple-500'
  }
];

export default function ArchitectureMap() {
  const [selectedNode, setSelectedNode] = useState<TechNode | null>(null);

  return (
    <div className="w-full flex flex-col items-center py-6 bg-slate-50/50 rounded-xl border border-slate-100 shadow-sm">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
          Project Architecture
        </h2>
        <p className="text-slate-500 text-sm mt-2 max-w-lg mx-auto">
          Click on any component to understand its role and technology choices in the stack.
        </p>
      </div>

      <div className="relative w-full max-w-4xl flex flex-col md:flex-row items-center justify-between gap-6 px-4">
        {/* Frontend -> Backend */}
        <div className="hidden md:flex absolute top-1/2 left-[20%] w-[15%] h-0.5 bg-gradient-to-r from-blue-300 to-green-300 -translate-y-1/2 z-0">
          <motion.div
            className="w-2 h-2 rounded-full bg-blue-500 absolute -top-[3px] left-0"
            animate={{ left: ['0%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* Backend -> DB */}
        <div className="hidden md:flex absolute top-1/2 left-[50%] w-[15%] h-0.5 bg-gradient-to-r from-green-300 to-indigo-300 -translate-y-1/2 z-0">
          <motion.div
            className="w-2 h-2 rounded-full bg-green-500 absolute -top-[3px] left-0"
            animate={{ left: ['0%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: 0.5 }}
          />
        </div>

        {/* Backend -> AI */}
        <div className="hidden md:flex absolute top-[10%] left-[50%] w-0.5 h-[30%] bg-gradient-to-b from-purple-300 to-green-300 z-0">
          <motion.div
            className="w-2 h-2 rounded-full bg-purple-500 absolute left-[calc(50%-4px)] top-0"
            animate={{ top: ['0%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: 1 }}
          />
        </div>

        {nodes.map((node, _i) => {
          const Icon = node.icon;
          const isSelected = selectedNode?.id === node.id;
          
          return (
            <motion.div
              key={node.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedNode(node)}
              className={`relative z-10 flex flex-col items-center justify-center p-6 rounded-2xl cursor-pointer w-44 transition-all duration-300 ${
                isSelected 
                  ? 'bg-white shadow-xl ring-2 ring-emerald-500 ring-offset-2' 
                  : 'bg-white shadow-md hover:shadow-lg border border-slate-100'
              } ${node.id === 'ai' ? 'md:absolute md:top-[-80px] md:left-[50%] md:-translate-x-1/2' : ''}`}
            >
              <div className={`p-4 rounded-xl text-white block mb-3 shadow-inner ${node.color}`}>
                <Icon size={32} strokeWidth={1.5} />
              </div>
              <h3 className="font-semibold text-slate-800 text-center">{node.title}</h3>
              <p className="text-xs text-slate-500 text-center mt-1">{node.description}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="w-full max-w-2xl mt-16 bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 z-20"
          >
            <div className={`h-2 w-full ${selectedNode.color}`} />
            <div className="p-6 relative">
              <button 
                onClick={() => setSelectedNode(null)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
              
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-xl text-white ${selectedNode.color}`}>
                  <selectedNode.icon size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{selectedNode.title}</h3>
                  <p className="text-sm border-l-2 border-emerald-500 pl-2 text-slate-600 mt-1">
                    {selectedNode.description}
                  </p>
                </div>
              </div>

              <div className="space-y-3 mt-6">
                <h4 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Implementation Details</h4>
                <ul className="space-y-2">
                  {selectedNode.details.map((detail, idx) => (
                    <motion.li 
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-start gap-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100"
                    >
                      <ArrowRight size={16} className={`mt-0.5 shrink-0 ${selectedNode.color.replace('bg-', 'text-')}`} />
                      {detail}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
