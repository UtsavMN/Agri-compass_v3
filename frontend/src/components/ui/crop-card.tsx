import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './dialog';
import { ExternalLink, Youtube, FileText, Leaf, MapPin, DollarSign, Info } from 'lucide-react';
import { DetailedCropData } from '@/lib/ai/cropRecommender';

interface CropCardProps {
  crop: DetailedCropData;
  onViewDetails?: (crop: DetailedCropData) => void;
}

export const CropCard = React.memo(function CropCard({ crop, onViewDetails }: CropCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleViewDetails = () => {
    onViewDetails?.(crop);
    setIsOpen(true);
  };

  const youtubeLinks = crop.youtube_links ? crop.youtube_links.split(',').filter(link => link.trim()) : [];
  const articleLinks = crop.article_links ? crop.article_links.split(',').filter(link => link.trim()) : [];

  return (
    <>
      <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-lg">
              <Leaf className="h-5 w-5 mr-2 text-green-600" />
              {crop.crop}
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {crop.region}
            </Badge>
          </div>
          <CardDescription className="line-clamp-2">
            {crop.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="line-clamp-1">{crop.major_districts}</span>
            </div>

            <div className="flex items-center text-sm text-gray-600">
              <DollarSign className="h-4 w-4 mr-1" />
              <span className="line-clamp-1">{crop.economic_importance}</span>
            </div>

            <div className="flex gap-2">
              {youtubeLinks.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  <Youtube className="h-3 w-3 mr-1" />
                  {youtubeLinks.length} Video{youtubeLinks.length > 1 ? 's' : ''}
                </Badge>
              )}
              {articleLinks.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  <FileText className="h-3 w-3 mr-1" />
                  {articleLinks.length} Article{articleLinks.length > 1 ? 's' : ''}
                </Badge>
              )}
            </div>

            <Button
              onClick={handleViewDetails}
              className="w-full bg-green-600 hover:bg-green-700"
              size="sm"
            >
              <Info className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center text-2xl">
              <Leaf className="h-6 w-6 mr-2 text-green-600" />
              {crop.crop}
              <Badge variant="outline" className="ml-2">
                {crop.region}
              </Badge>
            </DialogTitle>
            <DialogDescription className="text-base">
              {crop.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* How to Grow Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Info className="h-5 w-5 mr-2 text-blue-600" />
                How to Grow
              </h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{crop.how_to_grow}</p>
              </div>
            </div>

            {/* Economic Importance */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                Economic Importance
              </h3>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-gray-700">{crop.economic_importance}</p>
              </div>
            </div>

            {/* Uses */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Uses</h3>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-gray-700">{crop.uses}</p>
              </div>
            </div>

            {/* Major Districts */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-orange-600" />
                Major Districts
              </h3>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-gray-700">{crop.major_districts}</p>
              </div>
            </div>

            {/* Links Section */}
            {(youtubeLinks.length > 0 || articleLinks.length > 0) && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Resources</h3>
                <div className="space-y-3">
                  {youtubeLinks.map((link, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                      <Youtube className="h-5 w-5 text-red-600 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">YouTube Tutorial {index + 1}</p>
                        <p className="text-xs text-gray-600 truncate">{link}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(link, '_blank')}
                        className="flex-shrink-0"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  {articleLinks.map((link, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Article {index + 1}</p>
                        <p className="text-xs text-gray-600 truncate">{link}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(link, '_blank')}
                        className="flex-shrink-0"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});
