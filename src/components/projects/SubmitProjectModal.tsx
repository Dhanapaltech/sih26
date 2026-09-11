import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsService } from '@/lib/supabase/projectsService';
import { challengesService } from '@/lib/supabase/challengesService';
import { Challenge, Project } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FolderKanban, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';

interface SubmitProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialChallengeId?: string;
  onProjectCreated?: (project: Project) => void;
}

const JHARKHAND_UNIVERSITIES = [
  { id: '11111111-1111-1111-1111-111111111101', name: 'Birla Institute of Technology (BIT Mesra)' },
  { id: '11111111-1111-1111-1111-111111111102', name: 'National Institute of Technology (NIT Jamshedpur)' },
  { id: '11111111-1111-1111-1111-111111111103', name: 'IIT (ISM) Dhanbad' },
  { id: '11111111-1111-1111-1111-111111111104', name: 'Birsa Agricultural University (BAU Ranchi)' },
  { id: '11111111-1111-1111-1111-111111111105', name: 'Ranchi University' },
];

export const SubmitProjectModal: React.FC<SubmitProjectModalProps> = ({
  isOpen,
  onClose,
  initialChallengeId,
  onProjectCreated,
}) => {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>(initialChallengeId || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [universityId, setUniversityId] = useState(JHARKHAND_UNIVERSITIES[0].id);
  const [district, setDistrict] = useState('Ranchi');
  const [budgetEst, setBudgetEst] = useState('350000');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      challengesService.getChallenges().then((list) => {
        setChallenges(list);
        if (initialChallengeId) {
          setSelectedChallengeId(initialChallengeId);
          const ch = list.find((c) => c.id === initialChallengeId);
          if (ch) {
            setTitle(`Solution: ${ch.title}`);
            setDistrict(ch.district || 'Ranchi');
          }
        } else if (list.length > 0 && !selectedChallengeId) {
          setSelectedChallengeId(list[0].id);
          setTitle(`Solution: ${list[0].title}`);
          setDistrict(list[0].district || 'Ranchi');
        }
      });
    }
  }, [isOpen, initialChallengeId]);

  const handleChallengeChange = (chId: string) => {
    setSelectedChallengeId(chId);
    const ch = challenges.find((c) => c.id === chId);
    if (ch) {
      if (!title || title.startsWith('Solution:')) {
        setTitle(`Solution: ${ch.title}`);
      }
      setDistrict(ch.district || 'Ranchi');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    setSuccessMessage(null);

    try {
      const budgetNum = Number(budgetEst) || 300000;
      const newProj = await projectsService.createProject({
        title: title.trim(),
        description: description.trim() || 'Multidisciplinary engineering solution initiated for grassroots challenge.',
        challengeId: selectedChallengeId || undefined,
        universityId,
        district,
        budget: {
          estimated: budgetNum,
          allocated: Math.round(budgetNum * 0.6),
          spent: 0,
          currency: 'INR',
        },
        status: 'active',
      });

      setSuccessMessage('Project successfully submitted & launched in State Innovation Portal!');
      if (onProjectCreated) {
        onProjectCreated(newProj);
      }

      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
        navigate(`/app/projects/${newProj.id}`);
      }, 1000);
    } catch (err: any) {
      console.warn('Project submission error:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600">
              <FolderKanban className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">Submit Innovation Project</DialogTitle>
              <p className="text-xs text-slate-500">
                Launch an academic or student R&D engineering cell to solve a citizen problem.
              </p>
            </div>
          </div>
        </DialogHeader>

        {successMessage ? (
          <div className="p-6 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{successMessage}</h3>
            <p className="text-xs text-slate-500">Redirecting to project workspace...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Citizen Challenge Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Select Citizen Problem Statement</Label>
              <select
                value={selectedChallengeId}
                onChange={(e) => handleChallengeChange(e.target.value)}
                className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs"
              >
                <option value="">-- Standalone Innovation Project (No linked challenge) --</option>
                {challenges.map((c) => (
                  <option key={c.id} value={c.id}>
                    [{c.district}] {c.title.substring(0, 65)}...
                  </option>
                ))}
              </select>
            </div>

            {/* Project Title */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Project Title *</Label>
              <Input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Low-Cost Nano-Adsorbent Filtration Unit"
                className="text-xs h-9"
              />
            </div>

            {/* Lead University & District */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Lead Academic Institution</Label>
                <select
                  value={universityId}
                  onChange={(e) => setUniversityId(e.target.value)}
                  className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs"
                >
                  {JHARKHAND_UNIVERSITIES.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Target District</Label>
                <Input
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g. Dumka, Ranchi, Bokaro"
                  className="text-xs h-9"
                />
              </div>
            </div>

            {/* Estimated Budget & Target */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Estimated Grant / Budget (₹ INR)</Label>
                <Input
                  type="number"
                  value={budgetEst}
                  onChange={(e) => setBudgetEst(e.target.value)}
                  placeholder="350000"
                  className="text-xs h-9 font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Initial Stage</Label>
                <Badge variant="outline" className="w-full h-9 flex items-center justify-center text-xs font-medium bg-purple-50 dark:bg-purple-950/40 text-purple-700 border-purple-300">
                  <Sparkles className="w-3.5 h-3.5 mr-1" /> Active Prototyping
                </Badge>
              </div>
            </div>

            {/* Solution Description */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Technical Approach & Deliverables</Label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe how the student engineering team will build and pilot this solution..."
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <DialogFooter className="pt-2 flex flex-col sm:flex-row gap-2 justify-end">
              <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || !title.trim()}
                className="bg-emerald-700 hover:bg-emerald-800 text-white gap-1.5 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    <FolderKanban className="w-3.5 h-3.5" /> Submit & Launch Project
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
