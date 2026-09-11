import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { projectsService } from '@/lib/supabase/projectsService';
import { Project, Message } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/common/EmptyState';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const MessagesPage: React.FC = () => {
  const { currentUser, currentRole } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      setIsLoading(true);
      try {
        const projs = await projectsService.getProjects();
        setProjects(projs);
        if (projs.length > 0) {
          setSelectedProjectId(projs[0].id);
        }
      } catch (err) {
        console.warn('Error loading projects for messages:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProjects();
  }, []);

  useEffect(() => {
    if (!selectedProjectId) {
      setMessages([]);
      return;
    }

    async function loadChannelMessages() {
      try {
        const msgs = await projectsService.getMessages(selectedProjectId);
        setMessages(msgs);
      } catch (err) {
        console.warn('Error loading messages:', err);
      }
    }
    loadChannelMessages();

    const unsubscribe = projectsService.subscribeToProjectMessages(selectedProjectId, (newMsg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    });

    return () => {
      unsubscribe();
    };
  }, [selectedProjectId]);

  const handleSend = async () => {
    if (!input.trim() || !selectedProjectId) return;
    const text = input;
    setInput('');
    try {
      const sent = await projectsService.sendMessage(
        selectedProjectId,
        currentUser?.id || '00000000-0000-0000-0000-000000000001',
        text
      );
      setMessages((prev) => {
        if (prev.some((m) => m.id === sent.id)) return prev;
        return [...prev, sent];
      });
    } catch (e) {
      console.warn('Failed to send message:', e);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Collaboration & Project Messaging
        </h1>
        <p className="text-xs text-slate-500">
          Realtime project discussion channels connecting Government, Faculty, Students, and Industry partners.
        </p>
      </div>

      {isLoading ? (
        <div className="p-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          type="no-messages"
          title="No Active Project Channels"
          description="Project messaging channels are activated when innovation projects are instantiated from validated citizen challenges."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px]">
          {/* Project Selector Sidebar */}
          <Card className="border-slate-200 dark:border-slate-800 flex flex-col">
            <CardHeader className="p-3 border-b border-slate-200 dark:border-slate-800">
              <CardTitle className="text-xs uppercase font-bold text-slate-500">
                Active Project Channels ({projects.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 flex-1 overflow-y-auto space-y-1">
              {projects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedProjectId(p.id)}
                  className={`p-3 rounded-xl cursor-pointer transition-colors text-xs space-y-1 ${
                    selectedProjectId === p.id
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="font-bold text-slate-900 dark:text-slate-100 truncate">{p.title}</div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{p.district || 'Jharkhand'}</span>
                    <Badge variant="outline" className="text-[9px] uppercase">{p.status}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Active Chat Window */}
          <Card className="md:col-span-2 border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
            <CardHeader className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  {projects.find((p) => p.id === selectedProjectId)?.title || 'Discussion Channel'}
                </CardTitle>
                <span className="text-[10px] text-slate-400">Supabase Realtime Channel Active</span>
              </div>
            </CardHeader>

            <CardContent className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No messages posted in this channel yet. Say hello to start collaborating!
                </div>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">{m.senderName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{formatDate(m.createdAt)}</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">{m.text}</p>
                  </div>
                ))
              )}
            </CardContent>

            <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex gap-2">
              <input
                type="text"
                placeholder="Broadcast a message to assigned team members..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs"
              />
              <Button onClick={handleSend} size="sm" className="bg-emerald-800 text-white cursor-pointer">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
