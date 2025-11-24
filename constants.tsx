import { DayItinerary, EventType } from './types';
import { Plane, Train, Bus, Hotel, Camera, Utensils, ShoppingBag, MapPin, Star, Gamepad2 } from 'lucide-react';
import React from 'react';

// Helper to map type to icon
export const getIconForType = (type: EventType) => {
  switch (type) {
    case EventType.FLIGHT: return <Plane size={18} />;
    case EventType.TRAIN: return <Train size={18} />;
    case EventType.BUS: return <Bus size={18} />;
    case EventType.HOTEL: return <Hotel size={18} />;
    case EventType.FOOD: return <Utensils size={18} />;
    case EventType.SHOPPING: return <ShoppingBag size={18} />;
    case EventType.WALKING: return <MapPin size={18} />;
    case EventType.SIGHTSEEING: return <Camera size={18} />;
    default: return <Camera size={18} />;
  }
};

// Helper to generate an empty itinerary
export const generateEmptyItinerary = (days: number, startDateStr: string): DayItinerary[] => {
  const result: DayItinerary[] = [];
  const startDate = new Date(startDateStr);
  
  const weekDays = ["(日)", "(一)", "(二)", "(三)", "(四)", "(五)", "(六)"];

  for (let i = 0; i < days; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    
    // Format YYYY-MM-DD
    const yyyy = currentDate.getFullYear();
    const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dd = String(currentDate.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    // Format Display Date like "2/13 (五)"
    const displayDate = `${currentDate.getMonth() + 1}/${currentDate.getDate()} ${weekDays[currentDate.getDay()]}`;

    result.push({
      dayId: i + 1,
      dateStr: dateStr,
      displayDate: displayDate,
      region: "待定地點",
      events: []
    });
  }
  return result;
};

export const SHIKOKU_DEMO_DATA: DayItinerary[] = [
  {
    dayId: 1,
    dateStr: "2026-02-13",
    displayDate: "2/13 (五)",
    region: "高松 Takamatsu",
    events: [
      {
        id: "d1-1",
        time: "11:15",
        title: "抵達高松機場",
        locationName: "高松機場",
        type: EventType.FLIGHT,
        description: "CI 278 抵達，出關後前往 2號乘車處",
        details: [{ title: "交通", content: "搭乘 12:00 發車的利木津巴士" }]
      },
      {
        id: "d1-2",
        time: "13:00",
        title: "高松城 (玉藻公園)",
        locationName: "高松城跡",
        type: EventType.SIGHTSEEING,
        description: "巴士於「高松築港」下車即達，體驗餵鯛魚",
        details: [{ title: "備註", content: "門票 ¥200 / 寄放行李於高松站" }]
      },
      {
        id: "d1-3",
        time: "14:30",
        title: "★ 栗林公園",
        locationName: "栗林公園",
        type: EventType.SIGHTSEEING,
        description: "米其林三星庭園，必搭「和船」遊湖",
        details: [{ title: "交通", content: "搭琴電：高松築港 -> 栗林公園站" }]
      },
      {
        id: "d1-4",
        time: "16:30",
        title: "北濱 Alley",
        locationName: "北濱Alley",
        type: EventType.SIGHTSEEING,
        description: "舊倉庫改建文創區，海景夕陽",
        details: [{ title: "交通", content: "從栗林公園搭琴電回高松築港，步行10分" }]
      },
      {
        id: "d1-5",
        time: "18:30",
        title: "一鶴 骨付鳥 (高松店)",
        locationName: "一鶴 高松店",
        type: EventType.FOOD,
        description: "香川名物烤雞腿，推薦點「雛鳥」(Hinadori)",
        details: [{ title: "備註", content: "排隊名店，建議提早去" }]
      },
      {
        id: "d1-6",
        time: "20:00",
        title: "Pachinko Time",
        locationName: "瓦町站",
        type: EventType.SHOPPING,
        description: "瓦町 FLAG 周邊有店，小試身手"
      },
      {
        id: "d1-7",
        time: "22:00",
        title: "入住：WeBase Takamatsu",
        locationName: "WeBase 高松",
        type: EventType.HOTEL,
        description: "位於瓦町鬧區，方便移動",
        details: [{ title: "訂房代號", content: "待更新" }]
      }
    ]
  },
  {
    dayId: 2,
    dateStr: "2026-02-14",
    displayDate: "2/14 (六)",
    region: "鳴門 & 祖谷",
    events: [
      {
        id: "d2-1",
        time: "08:22",
        title: "高松 -> 鳴門 (JR Pass 啟用)",
        locationName: "JR 高松站",
        type: EventType.TRAIN,
        description: "[特急] 渦潮5號 (Uzushio 5) 08:22發 -> 09:05抵達池谷",
        details: [{ title: "轉乘注意", content: "在「池谷站」同月台對面轉乘 09:13 普通車往鳴門" }]
      },
      {
        id: "d2-2",
        time: "09:30",
        title: "★ 鳴門漩渦 (渦之道)",
        locationName: "渦之道",
        type: EventType.SIGHTSEEING,
        description: "鳴門站轉搭巴士(約20分)至「鳴門公園」",
        details: [{ title: "備註", content: "此時段通常可見漩渦" }]
      },
      {
        id: "d2-3",
        time: "11:30",
        title: "大塚國際美術館",
        locationName: "大塚國際美術館",
        type: EventType.SIGHTSEEING,
        description: "世界名畫陶板複製，紅白歌合戰舞台",
        details: [{ title: "備註", content: "門票 ¥3300 / 步行可達" }]
      },
      {
        id: "d2-4",
        time: "14:30",
        title: "移動：美術館 -> 德島",
        locationName: "JR 德島站",
        type: EventType.BUS,
        description: "搭巴士回鳴門站，轉乘 JR 往德島站",
        details: [{ title: "目標", content: "搭上 16:00 的特急劍山號" }]
      },
      {
        id: "d2-5",
        time: "16:00",
        title: "德島 -> 大步危",
        locationName: "JR 大步危站",
        type: EventType.TRAIN,
        description: "[特急] 劍山9號 (Tsurugisan 9) 16:00發 -> 17:16抵達",
        details: [{ title: "Tips", content: "風景極美，請坐窗邊" }]
      },
      {
        id: "d2-6",
        time: "17:30",
        title: "入住：祖谷溫泉",
        locationName: "和之宿 祖谷溫泉",
        type: EventType.HOTEL,
        description: "搭飯店接駁車前往(需預約)",
        details: [{ title: "亮點", content: "搭纜車下去的露天風呂是亮點" }]
      }
    ]
  },
  {
    dayId: 3,
    dateStr: "2026-02-15",
    displayDate: "2/15 (日)",
    region: "高知 Kochi",
    events: [
      {
        id: "d3-1",
        time: "09:00",
        title: "大步危峽 遊覽船",
        locationName: "大步危峽觀光遊覽船",
        type: EventType.SIGHTSEEING,
        description: "近距離欣賞峽谷美景",
        details: [{ title: "交通", content: "請飯店送至遊覽船搭乘處" }]
      },
      {
        id: "d3-2",
        time: "12:02",
        title: "大步危 -> 高知",
        locationName: "JR 高知站",
        type: EventType.TRAIN,
        description: "[特急] 南風7號 (Nanpu 7) 12:02發 -> 12:53抵達",
        details: [{ title: "Tips", content: "利用空檔吃午餐/逛道之驛" }]
      },
      {
        id: "d3-3",
        time: "14:00",
        title: "★ 高知日曜市",
        locationName: "高知日曜市",
        type: EventType.SIGHTSEEING,
        description: "週日限定！長達 1km 的街路市集",
        details: [{ title: "必吃", content: "田舍壽司、炸番薯" }]
      },
      {
        id: "d3-4",
        time: "15:30",
        title: "高知城",
        locationName: "高知城",
        type: EventType.SIGHTSEEING,
        description: "現存天守與絕景咖啡廳",
        details: [{ title: "位置", content: "就在市集盡頭" }]
      },
      {
        id: "d3-5",
        time: "18:00",
        title: "弘人市場 (明神丸)",
        locationName: "弘人市場",
        type: EventType.FOOD,
        description: "高知靈魂美食：炙燒鰹魚 (Tataki)",
        details: [{ title: "備註", content: "氣氛熱鬧需併桌" }]
      },
      {
        id: "d3-6",
        time: "20:00",
        title: "Pachinko Time",
        locationName: "高知市 Pachinko",
        type: EventType.SHOPPING,
        description: "高知市區大型店鋪挑戰"
      },
      {
        id: "d3-7",
        time: "22:00",
        title: "入住：Richmond Hotel",
        locationName: "Richmond Hotel Kochi",
        type: EventType.HOTEL,
        description: "位於商店街內，離吃飯逛街最近",
        details: [{ title: "訂房代號", content: "待更新" }]
      }
    ]
  },
  {
    dayId: 4,
    dateStr: "2026-02-16",
    displayDate: "2/16 (一)",
    region: "宇和島 Uwajima",
    events: [
      {
        id: "d4-1",
        time: "09:00",
        title: "★ 桂濱公園 & 龍王宮",
        locationName: "桂濱公園",
        type: EventType.SIGHTSEEING,
        description: "太平洋絕景，坂本龍馬像",
        details: [{ title: "交通", content: "高知站搭 MY遊巴士 (08:30/09:00發)" }]
      },
      {
        id: "d4-2",
        time: "10:00",
        title: "桂濱水族館",
        locationName: "桂濱水族館",
        type: EventType.SIGHTSEEING,
        description: "超近距離海獅秀，怪怪吉祥物"
      },
      {
        id: "d4-3",
        time: "12:13",
        title: "高知 -> 窪川 (前段)",
        locationName: "JR 窪川站",
        type: EventType.TRAIN,
        description: "[特急] 足摺3號 (Ashizuri 3) 12:13發 -> 13:16抵達",
        details: [{ title: "重要", content: "⚠️務必在窪川站購買午餐便當" }]
      },
      {
        id: "d4-4",
        time: "13:21",
        title: "窪川 -> 宇和島 (予土線)",
        locationName: "JR 宇和島站",
        type: EventType.TRAIN,
        description: "[普通車] 予土線 13:21發 -> 16:03抵達",
        details: [{ title: "亮點", content: "全四國最慢的車，欣賞四萬十川" }]
      },
      {
        id: "d4-5",
        time: "16:10",
        title: "宇和島市區散策",
        locationName: "JR 宇和島站",
        type: EventType.WALKING,
        description: "抵達宇和島，前往飯店 Check-in"
      },
      {
        id: "d4-6",
        time: "20:00",
        title: "Pachinko Time",
        locationName: "宇和島 Pachinko",
        type: EventType.SHOPPING,
        description: "宇和島國道沿線 (需搭計程車)"
      },
      {
        id: "d4-7",
        time: "21:00",
        title: "入住：JR Hotel Clement",
        locationName: "JR Hotel Clement Uwajima",
        type: EventType.HOTEL,
        description: "就在車站樓上，極致方便"
      }
    ]
  },
  {
    dayId: 5,
    dateStr: "2026-02-17",
    displayDate: "2/17 (二)",
    region: "道後溫泉 Dogo",
    events: [
      {
        id: "d5-1",
        time: "09:00",
        title: "宇和島城",
        locationName: "宇和島城",
        type: EventType.SIGHTSEEING,
        description: "現存十二天守之一，森林浴登城",
        details: [{ title: "交通", content: "步行可達" }]
      },
      {
        id: "d5-2",
        time: "10:30",
        title: "天赦園",
        locationName: "天赦園",
        type: EventType.SIGHTSEEING,
        description: "伊達家大名庭園，特色白玉藤"
      },
      {
        id: "d5-3",
        time: "12:56",
        title: "宇和島 -> 松山",
        locationName: "JR 松山站",
        type: EventType.TRAIN,
        description: "[特急] 宇和海16號 (Uwakai 16) 12:56發 -> 14:18抵達",
        details: [{ title: "備註", content: "班次密集，每小時一班" }]
      },
      {
        id: "d5-4",
        time: "15:00",
        title: "★ 道後溫泉本館",
        locationName: "道後溫泉本館",
        type: EventType.SIGHTSEEING,
        description: "神隱少女湯屋原型，必泡古湯",
        details: [{ title: "交通", content: "松山站轉路面電車至道後" }]
      },
      {
        id: "d5-5",
        time: "18:00",
        title: "飛鳥乃湯 (中庭光雕)",
        locationName: "道後溫泉別館 飛鳥乃湯泉",
        type: EventType.SIGHTSEEING,
        description: "蜷川實花風格藝術"
      },
      {
        id: "d5-6",
        time: "20:00",
        title: "Pachinko Time",
        locationName: "大街道",
        type: EventType.SHOPPING,
        description: "松山大街道商店街"
      },
      {
        id: "d5-7",
        time: "22:00",
        title: "入住：茶玻瑠",
        locationName: "道後溫泉 茶玻瑠",
        type: EventType.HOTEL,
        description: "頂樓有景觀溫泉"
      }
    ]
  },
  {
    dayId: 6,
    dateStr: "2026-02-18",
    displayDate: "2/18 (三)",
    region: "松山 Matsuyama",
    events: [
      {
        id: "d6-1",
        time: "09:30",
        title: "★ 松山城",
        locationName: "松山城纜車",
        type: EventType.SIGHTSEEING,
        description: "搭纜車上山，俯瞰瀨戶內海",
        details: [{ title: "交通", content: "大街道步行至纜車站" }]
      },
      {
        id: "d6-2",
        time: "12:00",
        title: "鍋燒烏龍麵 (Asahi)",
        locationName: "Asahi 鍋燒烏龍麵",
        type: EventType.FOOD,
        description: "松山在地甜味烏龍麵"
      },
      {
        id: "d6-3",
        time: "13:30",
        title: "萬翠莊",
        locationName: "萬翠莊",
        type: EventType.SIGHTSEEING,
        description: "法式洋館，極美拍照點"
      },
      {
        id: "d6-4",
        time: "15:30",
        title: "石手寺 (第51番)",
        locationName: "石手寺",
        type: EventType.SIGHTSEEING,
        description: "米其林一星景點，神秘洞窟巡禮",
        details: [{ title: "交通", content: "搭巴士前往" }]
      },
      {
        id: "d6-5",
        time: "17:30",
        title: "大街道 & 銀天街",
        locationName: "松山銀天街",
        type: EventType.SHOPPING,
        description: "日本超長商店街，購物時間"
      },
      {
        id: "d6-6",
        time: "20:00",
        title: "Pachinko Time",
        locationName: "松山市站",
        type: EventType.SHOPPING,
        description: "松山市站 (高島屋對面)"
      },
      {
        id: "d6-7",
        time: "22:00",
        title: "入住：Candeo Hotels",
        locationName: "Candeo Hotels Matsuyama",
        type: EventType.HOTEL,
        description: "頂樓露天浴場，位於大街道"
      }
    ]
  },
  {
    dayId: 7,
    dateStr: "2026-02-19",
    displayDate: "2/19 (四)",
    region: "觀音寺 Kanonji",
    events: [
      {
        id: "d7-1",
        time: "09:05",
        title: "松山 -> 今治",
        locationName: "JR 今治站",
        type: EventType.TRAIN,
        description: "[特急] 石鎚12號 (Ishizuchi 12) 09:05發 -> 09:42抵達"
      },
      {
        id: "d7-2",
        time: "09:50",
        title: "今治毛巾美術館",
        locationName: "今治毛巾美術館",
        type: EventType.SIGHTSEEING,
        description: "嚕嚕米展覽 + 質感毛巾採購",
        details: [{ title: "交通", content: "今治站搭計程車(約20分)" }]
      },
      {
        id: "d7-3",
        time: "12:30",
        title: "今治城",
        locationName: "今治城",
        type: EventType.SIGHTSEEING,
        description: "引海水入濠，水中倒影美",
        details: [{ title: "交通", content: "計程車返回市區" }]
      },
      {
        id: "d7-4",
        time: "14:46",
        title: "今治 -> 觀音寺",
        locationName: "JR 觀音寺站",
        type: EventType.TRAIN,
        description: "[特急] 石鎚20號 (Ishizuchi 20) 14:46發 -> 15:27抵達"
      },
      {
        id: "d7-5",
        time: "16:00",
        title: "★ 琴彈公園 & 錢形砂繪",
        locationName: "錢形砂繪",
        type: EventType.SIGHTSEEING,
        description: "巨大沙幣畫，看了會發財",
        details: [{ title: "交通", content: "觀音寺站搭計程車" }]
      },
      {
        id: "d7-6",
        time: "20:00",
        title: "Pachinko Time",
        locationName: "觀音寺 Pachinko",
        type: EventType.SHOPPING,
        description: "國道11號線 (巨型店鋪)"
      },
      {
        id: "d7-7",
        time: "22:00",
        title: "入住：Kanonji Grand Hotel",
        locationName: "Kanonji Grand Hotel",
        type: EventType.HOTEL,
        description: "當地最大飯店，設施較舊但舒適"
      }
    ]
  },
  {
    dayId: 8,
    dateStr: "2026-02-20",
    displayDate: "2/20 (五)",
    region: "丸龜 Marugame",
    events: [
      {
        id: "d8-1",
        time: "09:30",
        title: "★ 高屋神社 (天空鳥居)",
        locationName: "高屋神社 本宮",
        type: EventType.SIGHTSEEING,
        description: "IG絕景，俯瞰瀨戶內海",
        details: [{ title: "交通", content: "建議包車或計程車半日遊" }]
      },
      {
        id: "d8-2",
        time: "12:00",
        title: "雲邊寺纜車",
        locationName: "雲邊寺山頂公園",
        type: EventType.SIGHTSEEING,
        description: "四國最大纜車，山頂公園盪鞦韆",
        details: [{ title: "備註", content: "(交通不便，建議接續計程車)" }]
      },
      {
        id: "d8-3",
        time: "16:00",
        title: "父母之濱",
        locationName: "父母之濱",
        type: EventType.SIGHTSEEING,
        description: "天空之鏡，夕陽時分必拍",
        details: [{ title: "備註", content: "(交通不便，建議接續計程車)" }]
      },
      {
        id: "d8-4",
        time: "18:30",
        title: "詫間 -> 丸龜",
        locationName: "JR 丸龜站",
        type: EventType.TRAIN,
        description: "[普通車] 18:38發 -> 18:57抵達",
        details: [{ title: "交通", content: "搭計程車至詫間站轉JR" }]
      },
      {
        id: "d8-5",
        time: "20:00",
        title: "Pachinko Time",
        locationName: "丸龜 Pachinko",
        type: EventType.SHOPPING,
        description: "丸龜市區"
      },
      {
        id: "d8-6",
        time: "22:00",
        title: "入住：Okura Hotel",
        locationName: "Okura Hotel Marugame",
        type: EventType.HOTEL,
        description: "有大浴場，近丸龜城"
      }
    ]
  },
  {
    dayId: 9,
    dateStr: "2026-02-21",
    displayDate: "2/21 (六)",
    region: "高松 Takamatsu",
    events: [
      {
        id: "d9-1",
        time: "09:00",
        title: "★ 丸龜城",
        locationName: "丸龜城",
        type: EventType.SIGHTSEEING,
        description: "全日本最高石垣，景色壯麗",
        details: [{ title: "交通", content: "步行可達" }]
      },
      {
        id: "d9-2",
        time: "10:30",
        title: "中津萬象園",
        locationName: "中津萬象園",
        type: EventType.SIGHTSEEING,
        description: "回遊式大名庭園，紅色太鼓橋",
        details: [{ title: "交通", content: "計程車 5-10分" }]
      },
      {
        id: "d9-3",
        time: "12:00",
        title: "丸龜 -> 琴平",
        locationName: "JR 琴平站",
        type: EventType.TRAIN,
        description: "[特急] 南風7號 (Nanpu 7) 12:05發 -> 12:18抵達",
        details: [{ title: "票務", content: "JR Pass已過期，需買票 ¥560" }]
      },
      {
        id: "d9-4",
        time: "12:30",
        title: "★ 金刀比羅宮",
        locationName: "金刀比羅宮",
        type: EventType.SIGHTSEEING,
        description: "一生必去，挑戰 1368 階奧社",
        details: [{ title: "Tips", content: "在車站寄放行李" }]
      },
      {
        id: "d9-5",
        time: "16:30",
        title: "舊金毘羅大芝居",
        locationName: "舊金毘羅大芝居",
        type: EventType.SIGHTSEEING,
        description: "現存最古老歌舞伎小屋"
      },
      {
        id: "d9-6",
        time: "18:30",
        title: "琴平 -> 高松",
        locationName: "琴電琴平站",
        type: EventType.TRAIN,
        description: "搭乘「琴電」(Kotoden) 往高松築港",
        details: [{ title: "時間", content: "約 60 分鐘，體驗在地電車" }]
      },
      {
        id: "d9-7",
        time: "20:00",
        title: "Pachinko Time",
        locationName: "瓦町 Pachinko",
        type: EventType.SHOPPING,
        description: "高松瓦町周邊"
      },
      {
        id: "d9-8",
        time: "22:00",
        title: "入住：WeBase Takamatsu",
        locationName: "WeBase 高松",
        type: EventType.HOTEL,
        description: "回到第一天住宿點，方便採購"
      }
    ]
  },
  {
    dayId: 10,
    dateStr: "2026-02-22",
    displayDate: "2/22 (日)",
    region: "高松 Takamatsu",
    events: [
      {
        id: "d10-1",
        time: "09:30",
        title: "★ 屋島 (獅子靈巖)",
        locationName: "屋島 獅子靈巖",
        type: EventType.SIGHTSEEING,
        description: "高松最佳展望台，投擲瓦片祈福",
        details: [{ title: "交通", content: "琴電至屋島站轉接駁巴士" }]
      },
      {
        id: "d10-2",
        time: "11:30",
        title: "四國村",
        locationName: "四國村",
        type: EventType.SIGHTSEEING,
        description: "戶外民家博物館，必吃 Waraya 烏龍麵"
      },
      {
        id: "d10-3",
        time: "14:30",
        title: "YouMe Town 高松",
        locationName: "YouMe Town Takamatsu",
        type: EventType.SHOPPING,
        description: "最後衝刺！超市、電器、藥妝",
        details: [{ title: "交通", content: "搭乘巴士前往" }]
      },
      {
        id: "d10-4",
        time: "18:30",
        title: "豪華讚岐牛晚餐",
        locationName: "高松 燒肉",
        type: EventType.FOOD,
        description: "慰勞旅途辛勞"
      },
      {
        id: "d10-5",
        time: "20:00",
        title: "Pachinko Final Battle",
        locationName: "瓦町 Pachinko",
        type: EventType.SHOPPING,
        description: "高松市區 (最後一戰)"
      }
    ]
  },
  {
    dayId: 11,
    dateStr: "2026-02-23",
    displayDate: "2/23 (一)",
    region: "返程",
    events: [
      {
        id: "d11-1",
        time: "09:00",
        title: "前往高松機場",
        locationName: "高松站 巴士站",
        type: EventType.BUS,
        description: "搭乘利木津巴士 (依航班時間調整)",
        details: [{ title: "Tips", content: "通常於起飛前 2 小時出發" }]
      },
      {
        id: "d11-2",
        time: "11:20",
        title: "華航 CI 179 起飛",
        locationName: "高松機場",
        type: EventType.FLIGHT,
        description: "滿載而歸，飛往台北"
      }
    ]
  }
];