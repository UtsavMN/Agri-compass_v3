import { useState, useRef, useEffect, useCallback } from 'react'
import { useUser, MOCK_USERS } from '@/store';
import { AIAPI } from '@/lib/api/ai'
import { FarmsAPI, Farm } from '@/lib/api/farms'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Send, RefreshCw, Sparkles, MessageSquare, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isTyping?: boolean
  error?: boolean
}

interface AIChatInterfaceProps {
  selectedFarmId?: string
  onFarmSelect?: (farmId: string) => void
}

export default function AIChatInterface({ selectedFarmId, onFarmSelect }: AIChatInterfaceProps) {
  const { user } = useUser()
  const { toast } = useToast()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [farms, setFarms] = useState<Farm[]>([])
  const [currentFarmId, setCurrentFarmId] = useState<string>(selectedFarmId || '')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const loadFarms = useCallback(async () => {
    try {
      const userFarms = await FarmsAPI.getFarms(user?.id || '')
      setFarms(userFarms)
    } catch (error) {
      console.error('Error loading farms:', error)
    }
  }, [user?.id])

  useEffect(() => {
    if (user) {
      loadFarms()
    }
  }, [user, loadFarms])

  useEffect(() => {
    if (selectedFarmId) {
      setCurrentFarmId(selectedFarmId)
    }
  }, [selectedFarmId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // `loadFarms` is defined above with useCallback; avoid redeclaration here.

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async () => {
    const trimmedInput = input.trim()
    if (!trimmedInput || isLoading || !user) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmedInput,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await AIAPI.sendChatMessage({
        user_id: user.id,
        message: trimmedInput,
        farm_id: currentFarmId || undefined
      })

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
        error: !response.success
      }

      setMessages(prev => [...prev, assistantMessage])

      if (!response.success) {
        toast({
          title: 'AI Response Error',
          description: 'The AI service encountered an issue. You can try again.',
          variant: 'destructive',
        })
      }

    } catch (error) {
      console.error('Chat error:', error)

      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting right now. Please try again in a moment.',
        timestamp: new Date(),
        error: true
      }

      setMessages(prev => [...prev, errorMessage])

      toast({
        title: 'Connection Error',
        description: 'Unable to connect to AI service. Please check your connection and try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const retryLastMessage = async () => {
    const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user')
    if (!lastUserMessage || isLoading) return

    // Remove error messages after the last user message
    const lastUserIndex = messages.lastIndexOf(lastUserMessage)
    const messagesToKeep = messages.slice(0, lastUserIndex + 1)
    setMessages(messagesToKeep)

    setIsLoading(true)

    try {
      const response = await AIAPI.sendChatMessage({
        user_id: user?.id || '',
        message: lastUserMessage.content,
        farm_id: currentFarmId || undefined
      })

      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
        error: !response.success
      }

      setMessages(prev => [...prev, assistantMessage])

    } catch (error) {
      console.error('Retry error:', error)
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, I\'m still having trouble connecting. Please try again later.',
        timestamp: new Date(),
        error: true
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleFarmChange = (farmId: string) => {
    const idToSet = farmId === 'general' ? '' : farmId
    setCurrentFarmId(idToSet)
    onFarmSelect?.(idToSet)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-green-600" />
            AI Assistant
          </CardTitle>

          {farms.length > 0 && (
            <Select value={currentFarmId || 'general'} onValueChange={handleFarmChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select farm context" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Advice</SelectItem>
                {farms.map((farm) => (
                  <SelectItem key={farm.id} value={farm.id}>
                    {farm.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
              <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Start a conversation</p>
              <p className="text-sm">Ask me about crops, weather, or farming advice</p>
              {currentFarmId && (
                <p className="text-xs mt-2 text-green-600">
                  💡 I'll consider your farm context in my responses
                </p>
              )}
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-green-600 text-white'
                        : message.error
                        ? 'bg-red-50 border border-red-200 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-70 mt-2">
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {/* Loading indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-gray-100 rounded-lg px-4 py-3 max-w-[80%]">
                <div className="flex items-center gap-2 text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">AI is thinking...</span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about crops, weather, or farming advice..."
              disabled={isLoading}
              className="flex-1"
            />

            <Button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>

            {/* Retry button for errors */}
            {messages.some(msg => msg.error) && !isLoading && (
              <Button
                onClick={retryLastMessage}
                variant="outline"
                size="icon"
                title="Retry last message"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>

          {currentFarmId && (
            <p className="text-xs text-gray-500 mt-2">
              💡 AI responses will consider your farm's context
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
