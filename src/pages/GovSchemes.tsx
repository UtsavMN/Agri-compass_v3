import { useState, useEffect } from 'react';
import { apiGet } from '@/lib/httpClient';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { FileText, Search, Phone, CheckCircle } from 'lucide-react';

interface GovernmentScheme {
  id: string;
  name: string;
  description: string;
  eligibility: string | null;
  benefits: string | null;
  application_process: string | null;
  contact_info: string | null;
  state: string | null;
  category: string;
  active: boolean;
}

export default function GovSchemes() {
  const { toast } = useToast();
  const [schemes, setSchemes] = useState<GovernmentScheme[]>([]);
  const [filteredSchemes, setFilteredSchemes] = useState<GovernmentScheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadSchemes();
  }, []);

  useEffect(() => {
    filterSchemes();
  }, [searchTerm, schemes]);

  const loadSchemes = async () => {
    try {
      const data = await apiGet('/api/schemes');
      setSchemes(data || []);
    } catch (error) {
      const err = error as { message?: string };
      toast({
        title: 'Error loading schemes',
        description: err.message ?? 'Failed to load schemes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterSchemes = () => {
    if (!searchTerm) {
      setFilteredSchemes(schemes);
      return;
    }

    const filtered = schemes.filter(
      (scheme) =>
        scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scheme.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scheme.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredSchemes(filtered);
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Financial Support': 'bg-green-100 text-green-800',
      'Insurance': 'bg-blue-100 text-blue-800',
      'Credit': 'bg-purple-100 text-purple-800',
      'Marketing': 'bg-orange-100 text-orange-800',
      'Organic Farming': 'bg-emerald-100 text-emerald-800',
      'Sustainability': 'bg-teal-100 text-teal-800',
      'Energy': 'bg-yellow-100 text-yellow-800',
      'Soil Management': 'bg-earth-100 text-earth-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Government Schemes
          </h1>
          <p className="text-gray-600 mt-2">
            Explore various government schemes and subsidies available for farmers
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search schemes by name, category, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading government schemes...</p>
          </div>
        ) : filteredSchemes.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No schemes found</h3>
              <p className="text-gray-600">Try adjusting your search term</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredSchemes.map((scheme) => (
              <Card key={scheme.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-xl text-green-700 mb-2">
                        {scheme.name}
                      </CardTitle>
                      <div className="flex flex-wrap gap-2">
                        <Badge className={getCategoryColor(scheme.category)}>
                          {scheme.category}
                        </Badge>
                        {scheme.state && (
                          <Badge variant="outline">{scheme.state}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <CardDescription className="mt-3 text-base">
                    {scheme.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible>
                    {scheme.eligibility && (
                      <AccordionItem value="eligibility">
                        <AccordionTrigger className="text-sm font-semibold">
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                            Eligibility Criteria
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-700">
                          {scheme.eligibility}
                        </AccordionContent>
                      </AccordionItem>
                    )}

                    {scheme.benefits && (
                      <AccordionItem value="benefits">
                        <AccordionTrigger className="text-sm font-semibold">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-blue-600" />
                            Benefits
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-700">
                          {scheme.benefits}
                        </AccordionContent>
                      </AccordionItem>
                    )}

                    {scheme.application_process && (
                      <AccordionItem value="application">
                        <AccordionTrigger className="text-sm font-semibold">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-purple-600" />
                            How to Apply
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-700">
                          {scheme.application_process}
                        </AccordionContent>
                      </AccordionItem>
                    )}

                    {scheme.contact_info && (
                      <AccordionItem value="contact">
                        <AccordionTrigger className="text-sm font-semibold">
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-orange-600" />
                            Contact Information
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-700">
                          {scheme.contact_info}
                        </AccordionContent>
                      </AccordionItem>
                    )}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
