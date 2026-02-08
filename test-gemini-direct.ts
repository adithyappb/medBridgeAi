// Test Gemini API Integration Directly
console.log('🧪 Testing Gemini API...\n');

const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE";

async function testGemini() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`;

    const payload = {
        contents: [{
            role: 'user',
            parts: [{ text: 'Say "Gemini API is working perfectly!" in exactly those words.' }],
        }],
        systemInstruction: {
            parts: [{ text: 'You are a helpful assistant. Respond concisely.' }]
        },
        generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 50,
        },
    };

    try {
        console.log('📤 Sending request to Gemini 3 Flash Preview...');
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Gemini API Error:', response.status);
            console.error('Error details:', errorText);
            return;
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        console.log('✅ Gemini API Response:');
        console.log(text);
        console.log('\n📊 Response metadata:');
        console.log('- Model:', 'gemini-3-flash-preview');
        console.log('- Finish reason:', data.candidates?.[0]?.finishReason);
        console.log('\n🎉 Gemini integration is WORKING PERFECTLY!');

    } catch (error) {
        console.error('❌ Gemini Test Failed:');
        console.error(error);
    }
}

testGemini();
