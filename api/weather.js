// Vercel Serverless Function for Weather API using Open-Meteo
// Uses hardcoded coordinates for common cities (fast), fallback to geocoding API (universal)

const CITY_COORDINATES = {
    // Taiwan
    '台北': { lat: 25.0330, lon: 121.5654 },
    'taipei': { lat: 25.0330, lon: 121.5654 },
    '臺北': { lat: 25.0330, lon: 121.5654 },
    '台中': { lat: 24.1477, lon: 120.6736 },
    'taichung': { lat: 24.1477, lon: 120.6736 },
    '臺中': { lat: 24.1477, lon: 120.6736 },
    '高雄': { lat: 22.6273, lon: 120.3014 },
    'kaohsiung': { lat: 22.6273, lon: 120.3014 },
    '台南': { lat: 22.9908, lon: 120.2133 },
    'tainan': { lat: 22.9908, lon: 120.2133 },
    '臺南': { lat: 22.9908, lon: 120.2133 },
    // Japan - Major regions
    '北海道': { lat: 43.0642, lon: 141.3469 }, // Sapporo center
    'hokkaido': { lat: 43.0642, lon: 141.3469 },
    '札幌': { lat: 43.0642, lon: 141.3469 },
    'sapporo': { lat: 43.0642, lon: 141.3469 },
    '東京': { lat: 35.6762, lon: 139.6503 },
    'tokyo': { lat: 35.6762, lon: 139.6503 },
    '大阪': { lat: 34.6937, lon: 135.5023 },
    'osaka': { lat: 34.6937, lon: 135.5023 },
    '京都': { lat: 35.0116, lon: 135.7681 },
    'kyoto': { lat: 35.0116, lon: 135.7681 },
    '名古屋': { lat: 35.1815, lon: 136.9066 },
    'nagoya': { lat: 35.1815, lon: 136.9066 },
    '福岡': { lat: 33.5904, lon: 130.4017 },
    'fukuoka': { lat: 33.5904, lon: 130.4017 },
    '沖繩': { lat: 26.2124, lon: 127.6809 },
    'okinawa': { lat: 26.2124, lon: 127.6809 },
    '那霸': { lat: 26.2124, lon: 127.6809 },
    'naha': { lat: 26.2124, lon: 127.6809 },
    // Shikoku (Japan)
    '高松': { lat: 34.3428, lon: 134.0434 },
    'takamatsu': { lat: 34.3428, lon: 134.0434 },
    '鳴門': { lat: 34.1734, lon: 134.6096 },
    'naruto': { lat: 34.1734, lon: 134.6096 },
    '祖谷': { lat: 33.9167, lon: 133.8167 },
    '高知': { lat: 33.5597, lon: 133.5311 },
    'kochi': { lat: 33.5597, lon: 133.5311 },
    '宇和島': { lat: 33.2233, lon: 132.5606 },
    'uwajima': { lat: 33.2233, lon: 132.5606 },
    '道後': { lat: 33.8520, lon: 132.7859 },
    '道後溫泉': { lat: 33.8520, lon: 132.7859 },
    'dogo': { lat: 33.8520, lon: 132.7859 },
    '松山': { lat: 33.8391, lon: 132.7656 },
    'matsuyama': { lat: 33.8391, lon: 132.7656 },
    '觀音寺': { lat: 34.1290, lon: 133.6630 },
    'kanonji': { lat: 34.1290, lon: 133.6630 },
    '丸龜': { lat: 34.2899, lon: 133.7975 },
    'marugame': { lat: 34.2899, lon: 133.7975 }
};

