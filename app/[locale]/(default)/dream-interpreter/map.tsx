'use client';
import { booleanPointInPolygon, point } from '@turf/turf';
import { FeatureCollection, MultiPolygon } from 'geojson';
import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { feature } from 'topojson-client';

// 使用一个公开可用的GeoJSON数据源
const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// 城市数据类型定义
interface CityData {
  name: string;
  coordinates: [number, number]; // 经纬度坐标
  userCount: number;
  bubbleSize: number;
  baseUsers?: number; // 可选，仅用于主要城市
}

// 主要城市数据
const majorCities: Array<Omit<CityData, 'userCount' | 'bubbleSize'> & { baseUsers: number }> = [
  { name: 'Beijing', coordinates: [116.4074, 39.9042] as [number, number], baseUsers: 2800 },
  { name: 'Shanghai', coordinates: [121.4737, 31.2304] as [number, number], baseUsers: 2600 },
  { name: 'New York', coordinates: [-74.006, 40.7128] as [number, number], baseUsers: 2200 },
  { name: 'Tokyo', coordinates: [139.6917, 35.6895] as [number, number], baseUsers: 2400 },
  { name: 'London', coordinates: [-0.1278, 51.5074] as [number, number], baseUsers: 1800 },
  { name: 'Paris', coordinates: [2.3522, 48.8566] as [number, number], baseUsers: 1500 },
  { name: 'Mumbai', coordinates: [72.8777, 19.076] as [number, number], baseUsers: 2000 },
  { name: 'Sao Paulo', coordinates: [-46.6333, -23.5505] as [number, number], baseUsers: 1600 },
  { name: 'Cairo', coordinates: [31.2357, 30.0444] as [number, number], baseUsers: 1400 },
  { name: 'Sydney', coordinates: [151.2093, -33.8688] as [number, number], baseUsers: 1200 },
  { name: 'Moscow', coordinates: [37.6173, 55.7558] as [number, number], baseUsers: 1700 },
  { name: 'Los Angeles', coordinates: [-118.2437, 34.0522] as [number, number], baseUsers: 1300 },
  { name: 'Mexico City', coordinates: [-99.1332, 19.4326] as [number, number], baseUsers: 1100 },
  { name: 'Lagos', coordinates: [3.3792, 6.5244] as [number, number], baseUsers: 900 },
  { name: 'Bangkok', coordinates: [100.5018, 13.7563] as [number, number], baseUsers: 1000 },
];

// 检查坐标是否在陆地上
const isPointOnLand = (coordinates: [number, number], geographies: any[]): boolean => {
  const [longitude, latitude] = coordinates;
  const checkPoint = point([longitude, latitude]);

  return geographies.some(geo => {
    try {
      return booleanPointInPolygon(checkPoint, geo.geometry);
    } catch {
      return false;
    }
  });
};

