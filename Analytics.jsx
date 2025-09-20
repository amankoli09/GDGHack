
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { TrendingUp, Clock, AlertTriangle, CheckCircle, Users, MapPin } from 'lucide-react';
import { Issue } from '@/entities/Issue';

export default function Analytics() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIssues();
  }, []);

  const loadIssues = async () => {
    setLoading(true);
    try {
      const data = await Issue.list('-created_date');
      setIssues(data);
    } catch (error) {
      console.error('Error loading issues:', error);
    }
    setLoading(false);
  };

  // Process data for charts
  const categoryData = issues.reduce((acc, issue) => {
    acc[issue.category] = (acc[issue.category] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(categoryData).map(([category, count], index) => ({
    name: category,
    value: count,
    color: ['#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#f97316', '#ec4899', '#6b7280'][index % 8]
  }));

  const statusData = issues.reduce((acc, issue) => {
    acc[issue.status] = (acc[issue.status] || 0) + 1;
    return acc;
  }, {});

  const barData = Object.entries(statusData).map(([status, count]) => ({
    status: status.replace('_', ' '),
    count
  }));

  // Mock trend data
  const trendData = [
    { month: 'Jan', reports: 120, resolved: 95 },
    { month: 'Feb', reports: 145, resolved: 120 },
    { month: 'Mar', reports: 189, resolved: 156 },
    { month: 'Apr', reports: 234, resolved: 201 },
    { month: 'May', reports: 289, resolved: 245 },
    { month: 'Jun', reports: 320, resolved: 298 },
  ];

  const stats = {
    total: issues.length,
    resolved: issues.filter(i => i.status === 'resolved').length,
    pending: issues.filter(i => i.status === 'pending').length,
    inProgress: issues.filter(i => i.status === 'in_progress').length,
    avgUpvotes: Math.round(issues.reduce((sum, i) => sum + (i.upvotes || 0), 0) / issues.length) || 0
  };

  const resolutionRate = issues.length > 0 ? ((stats.resolved / issues.length) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">Analytics Dashboard</h1>
          <p className="text-slate-400 text-lg">Comprehensive insights into civic issue reporting and resolution</p>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          {[
            { label: 'Total Reports', value: stats.total, icon: AlertTriangle, color: 'text-cyan-400' },
            { label: 'Resolved Issues', value: stats.resolved, icon: CheckCircle, color: 'text-green-400' },
            { label: 'Resolution Rate', value: `${resolutionRate}%`, icon: TrendingUp, color: 'text-purple-400' },
            { label: 'Pending Review', value: stats.pending, icon: Clock, color: 'text-yellow-400' },
            { label: 'Avg. Community Support', value: stats.avgUpvotes, icon: Users, color: 'text-pink-400' },
          ].map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-slate-900 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <metric.icon className={`w-6 h-6 ${metric.color}`} />
                    <span className="text-2xl font-bold text-white">{metric.value}</span>
                  </div>
                  <p className="text-slate-400 text-sm">{metric.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Trends Chart */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Reporting Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                      <Line type="monotone" dataKey="reports" stroke="#06b6d4" strokeWidth={3} dot={{ fill: '#06b6d4' }} />
                      <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                    <span className="text-slate-400 text-sm">Reports</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <span className="text-slate-400 text-sm">Resolved</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Status Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <XAxis dataKey="status" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                      <Bar dataKey="count" fill="url(#gradient)" radius={[4, 4, 0, 0]} />
                      <defs>
                        <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#06b6d4" />
                          <stop offset="100%" stopColor="#10b981" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Category Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2"
          >
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col lg:flex-row items-center gap-8">
                  <div className="w-64 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          startAngle={90}
                          endAngle={-270}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    {pieData.map((category, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }}></div>
                        <div>
                          <div className="text-white font-medium capitalize">{category.name}</div>
                          <div className="text-slate-400 text-sm">{category.value} reports</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Locations */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Top Issue Locations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {issues.length > 0 ? (
                  Object.entries(issues.reduce((acc, issue) => {
                    const location = issue.location.split(',')[0];
                    acc[location] = (acc[location] || 0) + 1;
                    return acc;
                  }, {}))
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 6)
                  .map(([location, count], index) => (
                    <div key={location} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          ['bg-cyan-500', 'bg-emerald-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-blue-500'][index]
                        }`}>
                          <span className="text-white text-xs font-bold">{index + 1}</span>
                        </div>
                        <div>
                          <div className="text-white font-medium">{location}</div>
                          <div className="text-slate-400 text-sm flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {count} issues
                          </div>
                        </div>
                      </div>
                      <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${['bg-cyan-500', 'bg-emerald-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-blue-500'][index]}`}
                          style={{ 
                            width: `${(count / Math.max(...Object.values(issues.reduce((acc, issue) => {
                              const location = issue.location.split(',')[0];
                              acc[location] = (acc[location] || 0) + 1;
                              return acc;
                            }, {})))) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-400 text-center">No location data available</div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
