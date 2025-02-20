import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function getChatCompletion(message: string) {
  try {
    console.log('Requesting AI response...');
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: "You are ChatBox AI, a helpful and knowledgeable assistant. You provide clear, accurate, and engaging responses while maintaining a professional and friendly tone.",
        },
        {
          role: "model",
          parts: "I understand. I am ChatBox AI, and I'll provide helpful, clear, and professional responses to assist users with their questions and needs.",
        },
      ],
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();
    console.log('AI response received:', text);
    return text;
  } catch (error) {
    console.error('Gemini API Error:', error);
    return "I apologize, but I encountered an error. Please try again later.";
  }
}