import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Database,
  Search,
  Plus,
  Copy,
  Check,
  Tag,
  Clock,
  Sparkles,
  Bot,
  Filter,
} from 'lucide-react';
import { useMissionStore } from '../store/missionStore';
import { MemoryCategory } from '../types';

export const MemoryExplorer: React.FC = () => {
  const { memories, addCustomMemory } = useMissionStore();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Add memory modal state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValueStr, setNewValueStr] = useState('{\n  "note": "Custom mission context"\n}');
  const [newCategory, setNewCategory] = useState<MemoryCategory>('context');

  const categories: Array<{ id: string; label: string; color: string }> = [
    { id: 'all', label: 'All Records', color: 'text-slate-200' },
    { id: 'context', label: 'Context', color: 'text-cyan-400' },
    { id: 'constraint', label: 'Constraints', color: 'text-rose-400' },
    { id: 'decision', label: 'Decisions', color: 'text-purple-400' },
    { id: 'artifact', label: 'Artifacts', color: 'text-emerald-400' },
  ];

  const filteredMemories = memories.filter((m) => {
    const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;
    const matchesSearch =
      search === '' ||
      m.key.toLowerCase().includes(search.toLowerCase()) ||
      JSON.stringify(m.value).toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(newValueStr);
      await addCustomMemory(newKey, parsed, newCategory);
      setIsAddOpen(false);
      setNewKey('');
      setNewValueStr('{\n  "note": "Custom mission context"\n}');
    } catch (err) {
      alert('Invalid JSON in memory value');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Database className="w-5 h-5 text-teal-400" />
            <h1 className="text-2xl font-bold text-white font-['Outfit']">
              Persistent Project Memory Explorer
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Chronicle Agent Knowledge Base: Contextual parameters, operational constraints, and cached artifacts
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-teal-500/20 flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Context Record</span>
        </button>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-slate-800 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className={cat.color}>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search keys or values..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Memory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMemories.map((mem) => {
          const jsonText = JSON.stringify(mem.value, null, 2);
          const isCopied = copiedId === mem.id;

          const getCategoryColor = (cat: string) => {
            switch (cat) {
              case 'constraint':
                return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
              case 'decision':
                return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
              case 'artifact':
                return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
              default:
                return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
            }
          };

          return (
            <motion.div
              key={mem.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-panel p-5 rounded-2xl border border-slate-850 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border uppercase ${getCategoryColor(
                        mem.category
                      )}`}
                    >
                      {mem.category}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {new Date(mem.created_at).toLocaleTimeString()}
                    </span>
                  </div>

                  <button
                    onClick={() => handleCopy(mem.id, jsonText)}
                    className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                    title="Copy JSON to clipboard"
                  >
                    {isCopied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <h3 className="text-sm font-bold font-mono text-white mb-2 truncate">
                  {mem.key}
                </h3>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 font-mono text-xs text-teal-300 overflow-x-auto max-h-44">
                  <pre>{jsonText}</pre>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredMemories.length === 0 && (
        <div className="glass-panel p-10 rounded-2xl border border-slate-800 text-center space-y-2">
          <Database className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">No memory records matched query</h3>
          <p className="text-xs text-slate-500">
            Try adjusting your search criteria or insert a new project context record.
          </p>
        </div>
      )}

      {/* Add Memory Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0e1424] border border-teal-500/40 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-['Outfit']">
                Store New Memory Record
              </h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMemory} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1">
                  Memory Key Identifier
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. sponsor_contract_terms"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-teal-500"
                >
                  <option value="context">Context</option>
                  <option value="constraint">Constraint</option>
                  <option value="decision">Decision</option>
                  <option value="artifact">Artifact</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1">
                  JSON Data Value
                </label>
                <textarea
                  rows={5}
                  required
                  value={newValueStr}
                  onChange={(e) => setNewValueStr(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-teal-300 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white text-xs font-bold"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
