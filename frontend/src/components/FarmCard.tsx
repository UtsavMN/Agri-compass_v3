import { useState } from 'react'
import { useUser } from '@/store';
import { FarmsAPI, Farm, FarmImage } from '@/lib/api/farms'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import FarmWeatherModal from './FarmWeatherModal'
import FarmImageGallery from './FarmImageGallery'
import {
  Sprout,
  MapPin,
  Ruler,
  Droplet,
  Trash2,
  MoreVertical,
  Cloud,
  Camera,
  Share2,
  Calendar,
  CheckCircle
} from 'lucide-react'
import { motion } from 'framer-motion'
import { differenceInDays } from 'date-fns'

interface FarmCardProps {
  farm: Farm
  onDelete: (farmId: string) => void
  onUpdate: () => void
}

export default function FarmCard({ farm, onDelete, onUpdate }: FarmCardProps) {
  const { user } = useUser()
  const { toast } = useToast()
  const [weatherModalOpen, setWeatherModalOpen] = useState(false)
  const [imageGalleryOpen, setImageGalleryOpen] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [shareContent, setShareContent] = useState('')
  const [isSharing, setIsSharing] = useState(false)
  const [images, setImages] = useState<FarmImage[]>([])

  const duration = differenceInDays(new Date(), new Date(farm.created_at))
  const durationText = duration < 30
    ? `${duration} days`
    : duration < 365
    ? `${Math.floor(duration / 30)} months`
    : `${Math.floor(duration / 365)} years`

  const currentMonth = new Date().getMonth() + 1
  const nextSteps = getNextSteps(currentMonth)

  const handleShare = async () => {
    if (!shareContent.trim() || !user) return

    try {
      setIsSharing(true)
      await FarmsAPI.shareToCommunity(farm.id, user.id, shareContent)

      toast({
        title: 'Shared to community!',
        description: 'Your farm update has been posted to the community feed.',
      })

      setShareModalOpen(false)
      setShareContent('')
    } catch (error) {
      console.error('Error sharing to community:', error)
      toast({
        title: 'Share failed',
        description: 'Failed to share your update. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSharing(false)
    }
  }

  const handleImagesUpdate = (updatedImages: FarmImage[]) => {
    setImages(updatedImages)
    onUpdate()
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="hover:shadow-lg transition-shadow duration-300 border-green-100">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl text-green-700 flex items-center gap-2">
                  <Sprout className="h-5 w-5" />
                  {farm.name}
                </CardTitle>
                <CardDescription className="flex items-center mt-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  {farm.location}
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  {durationText} old
                </Badge>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setWeatherModalOpen(true)}>
                      <Cloud className="mr-2 h-4 w-4" />
                      Weather Logs
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setImageGalleryOpen(true)}>
                      <Camera className="mr-2 h-4 w-4" />
                      Farm Gallery
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShareModalOpen(true)}>
                      <Share2 className="mr-2 h-4 w-4" />
                      Share to Community
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(farm.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Farm
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Farm Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center text-sm">
                <Ruler className="h-4 w-4 mr-2 text-green-600" />
                <span className="font-medium">{farm.area_acres} acres</span>
              </div>
              {farm.soil_type && (
                <div className="flex items-center text-sm text-gray-600">
                  <Sprout className="h-4 w-4 mr-2 text-green-600" />
                  <span>{farm.soil_type} soil</span>
                </div>
              )}
              {farm.irrigation_type && (
                <div className="flex items-center text-sm text-gray-600">
                  <Droplet className="h-4 w-4 mr-2 text-blue-600" />
                  <span>{farm.irrigation_type}</span>
                </div>
              )}
              <div className="flex items-center text-sm text-gray-600">
                <Camera className="h-4 w-4 mr-2 text-purple-600" />
                <span>{farm.images?.length || 0} photos</span>
              </div>
            </div>

            {/* Next Steps */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                Next Steps for {new Date().toLocaleString('default', { month: 'long' })}
              </h4>
              <ul className="space-y-1">
                {nextSteps.slice(0, 3).map((step, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>

            {/* Weather Summary */}
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-blue-700">
                  <Cloud className="h-4 w-4 mr-2" />
                  Weather Notes
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setWeatherModalOpen(true)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  View Logs
                </Button>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                Track weather conditions and observations for your farm
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Modals */}
      <FarmWeatherModal
        farmId={farm.id}
        farmName={farm.name}
        isOpen={weatherModalOpen}
        onClose={() => setWeatherModalOpen(false)}
      />

      <FarmImageGallery
        farmId={farm.id}
        farmName={farm.name}
        images={images}
        onImagesUpdate={handleImagesUpdate}
        isOpen={imageGalleryOpen}
        onClose={() => setImageGalleryOpen(false)}
      />

      {/* Share Modal */}
      {shareModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Share Farm Update</h3>
            <Textarea
              placeholder="Share what's happening on your farm..."
              value={shareContent}
              onChange={(e) => setShareContent(e.target.value)}
              rows={4}
              className="mb-4"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShareModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleShare} disabled={isSharing || !shareContent.trim()}>
                {isSharing ? 'Sharing...' : 'Share'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Helper function to get next steps based on current month
function getNextSteps(month: number): string[] {
  const steps: { [key: number]: string[] } = {
    1: ['Prepare soil for winter crops', 'Check irrigation systems', 'Plan crop rotation'],
    2: ['Plant winter vegetables', 'Monitor soil temperature', 'Prepare greenhouse if needed'],
    3: ['Harvest winter crops', 'Prepare for spring planting', 'Test soil pH levels'],
    4: ['Plant spring crops', 'Implement pest control', 'Monitor rainfall patterns'],
    5: ['Irrigate regularly', 'Watch for fungal diseases', 'Prepare for summer heat'],
    6: ['Harvest summer crops', 'Conserve water', 'Plan monsoon preparations'],
    7: ['Protect crops from heavy rain', 'Monitor drainage', 'Control fungal growth'],
    8: ['Harvest monsoon crops', 'Prepare for autumn', 'Check equipment maintenance'],
    9: ['Plant autumn crops', 'Monitor weather changes', 'Prepare soil for winter'],
    10: ['Harvest autumn crops', 'Clear fields', 'Plan winter crop rotation'],
    11: ['Plant winter crops', 'Install frost protection', 'Monitor temperature drops'],
    12: ['Protect from cold weather', 'Harvest remaining crops', 'Plan for next year']
  }

  return steps[month] || ['General farm maintenance and planning']
}
