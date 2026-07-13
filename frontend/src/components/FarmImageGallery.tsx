import { useState, useRef } from 'react'
import { useUser } from '@/store';
import { FarmsAPI, FarmImage } from '@/lib/api/farms'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { Camera, Upload, ImageIcon } from 'lucide-react'
import { format } from 'date-fns'

interface FarmImageGalleryProps {
  farmId: string
  farmName: string
  images: FarmImage[]
  onImagesUpdate: (images: FarmImage[]) => void
  isOpen: boolean
  onClose: () => void
}

export default function FarmImageGallery({
  farmId,
  farmName,
  images,
  onImagesUpdate,
  isOpen,
  onClose
}: FarmImageGalleryProps) {
  const { user } = useUser()
  const { toast } = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<FarmImage | null>(null)
  const [caption, setCaption] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file',
        variant: 'destructive',
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 5MB',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsUploading(true)
      const uploadedImage = await FarmsAPI.uploadFarmImage(farmId, user.id, file, caption || undefined)

      toast({
        title: 'Image uploaded!',
        description: 'Your farm image has been uploaded successfully.',
      })

      onImagesUpdate([...images, uploadedImage])
      setCaption('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast({
        title: 'Upload failed',
        description: 'Failed to upload image. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleImageClick = (image: FarmImage) => {
    setSelectedImage(image)
  }

  const closeImageModal = () => {
    setSelectedImage(null)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-green-600" />
              Farm Gallery - {farmName}
            </DialogTitle>
            <DialogDescription>
              Upload and manage images of your farm
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Upload Section */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
              <div className="text-center">
                <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Farm Images</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Share photos of your crops, equipment, or farm activities
                </p>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="caption">Caption (optional)</Label>
                    <Textarea
                      id="caption"
                      placeholder="Describe this image..."
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      rows={2}
                    />
                  </div>

                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload">
                      <Button
                        type="button"
                        variant="outline"
                        className="cursor-pointer"
                        disabled={isUploading}
                        asChild
                      >
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          {isUploading ? 'Uploading...' : 'Choose Image'}
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Images Grid */}
            {images.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No images yet</h3>
                <p className="text-sm">Upload your first farm image to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="relative group cursor-pointer overflow-hidden rounded-lg border"
                    onClick={() => handleImageClick(image)}
                  >
                    <img
                      src={image.image_url}
                      alt={image.caption || 'Farm image'}
                      className="w-full h-32 object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 text-white text-center p-2">
                        <p className="text-xs">
                          {format(new Date(image.created_at), 'MMM d, yyyy')}
                        </p>
                        {image.caption && (
                          <p className="text-xs mt-1 line-clamp-2">{image.caption}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Detail Modal */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={closeImageModal}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Farm Image</DialogTitle>
              <DialogDescription>
                {format(new Date(selectedImage.created_at), 'MMMM d, yyyy')}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <img
                src={selectedImage.image_url}
                alt={selectedImage.caption || 'Farm image'}
                className="w-full max-h-96 object-contain rounded-lg"
              />

              {selectedImage.caption && (
                <p className="text-sm text-gray-700">{selectedImage.caption}</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