export default async function handler(req, res) {
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

        // Step 1: Try to get coordinates
        let coords = null;

        // Strategy A: Check hardcoded coordinates (fast, for common cities)
        const cityParts = location.split(/[\s&]+/);
        for (const part of cityParts) {
            const cleanPart = part.toLowerCase().trim();
            if (CITY_COORDINATES[cleanPart] || CITY_COORDINATES[part]) {
                coords = CITY_COORDINATES[cleanPart] || CITY_COORDINATES[part];
                break;
            }
        }

        // Strategy B: Use geocoding API (universal fallback)
        if (!coords) {
            try {
                const searchTerm = cityParts[0]; // Use first part (usually the main city name)
                const geoResponse = await fetch(
                    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchTerm)}&count=1&language=zh&format=json`
                );

                if (geoResponse.ok) {
                    const geoData = await geoResponse.json();
                    if (geoData.results && geoData.results.length > 0) {
                        coords = {
                            lat: geoData.results[0].latitude,
                            lon: geoData.results[0].longitude
                        };
                    }
                }
            } catch (geoError) {
                console.error('Geocoding failed:', geoError);
            }
        }

        // Fallback: Default coordinates if all else fails
        if (!coords) {
            coords = { lat: 35.6762, lon: 139.6503 }; // Tokyo as last resort
        }

        const { lat, lon } = coords;

        // Step 2: Get weather data
        const targetDate = new Date(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        targetDate.setHours(0, 0, 0, 0);
        const isFuture = targetDate >= today;

        let weatherData;

        if (isFuture) {
            const weatherResponse = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&forecast_days=16`
            );

            if (!weatherResponse.ok) {
                throw new Error('Weather forecast failed');
            }

            weatherData = await weatherResponse.json();
        } else {
            const weatherResponse = await fetch(
                `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${dateStr}&end_date=${dateStr}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`
            );

            if (!weatherResponse.ok) {
                throw new Error('Historical weather failed');
            }

            weatherData = await weatherResponse.json();
        }

        // Parse weather data
        const dateIndex = weatherData.daily.time.indexOf(dateStr);

        let tempMax, tempMin, weatherCode;

        if (dateIndex !== -1) {
            tempMax = weatherData.daily.temperature_2m_max[dateIndex];
            tempMin = weatherData.daily.temperature_2m_min[dateIndex];
            weatherCode = weatherData.daily.weathercode[dateIndex];
        } else {
            // Use first available data
            tempMax = weatherData.daily.temperature_2m_max[0];
            tempMin = weatherData.daily.temperature_2m_min[0];
            weatherCode = weatherData.daily.weathercode[0];
        }

        return res.status(200).json({
            temperature: `${Math.round(tempMin)}°C - ${Math.round(tempMax)}°C`,
            condition: getWeatherCondition(weatherCode),
            advice: getWeatherAdvice(weatherCode, tempMax),
            source: isFuture ? 'forecast' : 'historical'
        });

    } catch (error) {
        console.error('Weather API error:', error);
        return res.status(200).json({
            temperature: '--',
            condition: '無法取得',
            advice: '',
            source: 'historical'
        });
    }
}

function getWeatherCondition(code) {
    const weatherCodes = {
        0: '晴天', 1: '大致晴朗', 2: '部分多雲', 3: '多雲',
        45: '有霧', 48: '霧淞',
        51: '小雨', 53: '中雨', 55: '大雨',
        61: '小陣雨', 63: '中陣雨', 65: '大陣雨',
        71: '小雪', 73: '中雪', 75: '大雪', 77: '雪粒',
        80: '陣雨', 81: '中陣雨', 82: '大陣雨',
        85: '陣雪', 86: '大陣雪',
        95: '雷雨', 96: '雷雨夾冰雹', 99: '強雷雨夾冰雹'
    };
    return weatherCodes[code] || '未知';
}

function getWeatherAdvice(code, tempMax) {
    if (code >= 95) return '有雷雨風險，注意安全';
    if (code >= 71) return '天氣寒冷，注意保暖';
    if (code >= 61) return '記得攜帶雨具';
    if (tempMax > 30) return '天氣炎熱，注意防曬';
    if (tempMax < 10) return '氣溫較低，多穿衣物';
    if (code <= 1) return '天氣晴朗，適合戶外活動';
    return '天氣穩定，適合旅遊';
}
