'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Node {
  id: string;
  label: string;
  type: string;
  description: string;
  x: number;
  y: number;
}

interface Edge {
  from: string;
  to: string;
}

interface ArchitectureDiagramProps {
  nodes: Node[];
  edges: Edge[];
}

export default function ArchitectureDiagram({ nodes, edges }: ArchitectureDiagramProps) {
  const [selectedNode, setSelectedNode] = useState<Node | null>(nodes[0] || null);

  return (
    <div className="space-y-6">
      {/* Visual Canvas */}
      <div className="relative w-full h-[320px] bg-charcoal/20 border border-white/5 rounded-2xl overflow-hidden p-6 shadow-premium">
        {/* Fine grid lines inside diagram */}
        <div className="absolute inset-0 grid-background opacity-[0.06] pointer-events-none" />

        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="rgba(255, 255, 255, 0.2)" />
            </marker>
          </defs>
          
          {/* Render Connections */}
          {edges.map((edge, idx) => {
            const fromNode = nodes.find(n => n.id === edge.from);
            const toNode = nodes.find(n => n.id === edge.to);
            if (!fromNode || !toNode) return null;

            // Simple line paths with arrows
            return (
              <motion.line
                key={idx}
                x1={`${fromNode.x}%`}
                y1={`${fromNode.y}px`}
                x2={`${toNode.x}%`}
                y2={`${toNode.y}px`}
                stroke="rgba(255, 255, 255, 0.12)"
                strokeWidth="1.5"
                markerEnd="url(#arrow)"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              />
            );
          })}
        </svg>

        {/* Render Node Blocks */}
        {nodes.map((node) => {
          const isSelected = selectedNode?.id === node.id;
          
          return (
            <motion.div
              key={node.id}
              onClick={() => setSelectedNode(node)}
              className={`absolute p-3.5 rounded-xl border cursor-pointer transition-all duration-200 w-[160px] text-center select-none shadow-sm
                ${isSelected 
                  ? 'bg-accent-cyan/15 border-accent-cyan text-accent-cyan shadow-[0_0_20px_rgba(6,182,212,0.2)]' 
                  : 'bg-onyx/90 border-white/5 text-stone hover:border-white/20 hover:text-warm-white'
                }
              `}
              style={{
                left: `calc(${node.x}% - 80px)`,
                top: `${node.y - 30}px`,
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-[10px] font-semibold tracking-wider text-stone uppercase mb-0.5">
                {node.type}
              </div>
              <div className="text-[12px] font-bold truncate">
                {node.label}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Details Panel */}
      <AnimatePresence mode="wait">
        {selectedNode && (
          <motion.div
            key={selectedNode.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="p-4 rounded-xl bg-charcoal/20 border border-white/5"
          >
            <div className="flex items-center gap-3 mb-1.5">
              <span className="text-[10px] bg-accent-cyan/10 border border-accent-cyan/20 px-2 py-0.5 rounded text-accent-cyan font-bold uppercase tracking-wider">
                {selectedNode.type}
              </span>
              <h4 className="text-[13px] font-bold text-warm-white">{selectedNode.label}</h4>
            </div>
            <p className="text-[12px] text-stone leading-relaxed">
              {selectedNode.description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
