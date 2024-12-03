import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createChart, ColorType, UTCTimestamp } from 'lightweight-charts';
import { TokenChartsProps } from '../../types/types';

// 定义时间周期类型
type TimeFrame = '1min' | '5min' | '15min' | '30min' | '1hour' | '2hour' | '4hour' | 'day';

// 生成模拟数据
const generateMockData = (period: TimeFrame) => {
    const data = [];
    const now = new Date().getTime();
    let baseMs: number;
    let count: number;
    
    // 根据周期设置时间间隔和数据点数量
    switch (period) {
        case '1min':
            baseMs = 60 * 1000;
            count = 60 * 24; // 一天的分钟数
            break;
        case '5min':
            baseMs = 5 * 60 * 1000;
            count = 12 * 24 * 5; // 5天
            break;
        case '15min':
            baseMs = 15 * 60 * 1000;
            count = 4 * 24 * 15; // 15天
            break;
        case '30min':
            baseMs = 30 * 60 * 1000;
            count = 2 * 24 * 30; // 30天
            break;
        case '1hour':
            baseMs = 60 * 60 * 1000;
            count = 24 * 30; // 30天
            break;
        case '2hour':
            baseMs = 2 * 60 * 60 * 1000;
            count = 12 * 30; // 30天
            break;
        case '4hour':
            baseMs = 4 * 60 * 60 * 1000;
            count = 6 * 30; // 30天
            break;
        case 'day':
        default:
            baseMs = 24 * 60 * 60 * 1000;
            count = 365; // 365天
            break;
    }

    let price = 100;
    let trend = 0.001;
    
    // 根据时间周期调整波动率
    const baseVolatility = 0.02;
    const timeAdjustment = Math.sqrt(baseMs / (24 * 60 * 60 * 1000));
    let volatility = baseVolatility * timeAdjustment;

    for (let i = count; i >= 0; i--) {
        const time = now - i * baseMs;
        const randomChange = (Math.random() - 0.5) * volatility;
        const trendChange = trend * (1 + (Math.random() - 0.5) * 0.5);
        
        price = price * (1 + randomChange + trendChange);
        price = Math.max(price, 0.01);

        const open = price;
        const close = price * (1 + (Math.random() - 0.5) * volatility * 0.5);
        const high = Math.max(open, close) * (1 + Math.random() * volatility * 0.5);
        const low = Math.min(open, close) * (1 - Math.random() * volatility * 0.5);
        
        const volume = Math.floor(1000 * (1 + Math.abs(randomChange) * 20));

        data.push({
            time: (Math.floor(time / 1000)) as UTCTimestamp,
            open,
            high,
            low,
            close,
            volume
        });

        if (Math.random() < 0.1) {
            trend = (Math.random() - 0.5) * 0.002;
        }
    }

    return data;
};

