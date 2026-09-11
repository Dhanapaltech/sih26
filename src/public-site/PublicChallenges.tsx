import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { challengesService } from '@/lib/supabase/challengesService';
import { Challenge } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Search, MapPin, Loader2, AlertCircle } from 'lucide-react';

export const PublicChallenges: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    challengesService
      .getChallenges({ search: search.trim() || undefined })
      .then(setChallenges)
      .catch((e) => {
        console.error('Failed to load challenges:', e);
        setError('Failed to load challenges. Please try again.');
      })
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Grassroots State Challenges Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Browse public community challenges submitted by citizens across Jharkhand.
          </p>
        </div>
        <Button
          onClick={() => navigate('/citizen/report')}
          className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs gap-1.5 self-start"
        >
          Report a Problem (/citizen)
        </Button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Search by keywords, village or district..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <span className="ml-3 text-sm text-slate-500">Loading challenges…</span>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && challenges.length === 0 && (
        <div className="text-center py-20 space-y-3">
          <div className="text-5xl">🔍</div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
            {search ? 'No challenges match your search' : 'No challenges yet'}
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            {search
              ? 'Try different keywords or clear the search filter.'
              : 'Be the first to report a local challenge from your community.'}
          </p>
          {!search && (
            <Button
              onClick={() => navigate('/citizen/report')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs mt-2"
            >
              Report a Challenge
            </Button>
          )}
        </div>
      )}

      {/* Challenges Grid */}
      {!loading && !error && challenges.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {challenges.map((ch) => (
            <Card
              key={ch.id}
              onClick={() => navigate(`/app/challenges/${ch.id}`)}
              className="cursor-pointer hover:border-emerald-500/50 hover:shadow-md transition-all border-slate-200 dark:border-slate-800 flex flex-col justify-between"
            >
              <CardContent className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      {ch.category}
                    </Badge>
                    <StatusBadge status={ch.status} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-2">
                    {ch.title}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                    {ch.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {ch.district}
                  </span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    Inspect &rarr;
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
