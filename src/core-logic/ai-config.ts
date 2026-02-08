
export interface ModelConfig {
    apiKey: string;
    modelName: string;
}

export const AI_CONFIG = {
    openai: {
        apiKey: import.meta.env?.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY || '',
        defaultModel: 'openai/gpt-4o-mini'
    },
    gemini: {
        apiKey: import.meta.env?.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '',
        defaultModel: 'google/gemini-3-flash-preview'
    }
};

export function getModelConfig(modelId: string): ModelConfig | null {
    if (modelId.startsWith('openai/')) {
        return {
            apiKey: AI_CONFIG.openai.apiKey,
            modelName: modelId.split('/')[1]
        };
    }
    if (modelId.startsWith('google/')) {
        return {
            apiKey: AI_CONFIG.gemini.apiKey,
            modelName: modelId.split('/')[1] // e.g. gemini-3-flash-preview
        };
    }
    return null;
}

export function isModelConfigured(modelId: string): boolean {
    const config = getModelConfig(modelId);
    return !!config && !!config.apiKey;
}

export function getAvailableModels(): string[] {
    const models: string[] = [];
    if (AI_CONFIG.openai.apiKey) models.push(AI_CONFIG.openai.defaultModel);
    if (AI_CONFIG.gemini.apiKey) models.push(AI_CONFIG.gemini.defaultModel);
    return models;
}
