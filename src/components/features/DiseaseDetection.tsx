/**
 * Crop Disease Detection (AI Placeholder)
 * Ready for future ML model integration
 */

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Camera,
  Upload,
  Image as ImageIcon,
  AlertTriangle,
  CheckCircle2,
  Info,
  Sparkles,
  X
} from 'lucide-react';

interface DetectionResult {
  disease: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  treatment: string[];
  prevention: string[];
}

// Mock disease database (replace with actual AI model)
const mockDiseases: DetectionResult[] = [
  {
    disease: 'Leaf Blight',
    confidence: 87,
    severity: 'high',
    treatment: [
      'Remove and destroy infected leaves',
      'Apply copper-based fungicide',
      'Ensure proper drainage',
      'Apply neem oil spray'
    ],
    prevention: [
      'Avoid overhead irrigation',
      'Maintain proper spacing',
      'Use disease-resistant varieties',
      'Practice crop rotation'
    ]
  },
  {
    disease: 'Powdery Mildew',
    confidence: 82,
    severity: 'medium',
    treatment: [
      'Apply sulfur-based fungicide',
      'Improve air circulation',
      'Remove infected parts'
    ],
    prevention: [
      'Avoid water stress',
      'Plant in full sun',
      'Regular monitoring'
    ]
  }
];

export function DiseaseDetection() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock AI analysis (replace with actual API call)
  const analyzeImage = async () => {
    setIsAnalyzing(true);
    setResult(null);

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock result (replace with actual AI model prediction)
    const mockResult = mockDiseases[Math.floor(Math.random() * mockDiseases.length)];
    setResult(mockResult);
    setIsAnalyzing(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setResult(null);
    setIsAnalyzing(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const severityColors = {
    low: 'text-green-600 bg-green-100',
    medium: 'text-yellow-600 bg-yellow-100',
    high: 'text-red-600 bg-red-100',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-leaf-600 to-leaf-700 text-white border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6" />
            AI Crop Disease Detection
          </CardTitle>
          <CardDescription className="text-white/90">
            Upload a photo of your crop to detect diseases using AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">50+</p>
              <p className="text-sm text-white/80">Diseases</p>
            </div>
            <div>
              <p className="text-2xl font-bold">85%</p>
              <p className="text-sm text-white/80">Accuracy</p>
            </div>
            <div>
              <p className="text-2xl font-bold">&lt; 5s</p>
              <p className="text-sm text-white/80">Detection</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          {!selectedImage ? (
            <div className="space-y-4">
              <div 
                className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-purple-500 hover:bg-purple-50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-16 w-16 mx-auto mb-4 text-slate-400" />
                <h3 className="text-lg font-semibold mb-2">Upload Crop Image</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Click to browse or drag and drop an image
                </p>
                <p className="text-xs text-slate-500">
                  Supports: JPG, PNG (Max 5MB)
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Choose from Gallery
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    // Mobile camera access
                    if (fileInputRef.current) {
                      fileInputRef.current.setAttribute('capture', 'environment');
                      fileInputRef.current.click();
                    }
                  }}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Take Photo
                </Button>
              </div>

              {/* Sample Images */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Tips:</strong> Take clear photos in good lighting. Focus on diseased areas.
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Image Preview */}
              <div className="relative rounded-xl overflow-hidden bg-slate-100">
                <img
                  src={selectedImage}
                  alt="Uploaded crop"
                  className="w-full max-h-96 object-contain"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-4 right-4"
                  onClick={handleReset}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Analyze Button */}
              {!result && !isAnalyzing && (
                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700 text-lg py-6"
                  onClick={analyzeImage}
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Analyze with AI
                </Button>
              )}

              {/* Analyzing State */}
              {isAnalyzing && (
                <div className="text-center py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="inline-block mb-4"
                  >
                    <Sparkles className="h-12 w-12 text-purple-600" />
                  </motion.div>
                  <p className="text-lg font-semibold text-slate-900 mb-1">Analyzing Image...</p>
                  <p className="text-sm text-slate-600">AI is detecting diseases</p>
                </div>
              )}

              {/* Results */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    {/* Detection Result */}
                    <Card className="bg-gradient-to-br from-leaf-50 to-leaf-100 border-leaf-200">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-2xl font-bold text-purple-900 mb-1">
                              {result.disease}
                            </h3>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-purple-600">
                                {result.confidence}% Confidence
                              </Badge>
                              <Badge className={severityColors[result.severity]}>
                                {result.severity.toUpperCase()} Severity
                              </Badge>
                            </div>
                          </div>
                          {result.severity === 'high' ? (
                            <AlertTriangle className="h-12 w-12 text-red-500" />
                          ) : (
                            <CheckCircle2 className="h-12 w-12 text-green-500" />
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Treatment */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          Recommended Treatment
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {result.treatment.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 mt-0.5 font-semibold">
                                {i + 1}
                              </span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    {/* Prevention */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Info className="h-5 w-5 text-blue-600" />
                          Prevention Tips
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {result.prevention.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={handleReset}
                      >
                        Analyze Another
                      </Button>
                      <Button className="flex-1 bg-green-600 hover:bg-green-700">
                        Consult Expert
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* How it Works */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
                <Upload className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-semibold mb-1">1. Upload Image</h4>
              <p className="text-sm text-slate-600">Take or upload a photo of affected crop</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-semibold mb-1">2. AI Analysis</h4>
              <p className="text-sm text-slate-600">Our AI detects diseases in seconds</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-semibold mb-1">3. Get Treatment</h4>
              <p className="text-sm text-slate-600">Receive actionable treatment plan</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon Notice */}
      <Alert className="bg-yellow-50 border-yellow-200">
        <Info className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          <strong>Beta Feature:</strong> This is a demonstration. Full AI model integration coming soon.
          Current results are for illustration purposes.
        </AlertDescription>
      </Alert>
    </div>
  );
}
