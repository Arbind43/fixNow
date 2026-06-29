import { Request, Response, NextFunction } from 'express';
import Groq from 'groq-sdk';
import { Service } from '../models/Service';
import { AppError } from '../utils/AppError';

// Lazy load Groq SDK to ensure environment variables are populated first
let groq: Groq | null = null;
const getGroqClient = () => {
  if (!groq && process.env.GROQ_API_KEY) {
    try {
      groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    } catch (e) {
      console.warn("⚠️ Failed to initialize Groq SDK. Check your API key.");
    }
  }
  return groq;
};

export const chatWithAssistant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return next(new AppError('Message is required', 400));
    }

    const groqClient = getGroqClient();

    // Mock response if API key is missing (for dev)
    if (!groqClient) {
      return res.status(200).json({
        success: true,
        data: {
          reply: `[Dev Mode: No Groq Key] I received your message: "${message}". Please configure GROQ_API_KEY to enable real AI.`,
          services: []
        }
      });
    }

    // Fetch available services to provide as context to the AI
    const services = await Service.find({ isActive: true }).populate('category', 'name');
    const serviceList = services.map(s => `- ${s.name} (Category: ${(s.category as any).name}, Price: ₹${s.basePrice})`).join('\n');

    // System instruction defining the persona
    const systemInstruction = `
      You are the FixNow AI Assistant, an intelligent customer support agent for a home services platform in India.
      Your goal is to help users diagnose their home repair issues and recommend the exact service they need.
      
      Be concise, polite, and helpful. Do not format your response with complex markdown, keep it conversational.
      
      Here are the services currently available on our platform:
      ${serviceList}
      
      If the user describes a problem, tell them which of our specific services would fix it and mention the starting price.
      If their problem is not covered by our services, politely inform them that we don't handle that yet.
      Never invent services that are not in the list above.
    `;

    // Format history for the Groq API
    const formattedHistory = Array.isArray(history) ? history.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    })) : [];

    // Call Groq API using the latest Llama 3.1 model
    const response = await groqClient.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemInstruction },
        ...formattedHistory,
        { role: 'user', content: message }
      ],
      temperature: 0.7,
    });

    const reply = response.choices[0]?.message?.content || "I'm sorry, I couldn't process that request.";

    // Optional: Extract recommended service names to return as structural data
    // A simple hack is finding if any service name is present in the reply text
    const recommendedServices = services
      .filter(s => reply.toLowerCase().includes(s.name.toLowerCase()))
      .map(s => ({ _id: s._id, name: s.name, slug: s.slug }));

    res.status(200).json({
      success: true,
      data: {
        reply,
        services: recommendedServices
      }
    });
  } catch (error: any) {
    console.error('Groq API Error:', error);
    next(new AppError('AI Assistant is currently unavailable.', 503));
  }
};
