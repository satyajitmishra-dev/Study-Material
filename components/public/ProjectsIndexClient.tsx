'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Search, 
  Code2, 
  Star, 
  GitFork, 
  ArrowUpRight, 
  Clock, 
  FolderGit2
} from 'lucide-react';
import { Card, Button, Input } from '@/components/ui/core';

interface ProjectsIndexProps {
  projects: any[];
}

export default function ProjectsIndexClient({ projects: initialProjects }: ProjectsIndexProps) {
  const [search, setSearch] = useState('');
  const [filterTech, setFilterTech] = useState('');

  // Extract unique tech stack items for filtering
  const allTech = Array.from(
    new Set(
      initialProjects.flatMap((p: any) => p.techStack || [])
    )
  );

  // Filter projects
  const filteredProjects = initialProjects.filter((p: any) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
      (p.description || '').toLowerCase().includes(search.toLowerCase());
    const matchesTech = filterTech ? (p.techStack || []).includes(filterTech) : true;
    return matchesSearch && matchesTech;
  });

  return (
    <div className="w-full max-w-6xl mx-auto px-6 pt-20 pb-16">
      
      {/* Header Space */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/5 mb-12"
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-accent-cyan font-mono text-[11px] uppercase tracking-widest">
            <FolderGit2 className="w-4 h-4" />
            <span>Developer Showcases</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-warm-white">
            Explore Projects
          </h1>
          <p className="text-[13px] text-stone font-light max-w-lg leading-relaxed">
            Discover developer workspaces, track release notes, check roadmaps, and inspect linked repositories.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search showcases..."
              className="pl-9 bg-charcoal/30 border-white/5 text-[12px] h-9 rounded-lg"
            />
          </div>
          {allTech.length > 0 && (
            <select
              value={filterTech}
              onChange={(e) => setFilterTech(e.target.value)}
              className="bg-charcoal/30 border border-white/5 rounded-lg px-3 py-1.5 text-[12px] text-stone hover:text-warm-white outline-none transition-colors h-9"
            >
              <option value="">All Technologies</option>
              {allTech.map((tech: any) => (
                <option key={tech} value={tech}>{tech}</option>
              ))}
            </select>
          )}
        </div>
      </motion.div>

      {/* Showcase Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project: any, index: number) => {
            // Retrieve stars/forks from integration if present
            const integration = project.integrations?.find((i: any) => i.provider === 'github');
            let githubMeta: any = null;
            if (integration?.metadata) {
              try {
                githubMeta = JSON.parse(integration.metadata);
              } catch (e) {}
            }

            const stars = githubMeta?.stars ?? 0;
            const forks = githubMeta?.forks ?? 0;

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="h-full flex flex-col justify-between hover:border-white/10 group transition-all duration-300">
                  <div className="space-y-4">
                    {/* Header: Logo and Link */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {project.logo ? (
                          <img 
                            src={project.logo} 
                            alt={project.name} 
                            className="w-10 h-10 rounded-lg object-cover border border-white/10"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                            <Code2 className="w-5 h-5 text-stone" />
                          </div>
                        )}
                        <div>
                          <h3 className="text-[14px] font-bold text-warm-white group-hover:text-accent-cyan transition-colors">
                            {project.name}
                          </h3>
                          <span className="text-[10px] text-stone font-mono capitalize">Status: {project.status}</span>
                        </div>
                      </div>
                      <Link href={`/projects/${project.slug}`}>
                        <Button className="w-7 h-7 p-0 flex items-center justify-center bg-white/5 hover:bg-accent-cyan/10 border border-white/5 group-hover:border-accent-cyan/30 text-stone group-hover:text-accent-cyan transition-all rounded-lg">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>

                    {/* Banner cover if present */}
                    {project.banner && (
                      <div className="w-full h-24 overflow-hidden rounded-lg relative border border-white/5">
                        <img 
                          src={project.banner} 
                          alt={project.name} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent" />
                      </div>
                    )}

                    <p className="text-[12px] text-stone/80 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>

                    {/* Tech stack badges */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {project.techStack?.slice(0, 3).map((tech: string) => (
                        <span 
                          key={tech} 
                          className="text-[9px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-stone font-mono"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.techStack?.length > 3 && (
                        <span className="text-[9px] text-stone font-mono px-1">+{project.techStack.length - 3}</span>
                      )}
                    </div>
                  </div>

                  {/* Footer Metrics */}
                  <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-6 text-[10px] text-stone font-mono">
                    <div className="flex items-center gap-3">
                      {integration ? (
                        <>
                          <span className="flex items-center gap-1"><Star className="w-3 h-3 text-accent-cyan" /> {stars}</span>
                          <span className="flex items-center gap-1"><GitFork className="w-3 h-3" /> {forks}</span>
                        </>
                      ) : (
                        <span className="text-stone/40">Local Showcase</span>
                      )}
                    </div>
                    {project.updatedAt && (
                      <span className="flex items-center gap-1 text-[9px]">
                        <Clock className="w-3 h-3" />
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-3 bg-white/[0.01] border border-dashed border-white/5 rounded-2xl">
          <Code2 className="w-10 h-10 text-stone/30" />
          <h3 className="text-[14px] font-bold text-warm-white">No projects found</h3>
          <p className="text-[12px] text-stone max-w-xs">No public showcases match your search criteria or filter options.</p>
        </div>
      )}
    </div>
  );
}
