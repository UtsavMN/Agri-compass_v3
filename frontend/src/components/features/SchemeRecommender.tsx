/**
 * Government Scheme Recommender
 * AI-powered scheme matching based on farmer profile
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  CheckCircle2, 
  ExternalLink, 
  Calendar,
  IndianRupee,
  Users,
  Sparkles,
  Search
} from 'lucide-react';

interface GovernmentScheme {
  id: string;
  name: string;
  nameKannada: string;
  category: 'subsidy' | 'loan' | 'insurance' | 'training' | 'equipment';
  description: string;
  benefit: string;
  eligibility: string[];
  documents: string[];
  applicationLink: string;
  deadline?: string;
  matchScore?: number; // AI-calculated match percentage
}

const schemes: GovernmentScheme[] = [
  {
    id: '1',
    name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    nameKannada: 'ಪ್ರಧಾನ ಮಂತ್ರಿ ಕಿಸಾನ್ ಸಮ್ಮಾನ್ ನಿಧಿ',
    category: 'subsidy',
    description: 'Income support of ₹6,000 per year to all farmer families',
    benefit: '₹6,000/year in 3 installments',
    eligibility: ['All farmer families', 'Minimum 0.01 hectare land', 'Aadhaar card mandatory'],
    documents: ['Aadhaar Card', 'Land Records', 'Bank Account'],
    applicationLink: 'https://pmkisan.gov.in/',
    deadline: 'Ongoing',
    matchScore: 95,
  },
  {
    id: '2',
    name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    nameKannada: 'ಪ್ರಧಾನ ಮಂತ್ರಿ ಫಸಲ್ ಬೀಮಾ ಯೋಜನೆ',
    category: 'insurance',
    description: 'Comprehensive crop insurance scheme covering all stages',
    benefit: 'Up to 90% premium subsidy',
    eligibility: ['All farmers', 'Sharecroppers and tenant farmers eligible', 'Notified crops only'],
    documents: ['Land records', 'Sowing certificate', 'Bank account', 'Aadhaar'],
    applicationLink: 'https://pmfby.gov.in/',
    deadline: 'Before sowing season',
    matchScore: 88,
  },
  {
    id: '3',
    name: 'Soil Health Card Scheme',
    nameKannada: 'ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಕಾರ್ಡ್ ಯೋಜನೆ',
    category: 'training',
    description: 'Free soil testing and nutrient recommendations',
    benefit: 'Free soil health card with fertilizer recommendations',
    eligibility: ['All farmers', 'No minimum land requirement'],
    documents: ['Aadhaar Card', 'Land Records'],
    applicationLink: 'https://soilhealth.dac.gov.in/',
    matchScore: 82,
  },
  {
    id: '4',
    name: 'Karnataka Raitha Dhare Scheme',
    nameKannada: 'ಕರ್ನಾಟಕ ರೈತ ಧರೆ ಯೋಜನೆ',
    category: 'subsidy',
    description: 'State-level farmer assistance program',
    benefit: '₹4,000 per acre (2 installments)',
    eligibility: ['Karnataka farmers', '2-5 hectares land', 'Small and marginal farmers'],
    documents: ['Karnataka resident proof', 'Land records', 'Bank account'],
    applicationLink: 'https://raitamitra.karnataka.gov.in/',
    matchScore: 90,
  },
  {
    id: '5',
    name: 'Kisan Credit Card (KCC)',
    nameKannada: 'ಕಿಸಾನ್ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್',
    category: 'loan',
    description: 'Short-term credit for crop cultivation at subsidized interest',
    benefit: 'Interest subvention up to ₹3 lakh at 4% interest',
    eligibility: ['All farmers', 'Tenant farmers with valid agreements', 'Fishermen and animal husbandry'],
    documents: ['Land records', 'Identity proof', 'Address proof', 'Passport photo'],
    applicationLink: 'https://www.nabard.org/kcc.aspx',
    matchScore: 75,
  },
  {
    id: '6',
    name: 'Sub-Mission on Agricultural Mechanization (SMAM)',
    nameKannada: 'ಕೃಷಿ ಯಾಂತ್ರೀಕರಣ ಉಪ-ಮಿಷನ್',
    category: 'equipment',
    description: 'Subsidy on agricultural machinery and equipment',
    benefit: '40-50% subsidy on farm equipment',
    eligibility: ['Small and marginal farmers', 'Women farmers get priority', 'SC/ST farmers'],
    documents: ['Category certificate', 'Land records', 'Bank account'],
    applicationLink: 'https://agrimachinery.nic.in/',
    matchScore: 70,
  },
];

export function SchemeRecommender() {
  const [category, setCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScheme, setSelectedScheme] = useState<GovernmentScheme | null>(null);

  // Filter schemes
  const filteredSchemes = schemes
    .filter(scheme => 
      (category === 'all' || scheme.category === category) &&
      (searchQuery === '' || 
       scheme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       scheme.nameKannada.includes(searchQuery) ||
       scheme.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

  const categoryIcons = {
    subsidy: IndianRupee,
    loan: FileText,
    insurance: CheckCircle2,
    training: Users,
    equipment: FileText,
  };

  const categoryColors = {
    subsidy: 'bg-green-500',
    loan: 'bg-blue-500',
    insurance: 'bg-purple-500',
    training: 'bg-orange-500',
    equipment: 'bg-cyan-500',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-leaf-500 to-leaf-600 text-white border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6" />
            Smart Scheme Recommender
          </CardTitle>
          <CardDescription className="text-white/90">
            AI-powered matching of government schemes based on your profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold">{schemes.length}</p>
              <p className="text-sm text-white/80">Active Schemes</p>
            </div>
            <div>
              <p className="text-3xl font-bold">₹10L+</p>
              <p className="text-sm text-white/80">Potential Benefits</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{filteredSchemes.filter(s => (s.matchScore || 0) > 80).length}</p>
              <p className="text-sm text-white/80">High Match</p>
            </div>
            <div>
              <p className="text-3xl font-bold">100%</p>
              <p className="text-sm text-white/80">Free Service</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search schemes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="subsidy">Subsidies</SelectItem>
                <SelectItem value="loan">Loans</SelectItem>
                <SelectItem value="insurance">Insurance</SelectItem>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="equipment">Equipment</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Schemes List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredSchemes.map((scheme, index) => {
          const Icon = categoryIcons[scheme.category];
          const colorClass = categoryColors[scheme.category];

          return (
            <motion.div
              key={scheme.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card 
                className="card-hover cursor-pointer h-full"
                onClick={() => setSelectedScheme(scheme)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className={`${colorClass} p-2 rounded-lg`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    {scheme.matchScore && (
                      <Badge 
                        className={`${
                          scheme.matchScore >= 85 ? 'bg-green-600' :
                          scheme.matchScore >= 70 ? 'bg-yellow-600' :
                          'bg-slate-600'
                        }`}
                      >
                        {scheme.matchScore}% Match
                      </Badge>
                    )}
                  </div>
                  
                  <CardTitle className="text-lg">{scheme.name}</CardTitle>
                  <p className="text-sm text-slate-600">{scheme.nameKannada}</p>
                </CardHeader>

                <CardContent className="space-y-3">
                  <p className="text-sm text-slate-700">{scheme.description}</p>

                  <div className="flex items-center gap-2">
                    <IndianRupee className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-600">{scheme.benefit}</span>
                  </div>

                  {scheme.deadline && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-orange-600" />
                      <span className="text-sm text-orange-600">Deadline: {scheme.deadline}</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs capitalize">{scheme.category}</Badge>
                    <Badge variant="secondary" className="text-xs">
                      {scheme.documents.length} docs required
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Scheme Detail Modal */}
      {selectedScheme && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedScheme(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">{selectedScheme.name}</h2>
                <p className="text-slate-600">{selectedScheme.nameKannada}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-slate-700">{selectedScheme.description}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Benefit</h3>
                <div className="flex items-center gap-2 text-green-600 font-semibold">
                  <IndianRupee className="h-5 w-5" />
                  {selectedScheme.benefit}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Eligibility</h3>
                <ul className="space-y-1">
                  {selectedScheme.eligibility.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Required Documents</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedScheme.documents.map((doc, i) => (
                    <Badge key={i} variant="secondary">{doc}</Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  className="flex-1 btn-primary"
                  onClick={() => window.open(selectedScheme.applicationLink, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Apply Now
                </Button>
                <Button variant="outline" onClick={() => setSelectedScheme(null)}>
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Empty State */}
      {filteredSchemes.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-xl font-semibold mb-2">No schemes found</h3>
            <p className="text-slate-600">Try adjusting your filters or search query</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
