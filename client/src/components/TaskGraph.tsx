import React, { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  NodeProps,
  Edge,
  Node,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import {
  CheckCircle2,
  Clock,
  RotateCw,
  AlertTriangle,
  Ban,
  Bot,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
} from 'lucide-react';
import { useMissionStore } from '../store/missionStore';
import { Task } from '../types';

// Custom Task Node Component
const CustomTaskNode: React.FC<NodeProps> = ({ data, selected }) => {
  const task = data.task as Task;
  const agentName = (data.agentName as string) || 'Unassigned';

  const getNodeStyles = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          border: 'border-emerald-500/70',
          bg: 'bg-[#09151c]/90',
          glow: 'shadow-emerald-500/15',
          indicator: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
          badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        };
      case 'in_progress':
        return {
          border: 'border-cyan-400',
          bg: 'bg-[#091726]/90',
          glow: 'shadow-cyan-500/25 ring-2 ring-cyan-500/20',
          indicator: <RotateCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />,
          badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
        };
      case 'failed':
        return {
          border: 'border-rose-500',
          bg: 'bg-[#1a0f18]/90',
          glow: 'shadow-rose-500/30 ring-2 ring-rose-500/30 animate-pulse',
          indicator: <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />,
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        };
      case 'blocked':
        return {
          border: 'border-amber-500/60',
          bg: 'bg-[#181310]/90',
          glow: 'shadow-amber-500/15',
          indicator: <Ban className="w-3.5 h-3.5 text-amber-400" />,
          badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        };
      default:
        return {
          border: 'border-slate-700/80',
          bg: 'bg-[#0d1322]/90',
          glow: 'shadow-none',
          indicator: <Clock className="w-3.5 h-3.5 text-slate-400" />,
          badge: 'bg-slate-800 text-slate-400 border-slate-700',
        };
    }
  };

  const style = getNodeStyles(task.status);
  const isRecovery = task.title.startsWith('[RECOVERY]');

  return (
    <div
      className={`relative w-64 rounded-2xl border ${style.border} ${style.bg} ${style.glow} p-4 shadow-xl backdrop-blur-md transition-all hover:scale-[1.02] cursor-pointer ${
        selected ? 'ring-2 ring-cyan-400' : ''
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-cyan-400 !border-2 !border-slate-900 -left-1.5"
      />

      {/* Top Tag and Status */}
      <div className="flex items-center justify-between mb-2">
        <span
          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${style.badge}`}
        >
          {style.indicator}
          <span className="capitalize">{task.status.replace('_', ' ')}</span>
        </span>

        {isRecovery && (
          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
            PATCH
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-xs font-bold text-slate-100 line-clamp-2 leading-tight mb-2">
        {task.title}
      </h3>

      {/* Agent & Phase Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px]">
        <div className="flex items-center gap-1.5 text-slate-400 truncate max-w-[130px]">
          <Bot className="w-3 h-3 text-cyan-400 shrink-0" />
          <span className="truncate">{agentName.split(' (')[0]}</span>
        </div>
        <span className="text-slate-400 font-mono text-[9px] shrink-0">
          {task.dependencies.length > 0 ? `${task.dependencies.length} prereqs` : 'Root'}
        </span>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-indigo-400 !border-2 !border-slate-900 -right-1.5"
      />
    </div>
  );
};

const nodeTypes = {
  customTask: CustomTaskNode,
};

// Dagre Layout Algorithm
const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'LR') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({ rankdir: direction, ranksep: 80, nodesep: 50 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 270, height: 130 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 135,
        y: nodeWithPosition.y - 65,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

export const TaskGraph: React.FC = () => {
  const { tasks, agents, setSelectedTaskId } = useMissionStore();

  // Create initial nodes and edges
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const agentMap: Record<string, string> = {};
    agents.forEach((a) => {
      agentMap[a.id] = a.name;
    });

    const rawNodes: Node[] = tasks.map((task) => ({
      id: task.id,
      type: 'customTask',
      data: {
        task,
        agentName: task.assigned_agent_id ? agentMap[task.assigned_agent_id] : 'Unassigned',
      },
      position: { x: 0, y: 0 },
    }));

    const rawEdges: Edge[] = [];
    tasks.forEach((task) => {
      task.dependencies.forEach((depId) => {
        // verify source exists
        if (tasks.some((t) => t.id === depId)) {
          const isCompleted = tasks.find((t) => t.id === depId)?.status === 'completed';
          rawEdges.push({
            id: `e-${depId}-${task.id}`,
            source: depId,
            target: task.id,
            animated: task.status === 'in_progress' || !isCompleted,
            style: {
              stroke: isCompleted ? '#10b981' : task.status === 'failed' ? '#f43f5e' : '#38bdf8',
              strokeWidth: 2,
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: isCompleted ? '#10b981' : task.status === 'failed' ? '#f43f5e' : '#38bdf8',
            },
          });
        }
      });
    });

    return getLayoutedElements(rawNodes, rawEdges, 'LR');
  }, [tasks, agents]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync when tasks change
  React.useEffect(() => {
    const layout = getLayoutedElements(initialNodes, initialEdges, 'LR');
    setNodes(layout.nodes);
    setEdges(layout.edges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedTaskId(node.id);
    },
    [setSelectedTaskId]
  );

  return (
    <div className="h-[calc(100vh-8.5rem)] w-full rounded-2xl border border-slate-800/80 bg-[#060913] relative overflow-hidden shadow-2xl">
      {/* Legend & Instructions Bar */}
      <div className="absolute top-4 left-4 z-10 glass-panel px-4 py-2.5 rounded-xl border border-slate-800 text-xs flex flex-wrap items-center gap-4 shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-1.5 font-bold font-['Outfit'] text-white">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          Interactive Task DAG
        </div>
        <div className="h-4 w-px bg-slate-800" />
        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-300">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Completed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" /> In Progress
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400" /> Failed / Disrupted
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-600" /> Pending
          </span>
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        fitView
        className="tactical-grid"
      >
        <Background color="#1e293b" gap={24} size={1} />
        <Controls className="!bg-slate-900/90 !border-slate-800 !text-slate-300 !rounded-xl !shadow-xl [&>button]:!border-slate-800 [&>button]:!fill-slate-300" />
        <MiniMap
          nodeColor={(n) => {
            const task = n.data?.task as Task | undefined;
            if (task?.status === 'completed') return '#10b981';
            if (task?.status === 'in_progress') return '#38bdf8';
            if (task?.status === 'failed') return '#f43f5e';
            return '#475569';
          }}
          className="!bg-[#0a0f1d]/90 !border-slate-800 !rounded-xl"
          maskColor="rgba(7, 10, 18, 0.75)"
        />
      </ReactFlow>
    </div>
  );
};
