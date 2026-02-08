import OpenAI from "openai";

export interface ChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

export interface ChatRequest {
    model: string;
    apiKey: string;
    messages: ChatMessage[];
    temperature?: number;
    maxTokens?: number;
}

export interface ChatResponse {
    content: string;
    usage?: {
        total_tokens: number;
    };
}

export class AIClient {
    static async chat(request: ChatRequest): Promise<ChatResponse> {
        if (request.model.startsWith('openai/')) {
            return this.callOpenAI(request);
        } else if (request.model.startsWith('google/')) {
            return this.callGemini(request);
        }
        throw new Error(`Unsupported model: ${request.model}`);
    }

    private static async callOpenAI(request: ChatRequest): Promise<ChatResponse> {
        const openai = new OpenAI({
            apiKey: request.apiKey,
            dangerouslyAllowBrowser: true // Allowed for client-side demo, ideally proxy through backend
        });

        const modelName = request.model.split('/')[1] || 'gpt-4o-mini';

        const response = await openai.chat.completions.create({
            model: modelName,
            messages: request.messages,
            temperature: request.temperature || 0.3,
            max_tokens: request.maxTokens || 800,
        });

        return {
            content: response.choices[0]?.message?.content || '',
            usage: {
                total_tokens: response.usage?.total_tokens || 0
            }
        };
    }

    private static async callGemini(request: ChatRequest): Promise<ChatResponse> {
        // Gemini API client (direct fetch)
        // Note: model name parsing depends on exact string format
        const modelName = request.model.split('/')[1] || 'gemini-3-flash-preview';

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${request.apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: request.messages.map(msg => ({
                        role: msg.role === 'assistant' ? 'model' : 'user',
                        parts: [{ text: msg.content }]
                    })),
                    // Transform system prompt if present (Gemini puts it in systemInstruction usually, but here checking messages)
                    // For simplicity, we filter out system role and put it in systemInstruction if needed, 
                    // or just pretend it's user for simple cases. Let's do it properly if possible.
                    systemInstruction: request.messages.find(m => m.role === 'system')
                        ? { parts: [{ text: request.messages.find(m => m.role === 'system')?.content }] }
                        : undefined,
                    generationConfig: {
                        temperature: request.temperature || 0.3,
                        maxOutputTokens: request.maxTokens || 800,
                    },
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        return {
            content: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
            usage: {
                total_tokens: 0 // Gemini doesn't always return usage in this endpoint format easily without extra fields
            }
        };
    }
}
