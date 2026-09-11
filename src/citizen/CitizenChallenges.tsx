import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { challengesService } from '@/lib/supabase/challengesService';
import { Challenge } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/common/EmptyState';
import { Plus, MapPin, Calendar, ArrowRight, Search, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const CitizenChallenges: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadChallenges() {
      setIsLoading(true);
      try {
        const data = await challengesService.getChallenges({
          citizenId: currentUser?.id,
        });
        setChallenges(data);
      } catch (err) {
        console.error('Error loading challenges:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadChallenges();
  }, [currentUser]);

  const filtered = challenges.filter((c) => {
    if (filter === 'active') return c.status !== 'deployed' && c.status !== 'impact_measured';
    if (filter === 'resolved') return c.status === 'deployed' || c.status === 'impact_measured' || c.status === 'pilot';
    return true;
  }).filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.district.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            My Submitted Problems
          </h2>
          <p className="text-xs text-slate-500">
            Track validation, university assignment, and real-world deployment status.
          </p>
        </div>
        <Button
          onClick={() => navigate('/citizen/report')}
          size="sm"
          className="bg-emerald-800 hover:bg-emerald-900 text-white gap-1.5 self-start cursor-pointer"
        >
          <Plus className="w-4 h-4" /> New Report
        </Button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by keyword or district..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
          />
        </div>
        <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          {(['all', 'active', 'resolved'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors cursor-pointer ${
                filter === tab ? 'bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-400 shadow-xs' : 'text-slate-500'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Challenges List */}
      {isLoading ? (
        <div className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          type="no-challenges"
          title="No challenges submitted yet"
          description={search ? "No challenges match your search query." : "You have not filed any civic challenges yet. Submit a problem in your village or town."}
          actionLabel={search ? undefined : "Report a Problem"}
          onAction={search ? undefined : () => navigate('/citizen/report')}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((ch) => (
            <Card
              key={ch.id}
              onClick={() => navigate(`/citizen/challenges/${ch.id}`)}
              className="cursor-pointer hover:border-emerald-500/50 hover:shadow-md transition-all border-slate-200 dark:border-slate-800"
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">
                        {ch.category}
                      </Badge>
                      <PriorityBadge priority={ch.priority || 'medium'} />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {ch.title}
                    </h4>
                  </div>
                  <StatusBadge status={ch.status} />
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                  {ch.description}
                </p>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {ch.district} {ch.village ? `(${ch.village})` : ''}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatDate(ch.submittedAt)}
                    </span>
                  </div>
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    Inspect Lifecycle <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
