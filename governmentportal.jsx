
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/entities/User';
import { createPageUrl } from '@/utils';
import { Shield, LogIn, XCircle, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import GoogleIcon from '../components/icons/GoogleIcon';

export default function GovernmentPortal() {
  const [status, setStatus] = useState('checking'); // checking, unauthorized, requires_login
  const navigate = useNavigate();

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const user = await User.me();
        if (user && user.role === 'admin') {
          navigate(createPageUrl('Dashboard'));
        } else {
          setStatus('unauthorized');
        }
      } catch (error) {
        // User is not logged in
        setStatus('requires_login');
      }
    };

    checkAccess();
  }, [navigate]);

  const handleLogin = async () => {
    // Use the built-in Google login directly
    await User.login();
  };

  if (status === 'checking') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex items-center gap-4">
          <Shield className="w-8 h-8 animate-pulse text-cyan-400" />
          <p className="text-xl">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <Card className="max-w-md w-full bg-slate-900 border-slate-700 text-white text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-3 text-2xl">
              <Shield className="w-8 h-8 text-cyan-400" />
              Government Portal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {status === 'requires_login' && (
              <>
                <XCircle className="w-16 h-16 text-yellow-400 mx-auto" />
                <h3 className="text-xl font-semibold">Authentication Required</h3>
                <p className="text-slate-400">
                  Please log in to access the NROCRS Government Dashboard.
                </p>
                <Button onClick={handleLogin} className="w-full bg-white text-slate-800 hover:bg-slate-200">
                  <GoogleIcon className="w-5 h-5 mr-2" />
                  Continue with Google
                </Button>
              </>
            )}
            {status === 'unauthorized' && (
              <>
                <XCircle className="w-16 h-16 text-red-500 mx-auto" />
                <h3 className="text-xl font-semibold">Access Denied</h3>
                <p className="text-slate-400">
                  You do not have the necessary permissions to access this page. This portal is for authorized government personnel only.
                </p>
                <Button onClick={() => navigate(createPageUrl('Home'))} variant="outline" className="w-full border-slate-600 hover:bg-slate-800">
                  <Home className="w-5 h-5 mr-2" />
                  Return to Home
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
