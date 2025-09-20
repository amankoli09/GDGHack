import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  ArrowUpDown, 
  Eye, 
  MapPin, 
  Calendar, 
  ThumbsUp, 
  MessageSquare, 
  Save, 
  Building,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Activity,
  Filter,
  Search,
  Download,
  Bell,
  Settings,
  BarChart3,
  PieChart
} from 'lucide-react';
import { Issue } from '@/entities/Issue';
import { Comment } from '@/entities/Comment';
import { format } from 'date-fns';
import { DataTable } from '../components/dashboard/DataTable';
import { StatsCard } from '../components/dashboard/StatsCard';
import { IssueDetailsPanel } from '../components/dashboard/IssueDetailsPanel';
import { DashboardCharts } from '../components/dashboard/DashboardCharts';

export default function Dashboard() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [issueUpdate, setIssueUpdate] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const loadIssues = useCallback(async () => {
    setLoading(true);
    try {
      const data = await Issue.list('-created_date');
      setIssues(data);
    } catch (error) {
      console.error('Error loading issues:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadIssues();
  }, [loadIssues]);

  useEffect(() => {
    const fetchComments = async () => {
      if (selectedIssue) {
        try {
          const commentsData = await Comment.filter({ issue_id: selectedIssue.id }, '-created_date');
          setComments(commentsData);
          setIssueUpdate({
            status: selectedIssue.status,
            department: selectedIssue.department || '',
            resolution_note: selectedIssue.resolution_note || '',
          });
        } catch (error) {
          console.error('Error fetching comments:', error);
        }
      }
    };
    fetchComments();
  }, [selectedIssue]);

  const handleUpdateIssue = async () => {
    if (!selectedIssue) return;
    try {
      await Issue.update(selectedIssue.id, issueUpdate);
      await loadIssues();
      const updatedIssueInList = issues.find(i => i.id === selectedIssue.id);
      setSelectedIssue({...updatedIssueInList, ...issueUpdate});
    } catch (error) {
      console.error('Error updating issue:', error);
    }
  };

  // Filter issues based on current filters
  const filteredIssues = issues.filter(issue => {
    const statusMatch = filterStatus === 'all' || issue.status === filterStatus;
    const categoryMatch = filterCategory === 'all' || issue.category === filterCategory;
    const priorityMatch = filterPriority === 'all' || issue.priority === filterPriority;
    const searchMatch = searchTerm === '' || 
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    return statusMatch && categoryMatch && priorityMatch && searchMatch;
  });

  // Calculate comprehensive statistics
  const stats = {
    total: issues.length,
    pending: issues.filter(i => i.status === 'pending').length,
    verified: issues.filter(i => i.status === 'verified').length,
    inProgress: issues.filter(i => i.status === 'in_progress').length,
    resolved: issues.filter(i => i.status === 'resolved').length,
    closed: issues.filter(i => i.status === 'closed').length,
    critical: issues.filter(i => i.priority === 'critical').length,
    high: issues.filter(i => i.priority === 'high').length,
    totalUpvotes: issues.reduce((sum, i) => sum + (i.upvotes || 0), 0),
    avgResponseTime: '2.4',
    resolutionRate: issues.length > 0 ? ((issues.filter(i => i.status === 'resolved').length / issues.length) * 100).toFixed(1) : 0,
    
    // Category breakdown
    categoryStats: issues.reduce((acc, issue) => {
      acc[issue.category] = (acc[issue.category] || 0) + 1;
      return acc;
    }, {}),
    
    // Department workload
    departmentStats: issues.reduce((acc, issue) => {
      const dept = issue.department || 'Unassigned';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {}),

    // Recent activity (last 7 days)
    recentIssues: issues.filter(i => {
      const issueDate = new Date(i.created_date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return issueDate >= weekAgo;
    }).length
  };

  const columns = [
    { 
      accessorKey: 'title', 
      header: 'Issue Title',
    },
    { 
      accessorKey: 'category', 
      header: 'Category',
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.original.category}
        </Badge>
      )
    },
    { 
      accessorKey: 'priority', 
      header: 'Priority',
      cell: ({ row }) => (
        <Badge className={
          row.original.priority === 'critical' ? 'bg-red-500 hover:bg-red-600' :
          row.original.priority === 'high' ? 'bg-orange-500 hover:bg-orange-600' :
          row.original.priority === 'medium' ? 'bg-yellow-500 hover:bg-yellow-600' :
          'bg-green-500 hover:bg-green-600'
        }>
          {row.original.priority}
        </Badge>
      )
    },
    { 
      accessorKey: 'status', 
      header: 'Status',
      cell: ({ row }) => (
        <Badge className={
          row.original.status === 'resolved' ? 'bg-green-500 hover:bg-green-600' :
          row.original.status === 'in_progress' ? 'bg-blue-500 hover:bg-blue-600' :
          row.original.status === 'verified' ? 'bg-purple-500 hover:bg-purple-600' :
          'bg-slate-500 hover:bg-slate-600'
        }>
          {row.original.status.replace('_', ' ')}
        </Badge>
      )
    },
    { 
      accessorKey: 'department', 
      header: 'Department',
      cell: ({ row }) => (
        <span className="text-slate-300">
          {row.original.department || 'Unassigned'}
        </span>
      )
    },
    { 
      accessorKey: 'upvotes', 
      header: 'Community Support',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <ThumbsUp className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-300">{row.original.upvotes || 0}</span>
        </div>
      )
    },
    { 
      accessorKey: 'created_date', 
      header: 'Reported',
      cell: ({ row }) => (
        <span className="text-slate-400">
          {format(new Date(row.original.created_date), 'MMM d, yyyy')}
        </span>
      )
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-screen-2xl mx-auto p-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Government Control Center</h1>
              <p className="text-slate-400 text-lg">Real-time civic issue monitoring and management system</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <div className="flex items-center gap-2 px-3 py-2 bg-green-900/30 border border-green-700 rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">Live Data</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-slate-700">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="issues" className="data-[state=active]:bg-slate-700">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Issue Management
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-slate-700">
              <PieChart className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="departments" className="data-[state=active]:bg-slate-700">
              <Building className="w-4 h-4 mr-2" />
              Departments
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Total Issues"
                value={stats.total}
                icon={AlertTriangle}
                change="+12% from last week"
                changeType="increase"
                color="cyan"
              />
              <StatsCard
                title="Resolution Rate"
                value={`${stats.resolutionRate}%`}
                icon={Target}
                change="+5.2% from last month"
                changeType="increase"
                color="green"
              />
              <StatsCard
                title="Avg Response Time"
                value={`${stats.avgResponseTime}hrs`}
                icon={Clock}
                change="-0.3hrs from last week"
                changeType="decrease"
                color="blue"
              />
              <StatsCard
                title="Community Engagement"
                value={stats.totalUpvotes}
                icon={Users}
                change="+18% from last week"
                changeType="increase"
                color="purple"
              />
            </div>

            {/* Status Overview */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: 'Pending Review', value: stats.pending, color: 'bg-yellow-500', icon: Clock },
                { label: 'Verified', value: stats.verified, color: 'bg-blue-500', icon: CheckCircle },
                { label: 'In Progress', value: stats.inProgress, color: 'bg-purple-500', icon: Activity },
                { label: 'Resolved', value: stats.resolved, color: 'bg-green-500', icon: CheckCircle },
                { label: 'Critical Priority', value: stats.critical, color: 'bg-red-500', icon: AlertTriangle },
              ].map((stat) => (
                <Card key={stat.label} className="bg-slate-900 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <stat.icon className={`w-5 h-5 ${stat.color.replace('bg-', 'text-')}`} />
                      <span className="text-2xl font-bold text-white">{stat.value}</span>
                    </div>
                    <p className="text-slate-400 text-sm">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Charts */}
            <DashboardCharts issues={issues} stats={stats} />
          </TabsContent>

          {/* Issues Management Tab */}
          <TabsContent value="issues" className="space-y-6">
            {/* Filters and Search */}
            <Card className="bg-slate-900 border-slate-700">
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex-1 min-w-64">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="Search issues by title, description, or location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                  
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40 bg-slate-800 border-slate-600 text-white">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-40 bg-slate-800 border-slate-600 text-white">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="infrastructure">Infrastructure</SelectItem>
                      <SelectItem value="environment">Environment</SelectItem>
                      <SelectItem value="safety">Safety</SelectItem>
                      <SelectItem value="utilities">Utilities</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="w-40 bg-slate-800 border-slate-600 text-white">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Issues Table and Details */}
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="bg-slate-900 border-slate-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white">
                        Issues ({filteredIssues.length})
                      </CardTitle>
                      <Badge variant="outline" className="text-slate-300">
                        Showing {filteredIssues.length} of {issues.length}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <DataTable
                      columns={columns}
                      data={filteredIssues}
                      loading={loading}
                      onRowClick={setSelectedIssue}
                    />
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-1">
                <IssueDetailsPanel
                  selectedIssue={selectedIssue}
                  issueUpdate={issueUpdate}
                  setIssueUpdate={setIssueUpdate}
                  handleUpdateIssue={handleUpdateIssue}
                  comments={comments}
                />
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Performance Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Resolution Rate</span>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-green-400">+5.2%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Response Time</span>
                      <div className="flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-green-400" />
                        <span className="text-green-400">-12.5%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Citizen Satisfaction</span>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-green-400">+8.1%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Category Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.categoryStats)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 5)
                      .map(([category, count]) => (
                        <div key={category} className="flex items-center justify-between">
                          <span className="text-slate-300 capitalize">{category}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                                style={{ width: `${(count / Math.max(...Object.values(stats.categoryStats))) * 100}%` }}
                              />
                            </div>
                            <span className="text-slate-400 text-sm">{count}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                      <div>
                        <p className="text-white text-sm font-medium">New Issues</p>
                        <p className="text-slate-400 text-xs">Last 7 days</p>
                      </div>
                      <span className="text-2xl font-bold text-cyan-400">{stats.recentIssues}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                      <div>
                        <p className="text-white text-sm font-medium">Resolved</p>
                        <p className="text-slate-400 text-xs">Last 7 days</p>
                      </div>
                      <span className="text-2xl font-bold text-green-400">
                        {issues.filter(i => {
                          const resolvedDate = new Date(i.updated_date || i.created_date);
                          const weekAgo = new Date();
                          weekAgo.setDate(weekAgo.getDate() - 7);
                          return i.status === 'resolved' && resolvedDate >= weekAgo;
                        }).length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Departments Tab */}
          <TabsContent value="departments" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(stats.departmentStats)
                .sort(([,a], [,b]) => b - a)
                .map(([department, count]) => (
                  <Card key={department} className="bg-slate-900 border-slate-700">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white text-lg">
                          {department}
                        </CardTitle>
                        <Building className="w-6 h-6 text-slate-400" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-cyan-400">{count}</div>
                          <div className="text-slate-400 text-sm">Active Issues</div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Resolved</span>
                            <span className="text-green-400">
                              {issues.filter(i => i.department === department && i.status === 'resolved').length}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">In Progress</span>
                            <span className="text-blue-400">
                              {issues.filter(i => i.department === department && i.status === 'in_progress').length}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Pending</span>
                            <span className="text-yellow-400">
                              {issues.filter(i => i.department === department && i.status === 'pending').length}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
