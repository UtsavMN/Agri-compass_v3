import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './card';
import { Badge } from './badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion';
import { CheckCircle, FileText, Phone, ExternalLink } from 'lucide-react';

export interface GovernmentScheme {
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
  caste_category?: string;
  land_holding?: string;
  gender?: string;
  subsidy_quantum?: string;
  portal_url?: string;
  coverage_type?: string;
  active_districts?: string;
}

interface SchemeCardProps {
  scheme: GovernmentScheme;
}

export const SchemeCard = React.memo(function SchemeCard({ scheme }: SchemeCardProps) {
  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Financial Support': 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      'Insurance': 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      'Organic Farming': 'bg-gold-primary/10 text-gold-primary border border-gold-primary/20',
      'Irrigation': 'bg-teal-500/10 text-teal-400 border border-teal-500/20',
      'Mechanization': 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
    };
    return colors[category] || 'bg-gold-primary/10 text-gold-primary border border-gold-primary/20';
  };

  return (
    <Card className="card-premium border-l-4 border-l-gold-primary hover:shadow-premium transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div className="flex-1">
            <CardTitle className="text-xl text-text-primary font-black mb-2 tracking-tight">
              {scheme.name}
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <Badge className={getCategoryColor(scheme.category)}>
                {scheme.category}
              </Badge>
              {scheme.state && (
                <Badge variant="outline" className="border-gold-primary/20 text-gold-primary/80 bg-gold-primary/5 text-[10px] font-black uppercase">
                  {scheme.state}
                </Badge>
              )}
              {scheme.subsidy_quantum && scheme.subsidy_quantum !== 'N/A' && (
                <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase">
                  {scheme.subsidy_quantum} Subsidy
                </Badge>
              )}
              {scheme.land_holding && scheme.land_holding !== 'All' && (
                <Badge variant="outline" className="border-border text-text-secondary text-[10px] font-black uppercase">
                  {scheme.land_holding}
                </Badge>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-row md:flex-col lg:flex-row gap-2 shrink-0 self-start">
            {scheme.portal_url && (
              <button
                onClick={() => window.open(scheme.portal_url, '_blank')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gold-primary hover:bg-gold-hover text-neutral-950 text-xs font-black uppercase tracking-wider rounded-lg transition-colors duration-200"
              >
                Apply Now
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
        <CardDescription className="mt-3 text-text-secondary text-sm leading-relaxed">
          {scheme.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0 border-t border-border/40">
        <Accordion type="single" collapsible className="w-full divide-y divide-border/40">
          {scheme.eligibility && (
            <AccordionItem value="eligibility" className="border-none">
              <AccordionTrigger className="text-xs font-black uppercase tracking-widest text-gold-primary hover:text-gold-hover py-3">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-emerald-400" />
                  Eligibility Criteria
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-xs text-text-secondary leading-relaxed pb-4">
                {scheme.eligibility}
              </AccordionContent>
            </AccordionItem>
          )}

          {scheme.benefits && (
            <AccordionItem value="benefits" className="border-none">
              <AccordionTrigger className="text-xs font-black uppercase tracking-widest text-gold-primary hover:text-gold-hover py-3">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-gold-primary" />
                  Scheme Benefits
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-xs text-text-secondary leading-relaxed pb-4">
                {scheme.benefits}
              </AccordionContent>
            </AccordionItem>
          )}

          {scheme.application_process && (
            <AccordionItem value="application" className="border-none">
              <AccordionTrigger className="text-xs font-black uppercase tracking-widest text-gold-primary hover:text-gold-hover py-3">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-amber-500" />
                  How to Apply
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-xs text-text-secondary leading-relaxed pb-4">
                {scheme.application_process}
              </AccordionContent>
            </AccordionItem>
          )}

          {scheme.contact_info && (
            <AccordionItem value="contact" className="border-none">
              <AccordionTrigger className="text-xs font-black uppercase tracking-widest text-gold-primary hover:text-gold-hover py-3">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-sky-400" />
                  Contact Information
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-xs text-text-secondary leading-relaxed pb-4">
                {scheme.contact_info}
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </CardContent>
    </Card>
  );
});
