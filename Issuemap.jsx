
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Filter, Eye, BarChart3 } from 'lucide-react';
import { Issue } from '@/entities/Issue';

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icon not appearing correctly
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});


export default function IssuesMap() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [map, setMap] = useState(null);

  useEffect(() => {
    loadIssues();
  }, []);

  useEffect(() => {
    if (map) {
      // Fix for the grey box glitch by invalidating map size after a short delay
      const timer = setTimeout(() => {
        map.invalidateSize();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [map]);


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

  const categories = ['all', 'infrastructure', 'environment', 'safety', 'utilities', 'governance', 'transportation', 'healthcare'];
  
  const filteredIssues = issues
    .filter(issue => issue.latitude != null && issue.longitude != null) // Ensure issues have coordinates
    .filter(issue => selectedCategory === 'all' || issue.category === selectedCategory);

  // Helper for Tailwind color to hex mapping (REMOVED - no longer needed as functions return hex directly)
  // const tailwindColorMap = { ... };
  // const getHexColor = (tailwindClass) => { ... };

  const getCategoryColor = (category) => {
    const colors = {
      infrastructure: '#fb923c', // orange
      environment: '#22c55e', // green
      safety: '#ef4444', // red
      utilities: '#3b82f6', // blue
      governance: '#a855f7', // purple
      transportation: '#06b6d4', // cyan
      healthcare: '#ec4899', // pink
      other: '#6b7280' // gray
    };
    return colors[category] || '#6b7280';
  };

  const getStatusBorderColor = (status) => {
    const colors = {
      pending: '#facc15', // yellow
      verified: '#60a5fa', // light blue
      in_progress: '#c084fc', // light purple
      resolved: '#4ade80', // light green
      closed: '#9ca3af' // gray
    };
    return colors[status] || '#facc15';
  };
  
  const createCustomIcon = (issue) => {
    const categoryColor = getCategoryColor(issue.category);
    const statusBorderColor = getStatusBorderColor(issue.status);

    return L.divIcon({
      html: `<div style="background-color: ${categoryColor}; border: 3px solid ${statusBorderColor}; width: 20px; height: 20px;" class="rounded-full shadow-lg flex items-center justify-center">
                <div style="background-color: white; width: 6px; height: 6px;" class="rounded-full"></div>
             </div>`,
      className: 'custom-marker',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">Live Issues Map</h1>
          <p className="text-slate-400 text-lg">Real-time satellite visualization of civic issues across India</p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Map Area */}
          <div className="lg:col-span-3">
            <Card className="bg-slate-900 border-slate-700 h-96 lg:h-[calc(100vh-22rem)]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Satellite Issues Map</CardTitle>
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="bg-slate-800 border border-slate-600 rounded px-3 py-1 text-white text-sm"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>
                          {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative p-0 h-full">
                <MapContainer 
                  center={[20.5937, 78.9629]} // Center of India
                  zoom={5} 
                  scrollWheelZoom={true} 
                  className="h-full w-full rounded-b-lg"
                  whenCreated={setMap}
                >
                  {/* Google Maps Hybrid Satellite Layer */}
                  <TileLayer
                    attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
                    url="https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                    subdomains={['mt0','mt1','mt2','mt3']}
                  />
                  
                  {filteredIssues.map(issue => (
                    <Marker 
                      key={issue.id} 
                      position={[issue.latitude, issue.longitude]}
                      icon={createCustomIcon(issue)}
                    >
                      <Popup>
                        <div className="text-slate-900 bg-white rounded-lg p-2 min-w-[200px]">
                          <h3 className="font-bold text-base mb-2 text-slate-800">{issue.title}</h3>
                          <div className="space-y-1 text-sm">
                            <p><span className="font-semibold">Category:</span> <span className="capitalize">{issue.category}</span></p>
                            <p><span className="font-semibold">Status:</span> <span className="capitalize">{issue.status.replace('_', ' ')}</span></p>
                            <p><span className="font-semibold">Priority:</span> <span className="capitalize">{issue.priority}</span></p>
                            <p><span className="font-semibold">Location:</span> {issue.location}</p>
                            {issue.upvotes > 0 && <p><span className="font-semibold">Community Support:</span> {issue.upvotes} upvotes</p>}
                          </div>
                          {issue.image_url && (
                            <img src={issue.image_url} alt="Issue evidence" className="mt-2 w-full h-20 object-cover rounded border" />
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </CardContent>
            </Card>

            {/* Enhanced Legend */}
            <Card className="bg-slate-900 border-slate-700 mt-6">
              <CardHeader>
                <CardTitle className="text-white text-lg">Map Legend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="text-slate-300 font-medium text-sm">Issue Categories</h4>
                    {[
                      { key: 'infrastructure', color: '#fb923c', label: 'Infrastructure' },
                      { key: 'environment', color: '#22c55e', label: 'Environment' },
                      { key: 'safety', color: '#ef4444', label: 'Safety' },
                      { key: 'utilities', color: '#3b82f6', label: 'Utilities' },
                      { key: 'governance', color: '#a855f7', label: 'Governance' },
                      { key: 'transportation', color: '#06b6d4', label: 'Transportation' },
                      { key: 'healthcare', color: '#ec4899', label: 'Healthcare' }
                    ].map(cat => (
                      <div key={cat.key} className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full border-2 border-white" 
                          style={{ backgroundColor: cat.color }}
                        ></div>
                        <span className="text-slate-400 text-sm">{cat.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-slate-300 font-medium text-sm">Status Indicators</h4>
                    {[
                      { key: 'pending', color: '#facc15', label: 'Pending Review' },
                      { key: 'verified', color: '#60a5fa', label: 'Verified' },
                      { key: 'in_progress', color: '#c084fc', label: 'In Progress' },
                      { key: 'resolved', color: '#4ade80', label: 'Resolved' },
                      { key: 'closed', color: '#9ca3af', label: 'Closed' }
                    ].map(status => (
                      <div key={status.key} className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full border-4" 
                          style={{ borderColor: status.color, backgroundColor: 'transparent' }}
                        ></div>
                        <span className="text-slate-400 text-sm">{status.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Live Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Total Issues</span>
                  <span className="font-bold text-white">{filteredIssues.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Critical</span>
                  <span className="font-bold text-red-400">
                    {filteredIssues.filter(i => i.priority === 'critical').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">In Progress</span>
                  <span className="font-bold text-purple-400">
                    {filteredIssues.filter(i => i.status === 'in_progress').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Resolved</span>
                  <span className="font-bold text-green-400">
                    {filteredIssues.filter(i => i.status === 'resolved').length}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Issues */}
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Recent Issues</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-slate-800 h-16 rounded"></div>
                  ))
                ) : (
                  filteredIssues.slice(0, 5).map(issue => (
                    <div key={issue.id} className="bg-slate-800 rounded p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: getCategoryColor(issue.category) }}
                        ></div>
                        <span className="text-white text-sm font-medium truncate">{issue.title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{issue.location}</span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Hotspots */}
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Issue Hotspots</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {['Delhi NCR', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad'].map((city, index) => (
                  <div key={city} className="flex items-center justify-between">
                    <span className="text-slate-300">{city}</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-16 h-2 bg-slate-700 rounded-full overflow-hidden`}>
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-red-500"
                          style={{ width: `${Math.random() * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-slate-400 text-sm">{Math.floor(Math.random() * 50) + 10}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
