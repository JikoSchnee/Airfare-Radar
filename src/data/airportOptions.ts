export interface AirportOption {
  id: string;
  city: string;
  airport: string;
  code: string;
  aliases: string[];
}

export const airportOptions: AirportOption[] = [
  { id: 'SHA.AIRPORT', city: '上海', airport: '虹桥国际机场', code: 'SHA', aliases: ['上海', '虹桥', '上海虹桥'] },
  { id: 'PVG.AIRPORT', city: '上海', airport: '浦东国际机场', code: 'PVG', aliases: ['上海', '浦东', '上海浦东'] },
  { id: 'PEK.AIRPORT', city: '北京', airport: '首都国际机场', code: 'PEK', aliases: ['北京', '首都', '北京首都'] },
  { id: 'PKX.AIRPORT', city: '北京', airport: '大兴国际机场', code: 'PKX', aliases: ['北京', '大兴', '北京大兴'] },
  { id: 'CAN.AIRPORT', city: '广州', airport: '白云国际机场', code: 'CAN', aliases: ['广州', '白云', '广州白云'] },
  { id: 'SZX.AIRPORT', city: '深圳', airport: '宝安国际机场', code: 'SZX', aliases: ['深圳', '宝安', '深圳宝安'] },
  { id: 'WUH.AIRPORT', city: '武汉', airport: '天河国际机场', code: 'WUH', aliases: ['武汉', '天河', '武汉天河'] },
  { id: 'CSX.AIRPORT', city: '长沙', airport: '黄花国际机场', code: 'CSX', aliases: ['长沙', '黄花', '长沙黄花'] },
  { id: 'CGO.AIRPORT', city: '郑州', airport: '新郑国际机场', code: 'CGO', aliases: ['郑州', '新郑', '郑州新郑'] },
  { id: 'TAO.AIRPORT', city: '青岛', airport: '胶东国际机场', code: 'TAO', aliases: ['青岛', '胶东', '青岛胶东'] },
  { id: 'XMN.AIRPORT', city: '厦门', airport: '高崎国际机场', code: 'XMN', aliases: ['厦门', '高崎', '厦门高崎'] },
  { id: 'FOC.AIRPORT', city: '福州', airport: '长乐国际机场', code: 'FOC', aliases: ['福州', '长乐', '福州长乐'] },
  { id: 'TSN.AIRPORT', city: '天津', airport: '滨海国际机场', code: 'TSN', aliases: ['天津', '滨海', '天津滨海'] },
  { id: 'CKG.AIRPORT', city: '重庆', airport: '江北国际机场', code: 'CKG', aliases: ['重庆', '江北', '重庆江北'] },
  { id: 'TFU.AIRPORT', city: '成都', airport: '天府国际机场', code: 'TFU', aliases: ['成都', '天府', '成都天府'] },
  { id: 'CTU.AIRPORT', city: '成都', airport: '双流国际机场', code: 'CTU', aliases: ['成都', '双流', '成都双流'] },
  { id: 'HGH.AIRPORT', city: '杭州', airport: '萧山国际机场', code: 'HGH', aliases: ['杭州', '萧山', '杭州萧山'] },
  { id: 'XIY.AIRPORT', city: '西安', airport: '咸阳国际机场', code: 'XIY', aliases: ['西安', '咸阳', '西安咸阳'] },
  { id: 'NKG.AIRPORT', city: '南京', airport: '禄口国际机场', code: 'NKG', aliases: ['南京', '禄口', '南京禄口'] },
  { id: 'KMG.AIRPORT', city: '昆明', airport: '长水国际机场', code: 'KMG', aliases: ['昆明', '长水', '昆明长水'] },
  { id: 'SYX.AIRPORT', city: '三亚', airport: '凤凰国际机场', code: 'SYX', aliases: ['三亚', '凤凰', '三亚凤凰'] },
  { id: 'HAK.AIRPORT', city: '海口', airport: '美兰国际机场', code: 'HAK', aliases: ['海口', '美兰', '海口美兰'] },
  { id: 'URC.AIRPORT', city: '乌鲁木齐', airport: '地窝堡国际机场', code: 'URC', aliases: ['乌鲁木齐', '地窝堡'] },
  { id: 'LXA.AIRPORT', city: '拉萨', airport: '贡嘎国际机场', code: 'LXA', aliases: ['拉萨', '贡嘎'] },
  { id: 'SIN.AIRPORT', city: '新加坡', airport: '樟宜机场', code: 'SIN', aliases: ['新加坡', '樟宜', 'Singapore'] },
  { id: 'BKK.AIRPORT', city: '曼谷', airport: '素万那普机场', code: 'BKK', aliases: ['曼谷', 'Bangkok'] },
  { id: 'KUL.AIRPORT', city: '吉隆坡', airport: '吉隆坡国际机场', code: 'KUL', aliases: ['吉隆坡', 'Kuala Lumpur'] },
  { id: 'NRT.AIRPORT', city: '东京', airport: '成田国际机场', code: 'NRT', aliases: ['东京', '成田', 'Tokyo'] },
  { id: 'HND.AIRPORT', city: '东京', airport: '羽田机场', code: 'HND', aliases: ['东京', '羽田', 'Tokyo Haneda'] },
  { id: 'ICN.AIRPORT', city: '首尔', airport: '仁川国际机场', code: 'ICN', aliases: ['首尔', '仁川', 'Seoul'] },
  { id: 'KIX.AIRPORT', city: '大阪', airport: '关西国际机场', code: 'KIX', aliases: ['大阪', '关西', 'Osaka'] },
  { id: 'NGO.AIRPORT', city: '名古屋', airport: '中部国际机场', code: 'NGO', aliases: ['名古屋', '中部', 'Nagoya'] },
  { id: 'FUK.AIRPORT', city: '福冈', airport: '福冈机场', code: 'FUK', aliases: ['福冈', 'Fukuoka'] },
  { id: 'HKT.AIRPORT', city: '普吉岛', airport: '普吉国际机场', code: 'HKT', aliases: ['普吉', '普吉岛', 'Phuket'] },
  { id: 'CNX.AIRPORT', city: '清迈', airport: '清迈国际机场', code: 'CNX', aliases: ['清迈', 'Chiang Mai'] },
  { id: 'DPS.AIRPORT', city: '巴厘岛', airport: '伍拉莱国际机场', code: 'DPS', aliases: ['巴厘岛', '登巴萨', 'Bali'] },
  { id: 'SIN.AIRPORT-2', city: '新加坡', airport: '樟宜机场', code: 'SIN', aliases: ['Singapore', '新加坡樟宜'] },
];
