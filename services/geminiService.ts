// Gemini AI Service for Weather Information
const GEMINI_API_KEY = 'AIzaSyD7Yjzpe3hXjRIxqmS_krkImI7tjjPoabU';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export interface WeatherResult {
    temperature: string;
    condition: string;
    advice: string;
    source: 'forecast' | 'historical';
}

export const fetchWeatherForLocation = async (
    location: string,
    dateStr: string
): Promise<WeatherResult> => {
    try {
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
            return {
                temperature: parsed.temperature || '--',
                condition: parsed.condition || '未知',
                advice: parsed.advice || '',
                source: isFuture ? 'forecast' : 'historical'
            };
        }

        // Fallback if JSON parsing fails
        return {
            temperature: '--',
            condition: '資料載入中',
            advice: '',
            source: isFuture ? 'forecast' : 'historical'
        };
    } catch (error) {
        console.error('Weather fetch error:', error);
        return {
            temperature: '--',
            condition: '無法取得',
            advice: '',
            source: 'historical'
        };
    }
};
