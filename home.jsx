import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Satellite, Smartphone, TrendingUp, Shield, Plus, TrendingUp as ViewDashboardIcon, Menu, LogOut, Users, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { User } from '@/entities/User';
import { IssueService } from '../components/backend/IssueService';
import GoogleIcon from '../components/icons/GoogleIcon';

const NavLink = ({ href, children }) => (
  <Link to={href} className="text-slate-300 hover:text-white transition-colors duration-300">
    {children}
  </Link>
);

export default function Home() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [recentIssues, setRecentIssues] = useState([]);
  const [loadingIssues, setLoadingIssues] = useState(true);

  useEffect(() => {
    loadUser();
    loadRecentIssues();
  }, []);

  const loadUser = async () => {
    setLoadingUser(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    }
    setLoadingUser(false);
  };

  const loadRecentIssues = async () => {
    setLoadingIssues(true);
    try {
      const result = await IssueService.getAllIssues('-created_date', 3);
      if (result.success) {
        setRecentIssues(result.issues);
      }
    } catch (error) {
      console.error('Error loading recent issues:', error);
    }
    setLoadingIssues(false);
  };

  const handleLogin = async () => {
    await User.login();
  };

  const handleLogout = async () => {
    await User.logout();
    setUser(null);
    window.location.reload();
  };
  
  const earthImage = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b5d9ddc877b95e38697be3/acaaf5a98_a-planet-with-clouds-and-water-4b-3840x2400.jpg";

  const features = [
    {
      icon: Satellite,
      title: 'Satellite Monitoring',
      desc: 'Space-based observation for real-time issue detection.'
    },
    {
      icon: Smartphone,
      title: 'Citizen Reporting',
      desc: 'Easy-to-use mobile app for direct issue submission.'
    },
    {
      icon: TrendingUp,
      title: 'AI Analytics',
      desc: 'Intelligent classification and priority assignment.'
    },
    {
      icon: Shield,
      title: 'Government Dashboard',
      desc: 'Comprehensive management portal for authorities.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white overflow-x-hidden">
      {/* Starry background */}
      <div className="fixed inset-0 z-0 opacity-40" style={{
        backgroundImage: 'radial-gradient(white 1px, transparent 1px)',
        backgroundSize: '3rem 3rem'
      }} />
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-[#0d0d1a] via-transparent to-[#0d0d1a]" />

      {/* Header */}
      <header className="relative z-20 w-full p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to={createPageUrl("Home")} className="flex items-center gap-2">
             <Satellite className="w-7 h-7 text-cyan-400" />
             <span className="text-xl font-bold">NROCRS</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <NavLink href={createPageUrl("Home")}>Home</NavLink>
            <NavLink href={createPageUrl("ReportIssue")}>Report Issue</NavLink>
            <NavLink href={createPageUrl("Community")}>Community</NavLink>
            <NavLink href={createPageUrl("Dashboard")}>Dashboard</NavLink>
          </nav>
          <div className="flex items-center gap-4">
            {loadingUser ? (
              <div className="w-24 h-10 bg-slate-800 animate-pulse rounded-lg" />
            ) : user ? (
              <div className="flex items-center gap-2">
                 <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full flex items-center justify-center text-sm font-bold">
                  {user.full_name ? user.full_name[0] : 'U'}
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout} className="text-slate-400 hover:text-red-400">
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            ) : (
              <Button onClick={handleLogin} variant="outline" className="border-slate-600 bg-slate-900/50 backdrop-blur-sm hover:bg-slate-800/50 text-white rounded-xl">
                Sign In
              </Button>
            )}
             <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="h-screen flex flex-col justify-center items-center text-center px-6 relative -mt-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="space-y-6"
          >
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              National Citizen Reporting System
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto font-light">
              Empowering every citizen to report, track, and resolve civic issues together, building better communities.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to={createPageUrl("ReportIssue")}>
                <Button className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all duration-300">
                  <Plus className="mr-2" /> Report an Issue
                </Button>
              </Link>
              <Link to={createPageUrl("Dashboard")}>
                <Button variant="outline" className="text-white border-slate-600 bg-slate-900/50 backdrop-blur-sm hover:bg-slate-800/50 px-8 py-6 text-lg rounded-xl">
                  <ViewDashboardIcon className="mr-2" /> View Dashboard
                </Button>
              </Link>
            </div>
          </motion.div>
          <motion.div
            className="absolute bottom-0 left-0 w-full h-1/2"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: '40%', opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
          >
            <img src={earthImage} alt="Planet Earth from space" className="w-full h-auto object-contain" />
          </motion.div>
        </section>

        {/* System Features Section */}
        <section className="py-24 bg-[#0d0d1a]">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold mb-16"
            >
              System <span className="text-teal-400">Features</span>
            </motion.h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="text-center space-y-4"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  viewport={{ once: true }}
                >
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center ring-1 ring-teal-400/30">
                    <feature.icon className="w-10 h-10 text-teal-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white">{feature.title}</h3>
                  <p className="text-slate-400">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Recent Issues Section */}
        <section className="py-24 bg-gradient-to-b from-[#0d0d1a] to-[#111122]">
           <div className="max-w-5xl mx-auto px-6 text-center">
             <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold mb-16"
            >
              Latest <span className="text-cyan-400">Reports</span>
            </motion.h2>
            <div className="grid md:grid-cols-3 gap-8 text-left">
              {loadingIssues ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="bg-slate-800/50 rounded-xl p-6 h-40 animate-pulse"></div>
                ))
              ) : (
                recentIssues.map((issue, index) => (
                   <motion.div
                    key={issue.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.15 }}
                    viewport={{ once: true }}
                  >
                    <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-all h-full">
                      <CardContent className="p-6 space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge className="bg-cyan-500/20 text-cyan-300 capitalize border-cyan-500/30">{issue.category}</Badge>
                          <Badge variant="outline" className="border-slate-600 text-slate-400 capitalize">{issue.status.replace('_', ' ')}</Badge>
                        </div>
                        <h3 className="text-lg font-semibold text-white line-clamp-2">{issue.title}</h3>
                        <div className="flex items-center gap-2 text-slate-400 text-sm pt-2">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">{issue.location}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
             <div className="mt-16">
              <Link to={createPageUrl("Community")}>
                <Button variant="outline" className="border-slate-600 bg-slate-900/50 backdrop-blur-sm hover:bg-slate-800/50 text-white px-8 py-3 rounded-xl hover:border-cyan-400 transition-all duration-300">
                  <Users className="mr-2 w-5 h-5" />
                  View All Reports
                </Button>
              </Link>
            </div>
           </div>
        </section>
      </main>
    </div>
  );
}
