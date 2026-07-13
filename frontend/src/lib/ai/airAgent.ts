import type { ChatMessage } from '../chatbot';
import { chatWithAI } from '../chatbot';

export type { ChatMessage };

export class AirAgent {
  private systemPrompt = `You are KrishiMitra — an agriculture expert for Karnataka farmers.
Respond in simple English mixed with Kannada when needed. Keep responses under 6 lines and focus on practical advice.
You have knowledge about Karnataka's districts, crops, weather patterns, and farming practices.
Always provide actionable, farmer-friendly advice. Use district-specific information when available.`;

  async sendMessage(messages: ChatMessage[], district?: string): Promise<string> {
    try {
      const systemContext = this.systemPrompt + (district ? ` Current district context: ${district}` : '');
      
      // Build conversation context from recent messages (last 10)
      const recentMessages = messages.slice(-10);
      const conversationContext = recentMessages
        .map(m => `${m.role === 'user' ? 'Farmer' : 'KrishiMitra'}: ${m.content}`)
        .join('\n');
      
      const contextualizedMessage = `${systemContext}\n\nConversation so far:\n${conversationContext}\n\nRespond to the farmer's latest message above. Keep context from the conversation.`;
      
      return await chatWithAI(contextualizedMessage);
    } catch (error) {
      console.error('Chat API error:', error);
      return 'ಕ್ಷಮಿಸಿ, ಸದ್ಯಕ್ಕೆ ಸೇವೆ ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ನಂತರ ಪ್ರಯತ್ನಿಸಿ.';
    }
  }

  async getCropAdvice(cropName: string, district: string): Promise<string> {
    const prompt = `Give practical farming advice for ${cropName} in ${district}, Karnataka. Include watering, pest control, and harvesting tips.`;
    return this.sendMessage([{ role: 'user', content: prompt }], district);
  }

  async getWeatherAdvice(weatherData: Record<string, unknown>, district: string): Promise<string> {
    const prompt = `Based on this weather: ${JSON.stringify(weatherData)}, give farming advice for ${district}.`;
    return this.sendMessage([{ role: 'user', content: prompt }], district);
  }
}

export const airAgent = new AirAgent();
