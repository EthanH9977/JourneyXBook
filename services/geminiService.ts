// Gemini AI Service for Weather Information (via Vercel API proxy)

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
        // Call our Vercel serverless function instead of direct API call
        const response = await fetch('/api/weather', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                location,
                dateStr
            })
        });

        if (!response.ok) {
            throw new Error('Weather API request failed');
        }

        const data = await response.json();
        return data;
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
