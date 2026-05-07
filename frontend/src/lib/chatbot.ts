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
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('Gemini API key is not configured in .env');
      return 'AI Configuration Error: Please ensure VITE_GEMINI_API_KEY is properly set in the frontend .env file.';
    }

    const last = messages[messages.length - 1];
    const userMessage = last?.content ?? '';
    if (!userMessage) return 'Please provide a question or prompt.';

    const systemPrompt = "You are KrishiMitra, an agriculture expert for Karnataka farmers. Respond in simple English mixed with Kannada when appropriate. Keep responses under 6 lines and focus on practical advice.";

    try {
      const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\nUser Question: ${userMessage}` }]
            }
          ]
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API error payload:', errorText);
        throw new Error(`Gemini API error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'I am sorry, but I received an empty response from the AI.';
    } catch (error) {
      console.error('Frontend AI API error:', error);
      return 'I am currently offline or unable to reach the AI service. Please try again later.';
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
