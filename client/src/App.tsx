import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { CommandCenter } from './components/CommandCenter';
import { AgentDashboard } from './components/AgentDashboard';
import { MissionPlanner } from './components/MissionPlanner';
import { TaskGraph } from './components/TaskGraph';
import { ApprovalCenter } from './components/ApprovalCenter';
import { MemoryExplorer } from './components/MemoryExplorer';
import { DecisionHistory } from './components/DecisionHistory';
import { AnalyticsView } from './components/AnalyticsView';
import { MissionReplay } from './components/MissionReplay';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<CommandCenter />} />
          <Route path="dashboard" element={<AgentDashboard />} />
          <Route path="planner" element={<MissionPlanner />} />
          <Route path="graph" element={<TaskGraph />} />
          <Route path="approvals" element={<ApprovalCenter />} />
          <Route path="memory" element={<MemoryExplorer />} />
          <Route path="decisions" element={<DecisionHistory />} />
          <Route path="analytics" element={<AnalyticsView />} />
          <Route path="replay" element={<MissionReplay />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
