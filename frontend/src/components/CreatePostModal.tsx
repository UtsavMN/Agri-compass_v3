import { useState, useEffect } from 'react'
import { useUser, MOCK_USERS } from '@/store';
import { PostsAPI } from '@/lib/api/posts'
import { FarmsAPI } from '@/lib/api/farms'
import { UploadAPI } from '@/lib/api/upload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { X, Upload, MapPin, Sprout } from 'lucide-react'
import { useDropzone } from 'react-dropzone'

interface CreatePostModalProps {
  isOpen: boolean
  onClose: () => void
  onPostCreated?: () => void
}

interface Farm {
  id: string
  name: string
  crop_type?: string
  location?: string
}

export default function CreatePostModal({ isOpen, onClose, onPostCreated }: CreatePostModalProps) {
  const { user } = useUser()
  const { toast } = useToast()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [cropTags, setCropTags] = useState<string[]>([])
  const [location, setLocation] = useState('')
  const [selectedFarmId, setSelectedFarmId] = useState('')
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [farms, setFarms] = useState<Farm[]>([])
  const [loadingFarms, setLoadingFarms] = useState(false)

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxFiles: 6,
    onDrop: (acceptedFiles: File[]) => {
      const newFiles = [...mediaFiles, ...acceptedFiles].slice(0, 6)
      setMediaFiles(newFiles)

      // Create preview URLs
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file))
      setPreviewUrls(newPreviewUrls)
    }
  })

  useEffect(() => {
    let isMounted = true;
    if (isOpen && user) {
      loadUserFarms(isMounted)
    }
    return () => { isMounted = false; }
  }, [isOpen, user])

  useEffect(() => {
    // Cleanup preview URLs on unmount
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url))
    }
  }, [previewUrls])

  const loadUserFarms = async (isMounted: boolean) => {
    if (!user) return

    setLoadingFarms(true)
    try {
      const data = await FarmsAPI.getFarms(user.id)
      if (isMounted) setFarms(data || [])
    } catch (error) {
      console.error('Error loading farms:', error)
    } finally {
      if (isMounted) setLoadingFarms(false)
    }
  }

  const handleCropTagAdd = (tag: string) => {
    if (tag && !cropTags.includes(tag)) {
      setCropTags([...cropTags, tag])
    }
  }

  const handleCropTagRemove = (tagToRemove: string) => {
    setCropTags(cropTags.filter(tag => tag !== tagToRemove))
  }

  const handleRemoveImage = (index: number) => {
    const newFiles = mediaFiles.filter((_, i) => i !== index)
    const newPreviewUrls = previewUrls.filter((_, i) => i !== index)
    setMediaFiles(newFiles)
    setPreviewUrls(newPreviewUrls)
  }

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast({
        title: 'Content required',
        description: 'Please write something for your post',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)
    try {
      // Upload images if any
      const imageUrls: string[] = []
      if (mediaFiles.length > 0) {
        toast({ title: 'Uploading images...' })
        const urls = await UploadAPI.uploadMultipleMedia(mediaFiles, 'posts')
        imageUrls.push(...urls)
      }

      // Create post
      await PostsAPI.createPost({
        user_id: user?.id || '',
        title: title.trim() || undefined,
        body: content,
        crop_tags: cropTags.length > 0 ? cropTags : undefined,
        location: location.trim() || undefined,
        images: imageUrls.length > 0 ? imageUrls : undefined,
        farm_id: selectedFarmId || undefined,
      })

      // Reset form
      previewUrls.forEach(url => URL.revokeObjectURL(url))
      setTitle('')
      setContent('')
      setCropTags([])
      setLocation('')
      setSelectedFarmId('')
      setMediaFiles([])
      setPreviewUrls([])

      onClose()
      onPostCreated?.()

      toast({
        title: 'Post created successfully!',
        description: 'Your post is now visible to the community'
      })
    } catch (error) {
      console.error('Error creating post:', error)
      const msg = (error as Record<string, unknown>)?.message as string ?? String(error)
      toast({
        title: 'Error creating post',
        description: msg || 'Please try again later',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFarmSelect = (farmId: string) => {
    setSelectedFarmId(farmId)
    const selectedFarm = farms.find(f => f.id === farmId)
    if (selectedFarm) {
      // Auto-fill crop tags and location from selected farm
      if (selectedFarm.crop_type && !cropTags.includes(selectedFarm.crop_type)) {
        setCropTags([...cropTags, selectedFarm.crop_type])
      }
      if (selectedFarm.location && !location) {
        setLocation(selectedFarm.location)
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <Input
              placeholder="Post title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Content */}
          <div>
            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] w-full"
              required
            />
          </div>

          {/* Farm Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Link to your farm (optional)</label>
            <Select value={selectedFarmId} onValueChange={handleFarmSelect} disabled={loadingFarms}>
              <SelectTrigger>
                <SelectValue placeholder={loadingFarms ? "Loading farms..." : "Select a farm"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No farm selected</SelectItem>
                {farms.map((farm) => (
                  <SelectItem key={farm.id} value={farm.id}>
                    {farm.name} {farm.crop_type && `(${farm.crop_type})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Crop Tags */}
          <div>
            <label className="text-sm font-medium mb-2 block">Related crops</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {cropTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                >
                  <Sprout className="h-3 w-3" />
                  {tag}
                  <button
                    onClick={() => handleCropTagRemove(tag)}
                    className="ml-1 hover:bg-green-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <Input
              placeholder="Add crop (press Enter)"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  const input = e.target as HTMLInputElement
                  handleCropTagAdd(input.value.trim())
                  input.value = ''
                }
              }}
            />
          </div>

          {/* Location */}
          <div>
            <label className="text-sm font-medium mb-2 block">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Where is this post about?"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="text-sm font-medium mb-2 block">Images (max 6)</label>
            <div
              {...getRootProps()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-green-400 hover:bg-green-50 transition-colors"
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-gray-400" />
                <p className="text-sm text-gray-600">
                  Drop images here or click to upload
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, JPEG, GIF up to 6 files
                </p>
              </div>
            </div>

            {/* Image Previews */}
            {previewUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-4">
                {previewUrls.map((url, index) => (
                  <div key={url} className="relative group">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading || !content.trim()}>
              {isLoading ? 'Creating...' : 'Create Post'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