export const TokenCharts: React.FC<TokenChartsProps> = ({ token }) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const [timeFrame, setTimeFrame] = useState<TimeFrame>('day');
    const chart = useRef<any>(null);
    const candlestickSeries = useRef<any>(null);
    const volumeSeries = useRef<any>(null);
    const baseData = useRef<any[]>([]);
    const timeFrameData = useRef<Record<TimeFrame, any[]>>({
        '1min': [],
        '5min': [],
        '15min': [],
        '30min': [],
        '1hour': [],
        '2hour': [],
        '4hour': [],
        'day': []
    });

    // 获取默认显示的K线数量
    const getVisibleBarsCount = (tf: TimeFrame) => {
        switch (tf) {
            case '1min': return 240;  // 4小时
            case '5min': return 144;  // 12小时
            case '15min': return 96;  // 24小时
            case '30min': return 48;  // 24小时
            case '1hour': return 24;  // 1天
            case '2hour': return 48;  // 4天
            case '4hour': return 42;  // 7天
            case 'day': return 90;    // 3个月
        }
    };

    // 获取时间周期的分钟数
    const getTimeFrameMinutes = (tf: TimeFrame): number => {
        switch (tf) {
            case '1min': return 1;
            case '5min': return 5;
            case '15min': return 15;
            case '30min': return 30;
            case '1hour': return 60;
            case '2hour': return 120;
            case '4hour': return 240;
            case 'day': return 1440;
        }
    };

    // 合并K线数据
    const aggregateCandles = (data: any[], timeFrameMinutes: number) => {
        if (!data.length) return [];
        
        const result = [];
        let currentCandle: any = null;
        
        for (const candle of data) {
            const candleTime = candle.time;
            const periodTime = candleTime - (candleTime % (timeFrameMinutes * 60));
            
            if (!currentCandle || currentCandle.time !== periodTime) {
                if (currentCandle) {
                    result.push(currentCandle);
                }
                currentCandle = {
                    time: periodTime,
                    open: candle.open,
                    high: candle.high,
                    low: candle.low,
                    close: candle.close,
                    volume: candle.volume
                };
            } else {
                currentCandle.high = Math.max(currentCandle.high, candle.high);
                currentCandle.low = Math.min(currentCandle.low, candle.low);
                currentCandle.close = candle.close;
                currentCandle.volume += candle.volume;
            }
        }

        if (currentCandle) {
            result.push(currentCandle);
        }

        return result;
    };

    // 生成所有时间周期的数据
    const generateAllTimeFrameData = () => {
        // 生成基础1分钟数据
        baseData.current = generateMockData('1min');
        timeFrameData.current['1min'] = baseData.current;

        // 生成其他时间周期的数据
        const timeFrames: TimeFrame[] = ['5min', '15min', '30min', '1hour', '2hour', '4hour', 'day'];
        timeFrames.forEach(tf => {
            const minutes = getTimeFrameMinutes(tf);
            timeFrameData.current[tf] = aggregateCandles(baseData.current, minutes);
        });
    };

    // 更新图表数据
    const updateChartData = useCallback(() => {
        if (!chart.current || !timeFrameData.current[timeFrame].length) return;

        const data = timeFrameData.current[timeFrame];
        
        if (candlestickSeries.current) {
            candlestickSeries.current.setData(data);
        }
        
        if (volumeSeries.current) {
            volumeSeries.current.setData(data.map(item => ({
                time: item.time,
                value: item.volume,
                color: item.close >= item.open ? '#26a69a' : '#ef5350'
            })));
        }

        // 设置可见范围
        const visibleBars = getVisibleBarsCount(timeFrame);
        const timeScale = chart.current.timeScale();
        
        // 先确保所有数据都加载完成
        timeScale.fitContent();
        
        // 然后设置可见范围
        const coordRange = timeScale.getVisibleLogicalRange();
        if (coordRange !== null) {
            const newRange = {
                from: coordRange.to - visibleBars,
                to: coordRange.to
            };
            timeScale.setVisibleLogicalRange(newRange);
        }
    }, [timeFrame]);

    // 初始化图表
    useEffect(() => {
        if (!chartContainerRef.current) return;

        // 生成所有时间周期的数据
        generateAllTimeFrameData();

        chart.current = createChart(chartContainerRef.current, {
            layout: {
                background: { color: 'transparent' },
                textColor: '#DDD',
            },
            grid: {
                vertLines: { color: '#2B2B43' },
                horzLines: { color: '#2B2B43' },
            },
            width: chartContainerRef.current.clientWidth,
            height: 400,
            leftPriceScale: {
                visible: true,
                borderColor: '#2B2B43',
                textColor: '#DDD',
                scaleMargins: {
                    top: 0.1,
                    bottom: 0.3,
                },
            },
            rightPriceScale: {
                visible: true,
                borderColor: '#2B2B43',
                textColor: '#DDD',
                scaleMargins: {
                    top: 0.1,
                    bottom: 0.3,
                },
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: timeFrame === '1min',
                rightOffset: 12,
                barSpacing: 12,
                fixLeftEdge: true,
                lockVisibleTimeRangeOnResize: true,
                rightBarStaysOnScroll: true,
                borderVisible: true,
                borderColor: '#2B2B43',
            },
            crosshair: {
                mode: 1,
                vertLine: {
                    color: '#758696',
                    width: 1,
                    style: 3,
                    labelBackgroundColor: '#758696',
                },
                horzLine: {
                    color: '#758696',
                    width: 1,
                    style: 3,
                    labelBackgroundColor: '#758696',
                },
            },
        });

        // 添加K线图
        candlestickSeries.current = chart.current.addCandlestickSeries({
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderVisible: false,
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
            priceScaleId: 'right',
            priceFormat: {
                type: 'price',
                precision: 6,
                minMove: 0.000001,
            },
        });

        // 添加成交量图
        volumeSeries.current = chart.current.addHistogramSeries({
            color: '#26a69a',
            priceFormat: {
                type: 'volume',
                precision: 0,
            },
            priceScaleId: 'volume',
        });

        // 配置成交量的价格轴
        chart.current.priceScale('volume').applyOptions({
            scaleMargins: {
                top: 0.8,
                bottom: 0,
            },
            visible: true,
            autoScale: true,
            borderVisible: true,
            borderColor: '#2B2B43',
            textColor: '#DDD',
            alignLabels: true,
            priceFormat: {
                type: 'volume',
                precision: 0,
                minMove: 1,
            },
        });

        // 初始化数据
        updateChartData();

        // 响应式处理
        const handleResize = () => {
            if (chartContainerRef.current && chart.current) {
                chart.current.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (chart.current) {
                chart.current.remove();
            }
        };
    }, []);

    // 当时间周期改变时更新数据
    useEffect(() => {
        updateChartData();
    }, [timeFrame, updateChartData]);

    const timeFrames: TimeFrame[] = ['1min', '5min', '15min', '30min', '1hour', '2hour', '4hour', 'day'];

    return (
        <div className="mt-6">
            <div className="bg-base-200 rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-base-content">Price History</h2>
                    <div className="flex flex-wrap gap-2">
                        {timeFrames.map((tf) => (
                            <button
                                key={tf}
                                onClick={() => setTimeFrame(tf)}
                                className={`px-3 py-1 rounded text-sm transition-colors ${
                                    timeFrame === tf
                                        ? 'bg-primary text-primary-content'
                                        : 'bg-base-300 text-base-content hover:bg-base-100'
                                }`}
                            >
                                {tf}
                            </button>
                        ))}
                    </div>
                </div>
                <div ref={chartContainerRef} className="h-[400px]" />
            </div>
        </div>
    );
};
