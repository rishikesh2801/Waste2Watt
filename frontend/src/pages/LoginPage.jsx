import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, ArrowLeft, Shield, Truck, Briefcase, Users, Eye, EyeOff } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('mayor');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const roles = [
    { id: 'mayor', label: 'Mayor', icon: Shield },
    { id: 'collector', label: 'Waste Collector', icon: Users },
    { id: 'vehicle-manager', label: 'Vehicle Manager', icon: Truck },
    { id: 'service-men', label: 'Service Men', icon: Briefcase },
  ];

  const { setUser, staffList } = useAppContext();
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    if (role === 'mayor') {
      if (email === 'mayor@mcr.gov.in' && password === 'password') {
        setUser({ role, email, name: 'Mayor Amit' });
        return navigate(`/${role}`);
      }
      return setError('Invalid username/email or password.');
    } else {
      // Find user in staffList based on the email provided
      const foundUser = staffList.find(s => s.email === email);
      if (foundUser) {
        // Compare password with MongoDB's fetched hash/string
        const userPass = foundUser.password || 'password';
        if (password !== userPass) {
            return setError('Invalid username/email or password.');
        }
        
        setUser({ role, email, name: foundUser.name, id: foundUser.id });
        return navigate(`/${role}`);
      }
    }

    setError('Invalid username/email or password.');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="absolute top-4 left-4">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-700 hover:text-green-700 transition-colors font-bold px-4 py-2 rounded-xl bg-white border border-gray-200 shadow-sm hover:border-green-300"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>
      </div>

      <div className="card-3d w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full p-1 card-3d shadow-3d-dark bg-white flex items-center justify-center mb-4">
            <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover rounded-full" />
          </div>
          <h2 className="text-2xl font-bold text-municipal-dark">Authority Login</h2>
          <p className="text-slate-500 text-sm mt-1">Access your dashboard</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm font-semibold border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">Select Role</label>
            <div className="grid grid-cols-2 gap-3">
              {roles.map((r) => {
                const Icon = r.icon;
                const isActive = role === r.id;
                return (
                  <div 
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    className={`cursor-pointer flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 border-2 ${
                      isActive 
                      ? 'border-municipal-blue bg-municipal-blue/5 shadow-inner-3d text-municipal-blue' 
                      : 'border-transparent card-3d shadow-sm hover:shadow-3d-card text-slate-500'
                    }`}
                  >
                    <Icon className="w-6 h-6 mb-2" />
                    <span className="text-xs font-semibold text-center">{r.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="w-5 h-5 text-slate-400" />
              </div>
              <input 
                required
                type="text" 
                placeholder="Email or Username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-3d pl-12"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-slate-400" />
              </div>
              <input 
                required
                type={showPassword ? "text" : "password"} 
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-3d pl-12 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary w-full text-lg mt-2 py-4">
            Login Securely
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
