import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, MessageSquare, MapPin, Calendar, Search, Plus } from 'lucide-react';
import { Issue } from '@/entities/Issue';
import { Comment } from '@/entities/Comment';
import { format } from 'date-fns';

export default function Community() {
  const [issues, setIssues] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const issuesData = await Issue.list('-created_date');
      const commentsData = await Comment.list('-created_date');
      setIssues(issuesData);
      setComments(commentsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  const upvoteIssue = async (issueId) => {
    try {
      const issue = issues.find(i => i.id === issueId);
      await Issue.update(issueId, { upvotes: (issue.upvotes || 0) + 1 });
      loadData();
    } catch (error) {
      console.error('Error upvoting issue:', error);
    }
  };

  const addComment = async () => {
    if (!newComment.trim() || !selectedIssue) return;

    setIsAddingComment(true);
    try {
      await Comment.create({
        issue_id: selectedIssue.id,
        content: newComment,
        user_name: 'Community Member'
      });
      
      // Update comment count
      await Issue.update(selectedIssue.id, {
        comments_count: (selectedIssue.comments_count || 0) + 1
      });
      
      setNewComment('');
      loadData();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
    setIsAddingComment(false);
  };

  const filteredIssues = issues.filter(issue =>
    issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-400',
      verified: 'bg-blue-500/20 text-blue-400',
      in_progress: 'bg-purple-500/20 text-purple-400',
      resolved: 'bg-green-500/20 text-green-400',
      closed: 'bg-gray-500/20 text-gray-400'
    };
    return colors[status] || colors.pending;
  };

  const getCategoryColor = (category) => {
    const colors = {
      infrastructure: 'bg-orange-500/20 text-orange-400',
      environment: 'bg-green-500/20 text-green-400',
      safety: 'bg-red-500/20 text-red-400',
      utilities: 'bg-blue-500/20 text-blue-400',
      governance: 'bg-purple-500/20 text-purple-400',
      transportation: 'bg-cyan-500/20 text-cyan-400',
      healthcare: 'bg-pink-500/20 text-pink-400'
    };
    return colors[category] || 'bg-gray-500/20 text-gray-400';
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">Community Forum</h1>
          <p className="text-slate-400 text-lg">Engage with your community and track civic issues together</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Issues List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search */}
            <Card className="bg-slate-900 border-slate-700">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search issues by title, description, or location..."
                    className="pl-10 bg-slate-800 border-slate-600 text-white"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Issues */}
            <div className="space-y-4">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-slate-800 h-32 rounded-lg"></div>
                ))
              ) : (
                filteredIssues.map((issue) => (
                  <motion.div
                    key={issue.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Card 
                      className={`bg-slate-900 border-slate-700 cursor-pointer transition-all hover:border-slate-600 ${
                        selectedIssue?.id === issue.id ? 'border-cyan-500' : ''
                      }`}
                      onClick={() => setSelectedIssue(issue)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-white mb-2">{issue.title}</h3>
                            <p className="text-slate-300 mb-3 line-clamp-2">{issue.description}</p>
                            
                            <div className="flex items-center gap-3 text-sm text-slate-400 mb-3">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {issue.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {format(new Date(issue.created_date), 'MMM d')}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 mb-4">
                              <Badge className={getStatusColor(issue.status)}>
                                {issue.status.replace('_', ' ')}
                              </Badge>
                              <Badge className={getCategoryColor(issue.category)}>
                                {issue.category}
                              </Badge>
                            </div>
                          </div>

                          {issue.image_url && (
                            <img
                              src={issue.image_url}
                              alt="Issue"
                              className="w-20 h-20 object-cover rounded-lg border border-slate-600 ml-4"
                            />
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                upvoteIssue(issue.id);
                              }}
                              className="text-slate-400 hover:text-cyan-400"
                            >
                              <ThumbsUp className="w-4 h-4 mr-1" />
                              {issue.upvotes || 0}
                            </Button>
                            
                            <div className="flex items-center gap-1 text-slate-400">
                              <MessageSquare className="w-4 h-4" />
                              {issue.comments_count || 0}
                            </div>
                          </div>

                          <div className="text-sm text-slate-400">
                            By {issue.created_by}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}

              {filteredIssues.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No issues found matching your search.</p>
                </div>
              )}
            </div>
          </div>

          {/* Comments Section */}
          <div className="space-y-6">
            {selectedIssue ? (
              <>
                <Card className="bg-slate-900 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Issue Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <h3 className="text-white font-semibold mb-2">{selectedIssue.title}</h3>
                    <p className="text-slate-300 mb-4">{selectedIssue.description}</p>
                    
                    {selectedIssue.image_url && (
                      <img
                        src={selectedIssue.image_url}
                        alt="Issue"
                        className="w-full h-48 object-cover rounded-lg border border-slate-600 mb-4"
                      />
                    )}

                    <div className="flex items-center gap-2 mb-4">
                      <Badge className={getStatusColor(selectedIssue.status)}>
                        {selectedIssue.status.replace('_', ' ')}
                      </Badge>
                      <Badge className={getCategoryColor(selectedIssue.category)}>
                        {selectedIssue.category}
                      </Badge>
                    </div>

                    <div className="text-sm text-slate-400 space-y-1">
                      <div>📍 {selectedIssue.location}</div>
                      <div>🗓 {format(new Date(selectedIssue.created_date), 'PPp')}</div>
                      <div>👤 {selectedIssue.created_by}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Comments ({selectedIssue.comments_count || 0})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 mb-4">
                      {comments
                        .filter(comment => comment.issue_id === selectedIssue.id)
                        .map((comment) => (
                          <div key={comment.id} className="bg-slate-800 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {comment.user_name[0]}
                              </div>
                              <span className="text-slate-300 font-medium">{comment.user_name}</span>
                              <span className="text-slate-500 text-xs">
                                {format(new Date(comment.created_date), 'MMM d, h:mm a')}
                              </span>
                            </div>
                            <p className="text-slate-300">{comment.content}</p>
                          </div>
                        ))}
                    </div>

                    <div className="space-y-3">
                      <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="bg-slate-800 border-slate-600 text-white"
                      />
                      <Button
                        onClick={addComment}
                        disabled={isAddingComment || !newComment.trim()}
                        className="w-full bg-cyan-600 hover:bg-cyan-700"
                      >
                        {isAddingComment ? (
                          <>
                            <Plus className="w-4 h-4 mr-2 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Comment
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="bg-slate-900 border-slate-700">
                <CardContent className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">Select an issue to view details and comments</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
