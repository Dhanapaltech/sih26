import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { JHARKHAND_DISTRICTS, CHALLENGE_CATEGORIES } from '@/lib/constants';
import { challengesService } from '@/lib/supabase/challengesService';
import { Challenge } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { Search, Download, Eye, Check, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const ChallengesPage: React.FC = () => {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const loadChallenges = async () => {
    setIsLoading(true);
    try {
      const data = await challengesService.getChallenges({
        category: selectedCategory,
        district: selectedDistrict,
        status: selectedStatus,
        search,
      });
      setChallenges(data);
    } catch (e) {
      console.warn('Error loading challenges:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadChallenges();
  }, [selectedCategory, selectedDistrict, selectedStatus, search]);

  const exportCSV = () => {
    const headers = ['ID', 'Title', 'District', 'Category', 'Priority', 'AI Score', 'Status', 'SubmittedAt'];
    const rows = challenges.map((c) => [
      c.id,
      `"${c.title.replace(/"/g, '""')}"`,
      c.district,
      c.category,
      c.priority || 'medium',
      c.aiScore || 8.0,
      c.status,
      c.submittedAt,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `jharkhand_challenges_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleQuickValidate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await challengesService.validateChallenge(id, 'Quick validated from Challenges Repository');
    loadChallenges();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            State Challenges Repository
          </h1>
          <p className="text-xs text-slate-500">
            Centralized registry of verified problems filed by citizens across all 24 districts of Jharkhand.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start">
          <Button
            size="sm"
            variant="outline"
            onClick={exportCSV}
            className="text-xs gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Export Official CSV
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="relative sm:col-span-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search problems..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
          />
        </div>

        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs px-3 text-slate-800 dark:text-slate-200"
          >
            <option value="all">All Sectors ({CHALLENGE_CATEGORIES.length})</option>
            {CHALLENGE_CATEGORIES.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs px-3 text-slate-800 dark:text-slate-200"
          >
            <option value="all">All 24 Districts</option>
            {JHARKHAND_DISTRICTS.map((d) => (
              <option key={d.id} value={d.name}>{d.name}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs px-3 text-slate-800 dark:text-slate-200"
          >
            <option value="all">All Lifecycle States</option>
            <option value="submitted">Submitted</option>
            <option value="ai_analyzed">AI Analyzed</option>
            <option value="validated">Validated</option>
            <option value="university_matched">University Matched</option>
            <option value="project_created">Project Created</option>
            <option value="prototype">Prototype</option>
            <option value="pilot">Pilot</option>
            <option value="deployed">Deployed</option>
          </select>
        </div>
      </div>

      {/* Challenges Table */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
            </div>
          ) : challenges.length === 0 ? (
            <div className="p-10">
              <EmptyState
                type="no-challenges"
                title="0 Challenges in Repository"
                description="No challenges match your query or filters. Check back once citizen reports are submitted."
              />
            </div>
          ) : (
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Problem Summary</th>
                  <th className="py-3 px-4">District</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">AI Score</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:border-slate-800">
                {challenges.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => navigate(`/app/challenges/${c.id}`)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-300 max-w-[100px] truncate">
                      {c.id.substring(0, 8)}...
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100 max-w-sm truncate">
                      {c.title}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{c.district}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-[10px]">{c.category}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <PriorityBadge priority={c.priority || 'medium'} />
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {c.aiScore || 8.0}/10
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-3 px-4 text-slate-500">{formatDate(c.submittedAt)}</td>
                    <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs px-2 text-slate-500 hover:text-slate-900 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/app/challenges/${c.id}`);
                        }}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      {c.status !== 'validated' && (
                        <Button
                          size="sm"
                          className="h-7 text-xs px-2.5 bg-emerald-700 hover:bg-emerald-800 text-white gap-1 cursor-pointer"
                          onClick={(e) => handleQuickValidate(c.id, e)}
                        >
                          <Check className="w-3 h-3" /> Validate
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
