import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/lib/supabase/authService';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RoleBadge } from '@/components/common/RoleBadge';
import { JHARKHAND_DISTRICTS } from '@/lib/constants';
import {
  Sun,
  Moon,
  LogOut,
  Mail,
  MapPin,
  Phone,
  CheckCircle2,
  Loader2,
  Award,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { currentUser, currentRole, setUser, logout, theme, setTheme } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser?.displayName || '');
  const [district, setDistrict] = useState(currentUser?.district || 'Ranchi');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [isSaving, setIsSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.id) return;
    setIsSaving(true);
    try {
      await authService.updateProfile(currentUser.id, {
        displayName: name,
        district,
        phone,
        bio,
      });
      setUser({
        ...currentUser,
        displayName: name,
        district,
        phone,
        bio,
      });
      setSavedNotice(true);
      setIsEditing(false);
      setTimeout(() => setSavedNotice(false), 3000);
    } catch (e) {
      console.warn('Profile update error:', e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {savedNotice && (
        <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Profile updated successfully in Supabase PostgreSQL!
        </div>
      )}

      {/* Header Banner */}
      <Card className="border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-emerald-800 via-emerald-700 to-slate-900" />
        <CardContent className="px-6 pb-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-12 mb-4 gap-4">
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-3xl font-bold border-4 border-white dark:border-slate-900 shadow-xl">
                {currentUser?.displayName?.[0] || 'U'}
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {currentUser?.displayName || 'Innovator'}
                </h2>
                <div className="flex items-center gap-2">
                  <RoleBadge role={currentRole} />
                  <span className="text-xs text-slate-400 font-mono">ID: {currentUser?.id.substring(0, 8)}...</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="text-xs gap-1.5 cursor-pointer"
              >
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                {theme === 'dark' ? 'Light' : 'Dark'}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={logout}
                className="text-xs gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </Button>
            </div>
          </div>

          {!isEditing ? (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Email</span>
                    <span className="font-semibold">{currentUser?.email}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">District</span>
                    <span className="font-semibold">{currentUser?.district || 'Ranchi'}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-purple-600" />
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Phone</span>
                    <span className="font-semibold">{currentUser?.phone || '+91 Not Provided'}</span>
                  </div>
                </div>
              </div>

              {currentUser?.bio && (
                <p className="text-xs text-slate-600 dark:text-slate-400">{currentUser.bio}</p>
              )}

              <Button size="sm" variant="outline" onClick={() => setIsEditing(true)} className="text-xs cursor-pointer">
                Edit Profile
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-3 pt-3">
              <div>
                <Label className="text-xs">Full Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="text-xs h-9" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">District</Label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs px-3"
                  >
                    {JHARKHAND_DISTRICTS.map((d) => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Phone</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="text-xs h-9" />
                </div>
              </div>
              <div>
                <Label className="text-xs">Bio / Role Specialization</Label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full rounded-lg border p-2 text-xs bg-white dark:bg-slate-900"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isSaving} size="sm" className="bg-emerald-800 text-white text-xs cursor-pointer">
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Profile'}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)} className="text-xs cursor-pointer">
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