// 生成随机陆地坐标
const generateLandCoordinate = (geographies: any[]): [number, number] => {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    // 随机经度 (-180 到 180)
    const lng = parseFloat((Math.random() * 360 - 180).toFixed(4));
    // 随机纬度，避免太靠近极点 (-65 到 65)
    const lat = parseFloat((Math.random() * 130 - 65).toFixed(4));

    if (isPointOnLand([lng, lat], geographies)) {
      return [lng, lat];
    }
    attempts++;
  }

  // 如果找不到合适的点，返回一个主要城市附近的点
  const randomCity = majorCities[Math.floor(Math.random() * majorCities.length)];
  const [cityLng, cityLat] = randomCity.coordinates;
  return [cityLng + (Math.random() * 2 - 1), cityLat + (Math.random() * 2 - 1)];
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const WorldMap = () => {
  const [position, setPosition] = useState({ coordinates: [0, 20] as [number, number], zoom: 1 });
  const [userData, setUserData] = useState<CityData[]>([]);
  const [hoveredCity, setHoveredCity] = useState<CityData | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 800, height: 450 });
  const locale = useLocale();

  // 监听窗口大小变化，调整地图尺寸
  useEffect(() => {
    const handleResize = () => {
      const container = document.getElementById('map-container');
      if (container) {
        const width = container.clientWidth;
        // 保持宽高比，根据宽度计算高度
        const height = Math.min(450, width * 0.56);
        setDimensions({ width, height });
      }
    };

    // 初始化
    handleResize();

    // 监听窗口大小变化
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // 获取地理数据后再生成用户数据
    fetch(geoUrl)
      .then(response => response.json())
      .then((worldData: any) => {
        const result = feature(worldData, worldData.objects.countries);
        const geos = (result as unknown as FeatureCollection<MultiPolygon>).features;

        // 生成小城市数据
        const smallCities: CityData[] = Array.from({ length: 150 }, () => {
          const coordinates = generateLandCoordinate(geos);
          const userCount = Math.floor(50 + Math.random() * 500);
          const bubbleSize = Math.sqrt(userCount) / 20;

          return {
            name: '',
            coordinates,
            userCount,
            bubbleSize: Math.max(1, Math.min(7, bubbleSize)),
          };
        });

        // 合并主要城市和小城市数据
        const data = [
          ...majorCities.map(city => ({
            ...city,
            userCount: Math.floor(city.baseUsers * (0.8 + Math.random() * 0.4)),
            bubbleSize: Math.max(4, Math.min(25, Math.sqrt(city.baseUsers) / 40)),
          })),
          ...smallCities,
        ];

        setUserData(data);
        setTotalUsers(data.reduce((sum, city) => sum + city.userCount, 0));
      });

    // 模拟实时数据更新
    const interval = setInterval(() => {
      setUserData(prevData =>
        prevData.map(city => ({
          ...city,
          userCount: city.userCount + Math.floor(Math.random() * 10),
          bubbleSize: city.name ? Math.max(4, Math.min(25, Math.sqrt(city.userCount + Math.floor(Math.random() * 10)) / 40)) : city.bubbleSize,
        }))
      );

      setTotalUsers(prev => prev + Math.floor(Math.random() * 100));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleZoomIn = () => {
    if (position.zoom >= 4) return;
    setPosition(pos => ({ ...pos, zoom: pos.zoom * 1.5 }));
  };

  const handleZoomOut = () => {
    if (position.zoom <= 1) return;
    setPosition(pos => ({ ...pos, zoom: pos.zoom / 1.5 }));
  };

  const handleMoveEnd = (position: any) => {
    setPosition(position);
  };

  return (
    <div id="map-container" className="w-full overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-sm">
      <div className="flex flex-wrap justify-between items-center p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-1 mb-2 sm:mb-0">
          <button className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-medium py-1 px-2 rounded" onClick={handleZoomIn} aria-label={locale === 'zh' ? '放大' : 'Zoom in'}>
            +
          </button>
          <button className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-medium py-1 px-2 rounded" onClick={handleZoomOut} aria-label={locale === 'zh' ? '缩小' : 'Zoom out'}>
            -
          </button>
        </div>
        <div className="text-gray-700 dark:text-gray-200 text-sm font-medium">{locale === 'zh' ? '全球活跃用户' : 'Global Active Users'}: 3.4K</div>
      </div>

      <div className="bg-sky-50 dark:bg-gray-900 relative">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: Math.min(150, dimensions.width / 6),
          }}
          width={dimensions.width}
          height={dimensions.height}
        >
          <ZoomableGroup zoom={position.zoom} center={position.coordinates} onMoveEnd={handleMoveEnd}>
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map(geo => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    style={{
                      default: {
                        fill: '#D6D6DA',
                        outline: 'none',
                        stroke: '#FFFFFF',
                        strokeWidth: 0.5,
                      },
                      hover: {
                        fill: '#D6D6DA',
                        outline: 'none',
                        stroke: '#FFFFFF',
                        strokeWidth: 0.5,
                      },
                      pressed: {
                        fill: '#D6D6DA',
                        outline: 'none',
                      },
                    }}
                  />
                ))
              }
            </Geographies>

            {userData.map((city, index) => (
              <Marker key={`${city.name}-${index}`} coordinates={city.coordinates} onMouseEnter={() => city.name && setHoveredCity(city)} onMouseLeave={() => setHoveredCity(null)}>
                <circle
                  r={Math.max(1, city.bubbleSize * (dimensions.width / 800))}
                  fill="#6366f1" // Indigo-500 color
                  fillOpacity={0.7}
                  stroke="#FFFFFF"
                  strokeWidth={0.5}
                >
                  <animate
                    attributeName="r"
                    from={Math.max(1, (city.bubbleSize - 1) * (dimensions.width / 800))}
                    to={Math.max(1, (city.bubbleSize + 1) * (dimensions.width / 800))}
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                  <animate attributeName="fillOpacity" from="0.7" to="0.4" dur="1.5s" repeatCount="indefinite" />
                </circle>
                {city.name && dimensions.width > 500 && (
                  <text
                    textAnchor="middle"
                    y={-Math.max(1, city.bubbleSize * (dimensions.width / 800)) - 5}
                    style={{
                      fontFamily: 'system-ui',
                      fill: '#5D5A6D',
                      fontSize: `${Math.max(8, 10 * (dimensions.width / 800))}px`,
                      fontWeight: 'bold',
                      pointerEvents: 'none',
                    }}
                  >
                    {city.name}
                  </text>
                )}
              </Marker>
            ))}
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {hoveredCity && (
        <div className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-md absolute z-10 bottom-2 left-2">
          <div className="font-bold text-sm">{hoveredCity.name}</div>
          <div className="text-sm">
            {locale === 'zh' ? '活跃用户' : 'Active Users'}: {formatNumber(hoveredCity.userCount)}
          </div>
        </div>
      )}

      <div className="p-2 text-gray-500 dark:text-gray-400 text-xs">
        * {locale === 'zh' ? '气泡大小表示用户数量，数据每3秒自动更新' : 'Bubble size represents user count, data updates every 3 seconds'}
      </div>
    </div>
  );
};

export default WorldMap;
