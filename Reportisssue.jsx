
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { MapPin, Camera, Upload, AlertTriangle, CheckCircle, ArrowRight, ArrowLeft, Send } from 'lucide-react';
import { Issue } from '@/entities/Issue';
import { UploadFile } from '@/integrations/Core';

export default function ReportIssue() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    location: '',
    latitude: '',
    longitude: '',
    image_url: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      handleInputChange('image_url', file_url);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
    setIsUploading(false);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          handleInputChange('latitude', position.coords.latitude.toString());
          handleInputChange('longitude', position.coords.longitude.toString());
          handleInputChange('location', `Acquired GPS: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Could not get location. Please enter it manually.');
        }
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await Issue.create({
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        upvotes: 0,
        comments_count: 0
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting issue:', error);
    }
    setIsSubmitting(false);
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <motion.div key={1} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-6">
            <CardHeader><CardTitle>Step 1: The Issue</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Issue Title*</Label>
                <Input value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} placeholder="e.g., Broken Streetlight" required className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400" />
              </div>
              <div className="space-y-2">
                <Label>Category*</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)} required>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white"><SelectValue placeholder="Select a category" /></SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600 text-white">
                    <SelectItem value="infrastructure" className="hover:bg-slate-700">Infrastructure</SelectItem>
                    <SelectItem value="environment" className="hover:bg-slate-700">Environment</SelectItem>
                    <SelectItem value="safety" className="hover:bg-slate-700">Safety</SelectItem>
                    <SelectItem value="utilities" className="hover:bg-slate-700">Utilities</SelectItem>
                    <SelectItem value="governance" className="hover:bg-slate-700">Governance</SelectItem>
                    <SelectItem value="transportation" className="hover:bg-slate-700">Transportation</SelectItem>
                    <SelectItem value="healthcare" className="hover:bg-slate-700">Healthcare</SelectItem>
                    <SelectItem value="other" className="hover:bg-slate-700">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </motion.div>
        );
      case 2:
        return (
          <motion.div key={2} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-6">
            <CardHeader><CardTitle>Step 2: Location & Evidence</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Location*</Label>
                <div className="flex gap-2">
                  <Input value={formData.location} onChange={(e) => handleInputChange('location', e.target.value)} placeholder="Enter address or cross-streets" required className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400" />
                  <Button type="button" variant="outline" onClick={getCurrentLocation} className="border-slate-600 text-slate-300 hover:bg-slate-800"><MapPin className="w-4 h-4" /></Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Photo Evidence</Label>
                <div className="flex items-center gap-4">
                  <Button asChild variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 cursor-pointer">
                     <label><Camera className="w-4 h-4 mr-2" /> Choose Photo <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" /></label>
                  </Button>
                  {isUploading && <span className="text-cyan-400">Uploading...</span>}
                  {formData.image_url && <span className="text-green-400 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Uploaded</span>}
                </div>
                {formData.image_url && <img src={formData.image_url} alt="Evidence" className="mt-2 w-full h-32 object-cover rounded-lg border border-slate-600" />}
              </div>
            </CardContent>
          </motion.div>
        );
      case 3:
        return (
          <motion.div key={3} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-6">
            <CardHeader><CardTitle>Step 3: Details & Priority</CardTitle></CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} placeholder="Provide more details..." className="h-32 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400" />
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600 text-white">
                    <SelectItem value="low" className="hover:bg-slate-700">Low</SelectItem>
                    <SelectItem value="medium" className="hover:bg-slate-700">Medium</SelectItem>
                    <SelectItem value="high" className="hover:bg-slate-700">High</SelectItem>
                    <SelectItem value="critical" className="hover:bg-slate-700">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </motion.div>
        );
      case 4:
        return (
          <motion.div key={4} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-6">
            <CardHeader><CardTitle>Step 4: Review & Submit</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-slate-300">
              {formData.image_url && <img src={formData.image_url} alt="Evidence" className="w-full h-32 object-cover rounded-lg border border-slate-600" />}
              <div><strong>Title:</strong> {formData.title}</div>
              <div><strong>Category:</strong> {formData.category}</div>
              <div><strong>Location:</strong> {formData.location}</div>
              <div><strong>Priority:</strong> {formData.priority}</div>
              <div><strong>Description:</strong> {formData.description || "N/A"}</div>
            </CardContent>
          </motion.div>
        );
      default: return null;
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6">
          <CheckCircle className="w-24 h-24 text-green-500 mx-auto" />
          <h2 className="text-3xl font-bold">Report Submitted!</h2>
          <p className="text-slate-400 text-lg">Thank you for helping improve your community.</p>
          <Button onClick={() => window.location.reload()}>Report Another Issue</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Report a Civic Issue</h1>
          <p className="text-slate-400">Your report makes a difference. Let's build a better community together.</p>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-slate-700 rounded-full h-2.5 mb-8">
            <motion.div 
                className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-2.5 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${(step / 4) * 100}%` }}
                transition={{ ease: "easeInOut", duration: 0.5 }}
            />
        </div>
        
        <Card className="bg-slate-900 border-slate-700 text-white">
            {renderStep()}
            <CardContent className="flex justify-between items-center pt-6">
              <Button variant="outline" onClick={prevStep} disabled={step === 1} className="border-slate-600 hover:bg-slate-800">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              {step < 4 ? (
                <Button onClick={nextStep} className="bg-cyan-600 hover:bg-cyan-700">
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700">
                  {isSubmitting ? 'Submitting...' : 'Submit Report'} <Send className="w-4 h-4 ml-2" />
                </Button>
              )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
