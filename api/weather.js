// Vercel Serverless Function for Gemini Weather API
const GEMINI_API_KEY = 'AIzaSyD7Yjzpe3hXjRIxqmS_krkImI7tjjPoabU';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { location, dateStr } = req.body;

        if (!location || !dateStr) {
            return res.status(400).json({ error: 'Missing location or dateStr' });
        }

        const targetDate = new Date(dateStr);
        const today = new Date();
        const isFuture = targetDate > today;

        const prompt = isFuture
            ? `請提供 ${location} 在 ${dateStr} 的天氣預報，用繁體中文回答。請以 JSON 格式回應，包含：temperature (溫度，例如："18-25°C")、condition (天氣狀況，例如："晴天")、advice (旅遊建議，一句話，例如："適合穿著輕便服裝")`
            : `請提供 ${location} 在 ${dateStr} 前後的歷史天氣資料，用繁體中文回答。請以 JSON 格式回應，包含：temperature (溫度，例如："18-25°C")、condition (天氣狀況，例如："晴天")、advice (歷史參考，一句話，例如："參考往年數據建議")`;

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error('Gemini API request failed');
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Try to parse JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return res.status(200).json({
                temperature: parsed.temperature || '--',
                condition: parsed.condition || '未知',
                advice: parsed.advice || '',
                source: isFuture ? 'forecast' : 'historical'
            });
        }

        // Fallback
        return res.status(200).json({
            temperature: '--',
            condition: '資料載入中',
            advice: '',
            source: isFuture ? 'forecast' : 'historical'
        });
    } catch (error) {
        console.error('Weather API error:', error);
        return res.status(500).json({
            error: error.message,
            temperature: '--',
            condition: '無法取得',
            advice: '',
            source: 'historical'
        });
    }
}
