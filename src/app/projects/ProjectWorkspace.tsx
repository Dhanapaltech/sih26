import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { projectsService } from '@/lib/supabase/projectsService';
import { Project, Task, Milestone, Message } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { EmptyState } from '@/components/common/EmptyState';
import {
  FolderKanban,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Users,
  Briefcase,
  TrendingUp,
  MessageSquare,
  Sparkles,
  Send,
  Plus,
  Target,
  Loader2,
} from 'lucide-react';

import { formatDate } from '@/lib/utils';

export const ProjectWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();

  const projectId = id || '';
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'milestones' | 'chat' | 'industry' | 'impact'>('overview');

  // Tasks
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Milestones
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  // Realtime Messages
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');

  const loadProjectData = async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const proj = await projectsService.getProjectById(projectId);
      setProject(proj);

      const [taskList, milestoneList, msgList] = await Promise.all([
        projectsService.getTasks(projectId),
        projectsService.getMilestones(projectId),
        projectsService.getMessages(projectId),
      ]);
      setTasks(taskList);
      setMilestones(milestoneList);
      setMessages(msgList);
    } catch (e) {
      console.warn('Error loading project data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjectData();

    if (projectId) {
      const unsubscribe = projectsService.subscribeToProjectMessages(projectId, (newMsg) => {
        setMessages((prev) => [...prev, newMsg]);
      });
      return () => {
        unsubscribe();
      };
    }
  }, [projectId]);

  const handleTaskStatus = async (taskId: string, status: Task['status']) => {
    await projectsService.updateTaskStatus(taskId, status);
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)));
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || !project) return;
    try {
      const created = await projectsService.createTask({
        projectId: project.id,
        title: newTaskTitle,
        createdBy: currentUser?.id || 'user-1',
        assignedTo: currentUser?.id,
      });
      setTasks((prev) => [...prev, created]);
      setNewTaskTitle('');
    } catch (e) {
      console.warn('Add task error:', e);
    }
  };

  const handleMilestoneIncrement = async (mId: string, current: number) => {
    if (!project) return;
    const next = Math.min(100, current + 20);
    await projectsService.updateMilestoneProgress(mId, next);
    setMilestones((prev) => prev.map((m) => (m.id === mId ? { ...m, progress: next } : m)));

    await projectsService.updateProjectProgress(project.id, 5);
    setProject((prev) => (prev ? { ...prev, progress: Math.min(100, prev.progress + 5) } : prev));
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !project) return;
    const text = chatInput;
    setChatInput('');
    try {
      const sent = await projectsService.sendMessage(
        project.id,
        currentUser?.id || '00000000-0000-0000-0000-000000000001',
        text
      );
      setMessages((prev) => {
        if (prev.some((m) => m.id === sent.id)) return prev;
        return [...prev, sent];
      });
    } catch (e) {
      console.warn('Send message error:', e);
    }
  };

  if (isLoading) {
    return (
      <div className="p-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 text-center space-y-3">
        <h3 className="text-lg font-bold">Project Workspace Not Found</h3>
        <p className="text-xs text-slate-500">No project record matched the provided ID in Supabase.</p>
        <Button size="sm" onClick={() => navigate('/app/projects')}>
          &larr; Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top back button */}
      <button
        onClick={() => navigate('/app/projects')}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Projects Repository
      </button>

      {/* Main Workspace Header */}
      <Card className="border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-emerald-600 via-amber-500 to-purple-600" />
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold text-slate-400">PROJECT {project.id.substring(0, 8)}</span>
                <Badge className="bg-emerald-800 text-white text-[10px] uppercase font-mono">
                  {project.status}
                </Badge>
                <Badge variant="outline" className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                  Health: {project.health}
                </Badge>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-50">
                {project.title}
              </h1>
              <p className="text-xs text-slate-500">
                Field District: {project.district || 'Jharkhand'} • Impact Potential: {project.impactPotential}
              </p>
            </div>

            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 shrink-0">
              <div className="text-right">
                <span className="text-2xl font-bold font-mono text-emerald-600">{project.progress}%</span>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Overall Readiness</span>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-emerald-600 flex items-center justify-center font-bold text-xs text-emerald-700 dark:text-emerald-300">
                {project.progress}%
              </div>
            </div>
          </div>

          <Progress value={project.progress} className="h-2.5" />

          {/* AI Advisory Callout */}
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-950 dark:text-emerald-200 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">AI Engineering Recommendation: </span>
              {project.aiRecommendation || 'Prototype validation in progress. Field sensor telemetry streams synced.'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto gap-1.5 p-1 bg-slate-200/70 dark:bg-slate-800/70 rounded-2xl">
        {[
          { id: 'overview', label: 'Overview & Scope' },
          { id: 'tasks', label: `Kanban Tasks (${tasks.length})` },
          { id: 'milestones', label: `Milestones (${milestones.length})` },
          { id: 'chat', label: `Team Discussion (${messages.length})` },
          { id: 'impact', label: 'Field Impact Metrics' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="p-4 sm:p-6 pb-2">
            <CardTitle className="text-base font-bold">Engineering Scope & Deliverables</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-2 space-y-4 text-xs">
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
              {project.description || 'This engineering project focuses on rapid prototyping, lab calibration, and field pilot deployments.'}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Risk Factor</span>
                <span className="font-bold text-emerald-600 capitalize">{project.risk}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Collaboration</span>
                <span className="font-mono font-bold text-purple-600">{project.collaborationScore}%</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Delay Risk</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{project.delayProbability}%</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Impact Potential</span>
                <span className="font-bold text-emerald-700 capitalize">{project.impactPotential}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 2: TASKS KANBAN */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add new engineering task in Supabase..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
              className="flex-1 h-10 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            />
            <Button
              onClick={handleAddTask}
              size="sm"
              className="bg-emerald-800 hover:bg-emerald-900 text-white gap-1 px-4 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Task
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {(['todo', 'in_progress', 'review', 'completed'] as const).map((statusCol) => {
              const colTasks = tasks.filter((t) => t.status === statusCol);
              return (
                <div key={statusCol} className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 space-y-2.5">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      {statusCol.replace('_', ' ')}
                    </span>
                    <Badge variant="secondary" className="text-[10px]">
                      {colTasks.length}
                    </Badge>
                  </div>

                  {colTasks.length === 0 ? (
                    <div className="py-6 text-center text-[11px] text-slate-400">No tasks in this stage</div>
                  ) : (
                    colTasks.map((t) => (
                      <Card key={t.id} className="p-3 space-y-2 text-xs border-slate-200 dark:border-slate-700 shadow-xs">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{t.title}</div>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500">
                          <span>{t.assigneeName || 'Unassigned'}</span>
                          <select
                            value={t.status}
                            onChange={(e) => handleTaskStatus(t.id, e.target.value as any)}
                            className="text-[10px] border rounded px-1 py-0.5 bg-white dark:bg-slate-900"
                          >
                            <option value="todo">Todo</option>
                            <option value="in_progress">In Progress</option>
                            <option value="review">Review</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: MILESTONES */}
      {activeTab === 'milestones' && (
        <div className="space-y-3">
          {milestones.length === 0 ? (
            <EmptyState
              title="No Milestones Defined Yet"
              description="Milestones are generated when faculty mentors configure the project roadmap."
            />
          ) : (
            milestones.map((m) => (
              <Card key={m.id} className="border-slate-200 dark:border-slate-800">
                <CardContent className="p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-sm text-slate-900 dark:text-slate-100">{m.title}</div>
                    <Badge variant="outline" className="capitalize">{m.status}</Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Progress</span>
                      <span className="font-bold text-emerald-600">{m.progress}%</span>
                    </div>
                    <Progress value={m.progress} className="h-2" />
                  </div>
                  <div className="flex justify-between items-center pt-2 text-[11px] text-slate-400">
                    <span>Target Date: {formatDate(m.targetDate)}</span>
                    {m.progress < 100 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMilestoneIncrement(m.id, m.progress)}
                        className="h-6 text-[10px] cursor-pointer"
                      >
                        + Progress +20%
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* TAB 4: REALTIME CHAT */}
      {activeTab === 'chat' && (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              Live Project Collaboration Feed (Supabase Realtime)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {messages.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No messages yet. Send a message to start discussion!</p>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">{msg.senderName}</span>
                      <span className="text-[10px] text-slate-400">{formatDate(msg.createdAt)}</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">{msg.text}</p>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <input
                type="text"
                placeholder="Broadcast to engineering team in realtime..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
              />
              <Button onClick={handleSendMessage} size="sm" className="bg-emerald-800 text-white cursor-pointer">
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 5: IMPACT */}
      {activeTab === 'impact' && (
        <div className="space-y-4">
          {/* Project Health Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Health Status</span>
              <span className={`text-lg font-bold font-mono capitalize ${
                project.health === 'excellent' ? 'text-emerald-600' :
                project.health === 'good' ? 'text-blue-600' :
                project.health === 'fair' ? 'text-amber-600' : 'text-rose-600'
              }`}>{project.health}</span>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Risk Level</span>
              <span className={`text-lg font-bold font-mono capitalize ${
                project.risk === 'low' ? 'text-emerald-600' :
                project.risk === 'medium' ? 'text-amber-600' : 'text-rose-600'
              }`}>{project.risk}</span>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Collab Score</span>
              <span className="text-lg font-bold font-mono text-purple-600">{project.collaborationScore}%</span>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Delay Probability</span>
              <span className={`text-lg font-bold font-mono ${
                (project.delayProbability || 0) < 20 ? 'text-emerald-600' :
                (project.delayProbability || 0) < 40 ? 'text-amber-600' : 'text-rose-600'
              }`}>{project.delayProbability}%</span>
            </div>
          </div>

          {/* Impact Potential */}
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-600" />
                Projected Societal Impact
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-3 text-xs">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40">
                <TrendingUp className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold text-emerald-900 dark:text-emerald-200 capitalize">
                    {project.impactPotential?.replace('_', ' ')} Impact Potential
                  </span>
                  <p className="text-emerald-700 dark:text-emerald-400 mt-0.5">
                    {project.aiRecommendation || 'Field deployment pending verification. AI prediction: High societal return expected for district communities.'}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-center space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Overall Readiness</span>
                <span className="text-3xl font-bold font-mono text-emerald-600">{project.progress}%</span>
                <Progress value={project.progress} className="h-2 mt-2" />
                <p className="text-[11px] text-slate-500 pt-1">
                  Impact metrics will be recorded in Supabase once field pilot is verified and deployment is confirmed.
                </p>
              </div>

              {/* Timeline */}
              {project.timeline && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Start Date</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{formatDate(project.timeline.startDate)}</span>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Expected Completion</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{formatDate(project.timeline.expectedEndDate)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
