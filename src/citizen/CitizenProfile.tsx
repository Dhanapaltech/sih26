import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/lib/supabase/authService';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RoleBadge } from '@/components/common/RoleBadge';
import { JHARKHAND_DISTRICTS } from '@/lib/constants';
import {
  MapPin,
  Phone,
  Mail,
  Shield,
  Moon,
  Sun,
  LogOut,
  ExternalLink,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

export const CitizenProfile: React.FC = () => {
  const { currentUser, setUser, logout, theme, setTheme } = useAuthStore();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser?.displayName || '');
  const [district, setDistrict] = useState(currentUser?.district || 'Dumka');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.id) return;
    setIsSaving(true);
    try {
      await authService.updateProfile(currentUser.id, {
        displayName: name,
        district,
        phone,
      });
      setUser({
        ...currentUser,
        displayName: name,
        district,
        phone,
      });
      setSavedSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.warn('Profile update error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="space-y-6">
      {savedSuccess && (
        <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Profile updated successfully in Supabase PostgreSQL!
        </div>
      )}

      {/* Profile Overview Card */}
      <Card className="border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-emerald-800 via-emerald-700 to-slate-900" />
        <CardContent className="px-6 pb-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-10 mb-4 gap-4">
            <div className="flex items-end gap-3.5">
              <div className="w-20 h-20 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-2xl font-bold border-4 border-white dark:border-slate-900 shadow-lg">
                {currentUser?.displayName?.[0] || 'C'}
              </div>
              <div className="space-y-0.5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {currentUser?.displayName || 'Citizen'}
                </h3>
                <RoleBadge role={currentUser?.role || 'citizen'} />
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/app')}
              className="text-xs self-start gap-1 cursor-pointer"
            >
              Switch to Professional Portal <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </div>

          {!isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>District: <strong>{currentUser?.district || 'Ranchi, Jharkhand'}</strong></span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span>{currentUser?.email || 'citizen@jharkhand.in'}</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <Phone className="w-4 h-4 text-amber-600" />
                  <span>{currentUser?.phone || '+91 94310 00000'}</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <Shield className="w-4 h-4 text-purple-600" />
                  <span>Supabase Verified User Profile</span>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => setIsEditing(true)} className="text-xs cursor-pointer">
                Edit Profile Information
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-3 pt-2">
              <div>
                <Label className="text-xs">Full Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="text-xs h-9" />
              </div>
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
                <Label className="text-xs">Phone Number</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="text-xs h-9" />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={isSaving} size="sm" className="bg-emerald-800 text-white text-xs cursor-pointer">
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Changes'}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)} className="text-xs cursor-pointer">
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Preferences & Logout */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Preferences & Session</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600 dark:text-slate-300">Theme Mode</span>
            <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-1.5 rounded-lg text-xs cursor-pointer ${theme === 'light' ? 'bg-white shadow-xs text-amber-600' : 'text-slate-500'}`}
              >
                <Sun className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-1.5 rounded-lg text-xs cursor-pointer ${theme === 'dark' ? 'bg-slate-900 shadow-xs text-blue-400' : 'text-slate-500'}`}
              >
                <Moon className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="w-full text-xs text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 gap-1.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Sign Out of Supabase Session
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
