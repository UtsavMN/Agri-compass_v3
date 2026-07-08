import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@/store';
import { FarmsAPI, WeatherLog } from '@/lib/api/farms'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { Cloud, Thermometer, Droplets, Calendar } from 'lucide-react'
import { format } from 'date-fns'

interface FarmWeatherModalProps {
  farmId: string
  farmName: string
  isOpen: boolean
  onClose: () => void
}

export default function FarmWeatherModal({ farmId, farmName, isOpen, onClose }: FarmWeatherModalProps) {
  const { user } = useUser()
  const { toast } = useToast()
  const [logs, setLogs] = useState<WeatherLog[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    notes: '',
    temperature: '',
    humidity: '',
    conditions: ''
  })

  // Stable callback for loading logs
  const loadWeatherLogs = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await FarmsAPI.getWeatherLogs(farmId)
      setLogs(data)
    } catch (error) {
      console.error('Error loading weather logs:', error)
      toast({
        title: 'Error loading logs',
        description: 'Failed to load weather logs',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [farmId, toast])

  useEffect(() => {
    if (isOpen && farmId) {
      loadWeatherLogs()
    }
  }, [isOpen, farmId, loadWeatherLogs])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      setIsSubmitting(true)
      await FarmsAPI.addWeatherLog(farmId, user.id, {
        notes: formData.notes,
        temperature: formData.temperature ? parseFloat(formData.temperature) : undefined,
        humidity: formData.humidity ? parseFloat(formData.humidity) : undefined,
        conditions: formData.conditions
      })

      toast({
        title: 'Weather log added!',
        description: 'Your weather observation has been recorded.',
      })

      setFormData({
        notes: '',
        temperature: '',
        humidity: '',
        conditions: ''
      })

      loadWeatherLogs()
    } catch (error) {
      console.error('Error adding weather log:', error)
      toast({
        title: 'Error adding log',
        description: 'Failed to add weather log',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-blue-600" />
            Weather Logs - {farmName}
          </DialogTitle>
          <DialogDescription>
            Record weather observations and track conditions for your farm
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New Log Form */}
          <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-gray-50">
            <h3 className="font-medium text-gray-900">Add Weather Observation</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="temperature">Temperature (°C)</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  placeholder="25.5"
                  value={formData.temperature}
                  onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="humidity">Humidity (%)</Label>
                <Input
                  id="humidity"
                  type="number"
                  step="0.1"
                  placeholder="65.0"
                  value={formData.humidity}
                  onChange={(e) => setFormData({ ...formData, humidity: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="conditions">Weather Conditions</Label>
              <Select
                value={formData.conditions}
                onValueChange={(value) => setFormData({ ...formData, conditions: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select conditions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sunny">Sunny</SelectItem>
                  <SelectItem value="Cloudy">Cloudy</SelectItem>
                  <SelectItem value="Rainy">Rainy</SelectItem>
                  <SelectItem value="Stormy">Stormy</SelectItem>
                  <SelectItem value="Foggy">Foggy</SelectItem>
                  <SelectItem value="Windy">Windy</SelectItem>
                  <SelectItem value="Dusty">Dusty</SelectItem>
                  <SelectItem value="Clear">Clear</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Describe the weather conditions, any observations..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                required
                rows={3}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting || !formData.notes.trim()}>
                {isSubmitting ? 'Adding...' : 'Add Log'}
              </Button>
            </div>
          </form>

          {/* Weather Logs List */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Recent Observations</h3>

            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin h-6 w-6 border-2 border-green-600 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading logs...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Cloud className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No weather logs yet</p>
                <p className="text-xs">Start recording observations to track weather patterns</p>
              </div>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div key={log.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(log.created_at), 'MMM d, yyyy h:mm a')}
                      </div>
                      {log.conditions && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {log.conditions}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      {log.temperature && (
                        <div className="flex items-center gap-2">
                          <Thermometer className="h-4 w-4 text-red-500" />
                          <span className="text-sm">{log.temperature}°C</span>
                        </div>
                      )}
                      {log.humidity && (
                        <div className="flex items-center gap-2">
                          <Droplets className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">{log.humidity}% humidity</span>
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-gray-800 whitespace-pre-wrap">
                      {log.notes}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
