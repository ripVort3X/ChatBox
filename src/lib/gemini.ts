import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Define supported languages
export const SUPPORTED_LANGUAGES = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  pt: 'Português',
  ru: 'Русский',
  zh: '中文',
  ja: '日本語',
  ko: '한국어',
  ar: 'العربية',
  hi: 'हिन्दी'
} as const;

export type Language = keyof typeof SUPPORTED_LANGUAGES;

// System prompt templates for different languages
const SYSTEM_PROMPTS: Record<Language, string> = {
  en: "You are ChatBox AI, a helpful and knowledgeable assistant. You provide clear, accurate, and engaging responses while maintaining a professional and friendly tone. Always respond in English.",
  es: "Eres ChatBox AI, un asistente útil y conocedor. Proporcionas respuestas claras, precisas y atractivas mientras mantienes un tono profesional y amigable. Siempre responde en español.",
  fr: "Vous êtes ChatBox AI, un assistant utile et compétent. Vous fournissez des réponses claires, précises et engageantes tout en maintenant un ton professionnel et amical. Répondez toujours en français.",
  de: "Sie sind ChatBox AI, ein hilfreicher und kenntnisreicher Assistent. Sie liefern klare, genaue und ansprechende Antworten und behalten dabei einen professionellen und freundlichen Ton bei. Antworten Sie immer auf Deutsch.",
  it: "Sei ChatBox AI, un assistente utile e competente. Fornisci risposte chiare, accurate e coinvolgenti mantenendo un tono professionale e amichevole. Rispondi sempre in italiano.",
  pt: "Você é o ChatBox AI, um assistente prestativo e conhecedor. Você fornece respostas claras, precisas e envolventes, mantendo um tom profissional e amigável. Responda sempre em português.",
  ru: "Вы ChatBox AI, полезный и знающий ассистент. Вы предоставляете четкие, точные и интересные ответы, сохраняя профессиональный и дружелюбный тон. Всегда отвечайте на русском языке.",
  zh: "你是 ChatBox AI，一位乐于助人且知识渊博的助手。你提供清晰、准确和引人入胜的回答，同时保持专业和友好的语气。始终用中文回答。",
  ja: "あなたは ChatBox AI という役立つ知識豊富なアシスタントです。専門的でフレンドリーな口調を保ちながら、明確で正確で魅力的な回答を提供します。常に日本語で回答してください。",
  ko: "당신은 ChatBox AI, 도움이 되고 지식이 풍부한 어시스턴트입니다. 전문적이고 친근한 어조를 유지하면서 명확하고 정확하며 매력적인 응답을 제공합니다. 항상 한국어로 응답하십시오.",
  ar: "أنت ChatBox AI، مساعد مفيد وعليم. تقدم إجابات واضحة ودقيقة وجذابة مع الحفاظ على نبرة احترافية وودية. أجب دائمًا باللغة العربية.",
  hi: "आप ChatBox AI हैं, एक मददगार और जानकार सहायक। आप एक पेशेवर और मैत्रीपूर्ण स्वर बनाए रखते हुए स्पष्ट, सटीक और आकर्षक प्रतिक्रियाएं प्रदान करते हैं। हमेशा हिंदी में उत्तर दें।"
};

// Initialize chat with safety settings
const initializeChat = (language: Language = 'en') => {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-pro",
    safetySettings: [
      {
        category: HarmCategory.HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ],
  });

  return model.startChat({
    history: [
      {
        role: "user",
<<<<<<< HEAD
        parts: SYSTEM_PROMPTS[language],
      },
      {
        role: "model",
        parts: "Understood. I am ChatBox AI, and I will communicate in the specified language while maintaining a helpful and professional tone.",
=======
        parts: `${SYSTEM_PROMPTS[language]} Additionally, regardless of the language in which users write to you, ALWAYS respond in ${SUPPORTED_LANGUAGES[language]}. If the user's message is in a different language, first understand it, then formulate your response in ${SUPPORTED_LANGUAGES[language]}.`,
      },
      {
        role: "model",
        parts: `Understood. I am ChatBox AI, and I will always communicate in ${SUPPORTED_LANGUAGES[language]}, regardless of the input language.`,
>>>>>>> 8b535ae (Update 3)
      },
    ],
    generationConfig: {
      maxOutputTokens: 2000,
      temperature: 0.7,
      topP: 0.8,
      topK: 40,
    },
  });
};

// Chat history interface
export interface ChatHistory {
  role: 'user' | 'model';
  parts: string;
  timestamp: Date;
}

// Main chat function
export async function getChatCompletion(
  message: string,
  language: Language = 'en',
  history: ChatHistory[] = []
) {
  try {
    console.log('Requesting AI response...');
    
    // Initialize chat with specified language
    const chat = initializeChat(language);

    // Add previous conversation history
    for (const entry of history) {
      await chat.sendMessage(entry.parts);
    }

    // Send the current message
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();
    
    console.log('AI response received:', text);
    return text;
  } catch (error) {
    console.error('Gemini API Error:', error);
    
    // Return error message in the selected language
    const errorMessages: Record<Language, string> = {
      en: "I apologize, but I encountered an error. Please try again later.",
      es: "Me disculpo, pero encontré un error. Por favor, inténtalo de nuevo más tarde.",
      fr: "Je m'excuse, mais j'ai rencontré une erreur. Veuillez réessayer plus tard.",
      de: "Ich entschuldige mich, aber es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.",
      it: "Mi scuso, ma ho riscontrato un errore. Per favore riprova più tardi.",
      pt: "Desculpe, mas encontrei um erro. Por favor, tente novamente mais tarde.",
      ru: "Приношу извинения, но произошла ошибка. Пожалуйста, повторите попытку позже.",
      zh: "抱歉，我遇到了错误。请稍后再试。",
      ja: "申し訳ありませんが、エラーが発生しました。後でもう一度お試しください。",
      ko: "죄송하지만 오류가 발생했습니다. 나중에 다시 시도해 주세요.",
      ar: "أعتذر، لكنني واجهت خطأ. يرجى المحاولة مرة أخرى لاحقًا.",
      hi: "मैं क्षमा चाहता हूं, लेकिन मुझे एक त्रुटि मिली। कृपया बाद में पुनः प्रयास करें।"
    };
    
    return errorMessages[language];
  }
}