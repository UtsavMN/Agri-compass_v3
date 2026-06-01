import { callGemini } from './geminiClient';

export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export interface ChatbotProvider {
  name: string;
  sendMessage(messages: ChatMessage[]): Promise<string>;
}

class GeminiChatbotProvider implements ChatbotProvider {
  name = 'gemini-native';

  async sendMessage(messages: ChatMessage[]): Promise<string> {
    const last = messages[messages.length - 1];
    const userMessage = last?.content ?? '';
    if (!userMessage) return 'Please provide a question or prompt.';

    try {
      const history = messages.slice(0, -1).map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }));

      return await callGemini(userMessage, undefined, history);
    } catch (error: any) {
      console.error('Gemini Chatbot error:', error);
      return error.message || 'I am currently offline or unable to reach the AI service. Please try again later.';
    }
  }
}

class ChatbotService {
  private provider: ChatbotProvider;

  constructor() {
    this.provider = new GeminiChatbotProvider();
  }

  async chatWithAI(message: string): Promise<string> {
    return this.provider.sendMessage([{ role: 'user', content: message }]);
  }

  getChatbotProvider(): ChatbotProvider {
    return this.provider;
  }
}

const chatbotService = new ChatbotService();
export const chatWithAI = chatbotService.chatWithAI.bind(chatbotService);
export const getChatbotProvider = chatbotService.getChatbotProvider.bind(chatbotService);
