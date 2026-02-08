// Direct OpenAI API Test
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: "YOUR_OPENAI_API_KEY_HERE",
});

async function testOpenAI() {
    console.log('🧪 Testing OpenAI GPT-4o-mini directly...\n');

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant. Respond concisely."
                },
                {
                    role: "user",
                    content: "Say 'OpenAI API is working perfectly!' in exactly those words."
                }
            ],
            temperature: 0.3,
            max_tokens: 50,
        });

        console.log('✅ OpenAI API Response:');
        console.log(response.choices[0].message.content);
        console.log('\nTokens used:', response.usage?.total_tokens);
        console.log('Model:', response.model);
        console.log('\n🎉 OpenAI integration is WORKING!');

    } catch (error) {
        console.error('❌ OpenAI API Error:');
        console.error(error);

        if (error instanceof Error) {
            console.error('\nError message:', error.message);
        }
    }
}

testOpenAI();
