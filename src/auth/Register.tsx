import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/lib/supabase/authService';
import { UserRole } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { JHARKHAND_DISTRICTS } from '@/lib/constants';
import { Loader2, AlertCircle } from 'lucide-react';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { setUser, setRole } = useAuthStore();

  const [role, setRoleState] = useState<UserRole>('citizen');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [district, setDistrict] = useState('Dumka');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { user, error } = await authService.signUp(email, password, {
        fullName: name,
        role,
        district,
      });

      if (error) {
        setErrorMessage(error.message || 'Registration failed.');
        return;
      }

      if (user) {
        setUser(user);
        setRole(role);
        if (role === 'citizen') {
          navigate('/citizen');
        } else {
          navigate('/app');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-white">Join Jharkhand Innovation Hub</h2>
          <p className="text-xs text-slate-400">
            Create an official Supabase account to start innovating or reporting civic challenges.
          </p>
        </div>

        <Card className="border-slate-700 bg-slate-800/90 shadow-2xl p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300">Choose Your Cadre Role</Label>
              <select
                value={role}
                onChange={(e) => setRoleState(e.target.value as UserRole)}
                className="w-full h-9 rounded-lg border border-slate-700 bg-slate-900 text-xs px-3 text-white"
              >
                <option value="citizen">Citizen (Grassroots challenge reporting)</option>
                <option value="government">Government Official (Departmental validation & oversight)</option>
                <option value="university">University Administrator (Campus R&D & Labs)</option>
                <option value="faculty">Faculty Mentor (Research Principal Investigator)</option>
                <option value="student">Student Innovator (Engineering Cell)</option>
                <option value="industry">Industry Partner (CSR, Mentorship & Hardware)</option>
                <option value="startup">AgriTech / CleanTech Startup</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300">Full Name *</Label>
              <Input
                type="text"
                required
                placeholder="e.g. Rahul Mahto"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-slate-900 border-slate-700 text-white h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300">Email Address *</Label>
              <Input
                type="email"
                required
                placeholder="you@domain.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-900 border-slate-700 text-white h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300">Password (min 6 characters) *</Label>
              <Input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-900 border-slate-700 text-white h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300">Home / Institution District *</Label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full h-9 rounded-lg border border-slate-700 bg-slate-900 text-xs px-3 text-white"
              >
                {JHARKHAND_DISTRICTS.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-800 hover:bg-emerald-700 text-white text-xs h-9 font-bold flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Complete Supabase Registration'}
            </Button>
          </form>

          <div className="text-center pt-2 text-xs text-slate-400">
            Already registered?{' '}
            <Link to="/login" className="text-emerald-400 hover:underline">
              Sign In to Your Account
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
