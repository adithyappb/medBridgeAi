// AI Integration Test Script
// This tests both OpenAI and Gemini API integrations

import { getModelConfig, isModelConfigured, getAvailableModels } from './src/core-logic/ai-config';
import { AIClient } from './src/core-logic/ai-clients';

async function testAIIntegration() {
    console.log('🧪 Testing AI Integration...\n');

    // Test 1: Check available models
    console.log('1️⃣ Checking available models...');
    const availableModels = getAvailableModels();
    console.log('Available models:', availableModels);

    if (availableModels.length === 0) {
        console.error('❌ No AI models configured! Please check your .env file.');
        return;
    }
    console.log('✅ Found', availableModels.length, 'configured models\n');

    // Test 2: Test OpenAI (if configured)
    if (isModelConfigured('openai/gpt-4o-mini')) {
        console.log('2️⃣ Testing OpenAI GPT-4o-mini...');
        try {
            const config = getModelConfig('openai/gpt-4o-mini');
            const response = await AIClient.chat({
                model: 'openai/gpt-4o-mini',
                apiKey: config!.apiKey,
                messages: [
                    { role: 'system', content: 'You are a helpful assistant.' },
                    { role: 'user', content: 'Say "OpenAI integration working!" in exactly 5 words.' }
                ],
                temperature: 0.3,
                maxTokens: 50
            });

            console.log('Response:', response.content);
            console.log('Tokens used:', response.usage?.total_tokens || 'N/A');
            console.log('✅ OpenAI integration successful!\n');
        } catch (error) {
            console.error('❌ OpenAI test failed:', (error as Error).message, '\n');
        }
    }

    // Test 3: Test Gemini (if configured)
    if (isModelConfigured('google/gemini-3-flash-preview')) {
        console.log('3️⃣ Testing Google Gemini Flash...');
        try {
            const config = getModelConfig('google/gemini-3-flash-preview');
            const response = await AIClient.chat({
                model: 'google/gemini-3-flash-preview',
                apiKey: config!.apiKey,
                messages: [
                    { role: 'system', content: 'You are a helpful assistant.' },
                    { role: 'user', content: 'Say "Gemini integration working!" in exactly 5 words.' }
                ],
                temperature: 0.3,
                maxTokens: 50
            });

            console.log('Response:', response.content);
            console.log('Tokens used:', response.usage?.total_tokens || 'N/A');
            console.log('✅ Gemini integration successful!\n');
        } catch (error) {
            console.error('❌ Gemini test failed:', (error as Error).message, '\n');
        }
    }

    // Test 4: Healthcare query test
    console.log('4️⃣ Testing healthcare analysis prompt...');
    const testModel = availableModels[0];
    const config = getModelConfig(testModel);

    try {
        const response = await AIClient.chat({
            model: testModel,
            apiKey: config!.apiKey,
            messages: [
                {
                    role: 'system',
                    content: 'You are MedBridge-AI, a healthcare intelligence agent. Respond concisely.'
                },
                {
                    role: 'user',
                    content: 'What are the top 3 critical services a hospital should have? List them briefly.'
                }
            ],
            temperature: 0.3,
            maxTokens: 100
        });

        console.log('Response:', response.content);
        console.log('✅ Healthcare query successful!\n');
    } catch (error) {
        console.error('❌ Healthcare query failed:', (error as Error).message, '\n');
    }

    console.log('🎉 AI Integration testing complete!');
}

// Run tests
testAIIntegration().catch(console.error);
