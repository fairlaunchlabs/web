import React, { useRef, useState, useEffect, useCallback } from 'react';
import { createChart, UTCTimestamp } from 'lightweight-charts';
import { useLazyQuery } from '@apollo/client';
import { queryAllTokenMintForChart } from '../../utils/graphql';
import { formatPrice, processRawData } from '../../utils/format';
import { TokenChartsProps } from '../../types/types';
import { useTheme } from '../../utils/contexts';
import { LOCAL_STORAGE_HISTORY_CACHE_EXPIRY, LOCAL_STORAGE_HISTORY_CACHE_PREFIX } from '../../config/constants';

// 定义时间周期类型
type TimeFrame = '1min' | '5min' | '15min' | '30min' | '1hour' | '2hour' | '4hour' | 'day';

// 时间周期选项
const timeFrameOptions = [
    { value: '1min', label: '1 Minute' },
    { value: '5min', label: '5 Minutes' },
    { value: '15min', label: '15 Minutes' },
    { value: '30min', label: '30 Minutes' },
    { value: '1hour', label: '1 Hour' },
    { value: '2hour', label: '2 Hours' },
    { value: '4hour', label: '4 Hours' },
    { value: 'day', label: '1 Day' },
];

export const TokenCharts: React.FC<TokenChartsProps> = ({ token }) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const [timeFrame, setTimeFrame] = useState<TimeFrame>('5min');
    const [isLineChart, setIsLineChart] = useState(false);
    const chart = useRef<any>(null);
    const series = useRef<any>(null);
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
    const tooltipRef = useRef<HTMLDivElement>(null);
    
    // 使用ThemeContext
    const { isDarkMode } = useTheme();

    // 根据主题设置颜色
    const gridColor = isDarkMode ? 'rgba(70, 130, 180, 0.2)' : 'rgba(70, 130, 180, 0.1)';
    const labelColor = isDarkMode ? '#DDD' : '#333';

    const addChart = (_isLineChart: boolean) => {
        if (_isLineChart) {
            series.current = chart.current.addLineSeries({
                color: '#2196F3',
                lineWidth: 2,
                priceScaleId: 'right',
                priceFormat: {
                    type: 'custom',
                    formatter: (price: number) => formatPrice(price),
                },
                lastValueVisible: true,
                priceLineVisible: true,
                title: 'Price',
                crosshairMarkerVisible: true,
                crosshairMarkerRadius: 4,
                crosshairMarkerBorderColor: '#2196F3',
                crosshairMarkerBackgroundColor: '#ffffff',
            });
        } else {
            series.current = chart.current.addCandlestickSeries({
                upColor: '#26a69a',
                downColor: '#ef5350',
                borderVisible: false,
                wickUpColor: '#26a69a',
                wickDownColor: '#ef5350',
                priceScaleId: 'right',
                priceFormat: {
                    type: 'custom',
                    formatter: (price: number) => formatPrice(price),
                },
                lastValueVisible: true,
                priceLineVisible: true,
                title: 'Price',
            });
        }        
    }

    const createMainChart = (chartRef: HTMLDivElement) => {
        chart.current = createChart(chartRef, {
            layout: {
                background: { color: 'transparent' },
                textColor: '#DDD',
            },
            grid: {
                vertLines: {
                    color: gridColor,
                    style: 1,
                },
                horzLines: {
                    color: gridColor,
                    style: 1,
                },
            },
            width: chartRef.clientWidth,
            height: 560,
            leftPriceScale: {
                visible: false,
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
                textColor: labelColor,
                scaleMargins: {
                    top: 0.1,
                    bottom: 0.3,
                },
                borderVisible: true,
                alignLabels: true,
                autoScale: true,
                mode: 2,
                ticksVisible: true,
                entireTextOnly: true,
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: timeFrame === '1min',
                rightOffset: 5,
                barSpacing: 12,
                fixLeftEdge: true,
                fixRightEdge: true,
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
            localization: {
                locale: 'en-US',
                timeFormatter: (time: number) => {
                    const date = new Date(time * 1000);
                    return date.toLocaleString();
                },
                priceFormatter: (price: number) => {
                    return formatPrice(price);
                }
            },
            handleScroll: {
                mouseWheel: true,
                pressedMouseMove: true,
                horzTouchDrag: true,
                vertTouchDrag: true
            },
            handleScale: {
                mouseWheel: true,
                pinch: true,
                axisPressedMouseMove: {
                    time: true,
                    price: true
                }
            },
        });
    }

    const subscribeCrosshairMove = (_isLineChart: boolean) => {
        chart.current.subscribeCrosshairMove((param: any) => {
            if (!tooltipRef.current || !chartContainerRef.current) return;
            
            if (param.time && param.point && param.point.x >= 0 && param.point.y >= 0) {
                const price = param.seriesData.get(series.current);
                const volume = param.seriesData.get(volumeSeries.current);
                const time = new Date(param.time * 1000).toLocaleString();
                
                if (price) {
                    let tooltipContent = '';
                    if (_isLineChart) {
                        tooltipContent = `
                            <div class="space-y-1">
                                <div class="font-medium">${time}</div>
                                <div>Price: ${formatPrice(price.value || 0)}</div>
                                <div>Vol: ${volume?.value?.toLocaleString() || '0'}</div>
                            </div>
                        `;
                    } else {
                        tooltipContent = `
                            <div class="space-y-1">
                                <div class="font-medium">${time}</div>
                                <div class="grid grid-cols-1 gap-x-4">
                                    <div>Open: ${formatPrice(price.open || 0)}</div>
                                    <div>High: ${formatPrice(price.high || 0)}</div>
                                    <div>Low: ${formatPrice(price.low || 0)}</div>
                                    <div>Close: ${formatPrice(price.close || 0)}</div>
                                    <div>Vol: ${volume?.value?.toLocaleString() || '0'}</div>
                                </div>
                            </div>
                        `;
                    }
                    
                    tooltipRef.current.innerHTML = tooltipContent;
                    tooltipRef.current.style.display = 'block';
                    
                    // 计算tooltip位置
                    const container = chartContainerRef.current.getBoundingClientRect();
                    const tooltipWidth = tooltipRef.current.offsetWidth;
                    const tooltipHeight = tooltipRef.current.offsetHeight;
                    
                    // 确保tooltip不会超出容器边界
                    let left = param.point.x;
                    let top = param.point.y;
                    
                    if (left + tooltipWidth > container.width) {
                        left = param.point.x - tooltipWidth;
                    }
                    
                    if (top + tooltipHeight > container.height) {
                        top = param.point.y - tooltipHeight;
                    }
                    
                    tooltipRef.current.style.transform = `translate(${left}px, ${top}px)`;
                }
            } else {
                tooltipRef.current.style.display = 'none';
            }
        });
    }

    const addHistogramSeries = () => {
        volumeSeries.current = chart.current.addHistogramSeries({
            color: '#26a69a',
            priceFormat: {
                type: 'volume',
                precision: 0,
            },
            priceScaleId: 'volume',
            lastValueVisible: true,
            priceLineVisible: true,
            title: 'Volume',
        });
    }

    const initializeChart = (chartRef: HTMLDivElement) => {
        chartRef.innerHTML = '';

        createMainChart(chartRef);

        // 添加K线图或折线图
        addChart(isLineChart);

        // 添加成交量图
        addHistogramSeries();

        // 配置成交量的价格轴
        applyOptions();

        // 添加K线数据提示
        subscribeCrosshairMove(isLineChart);

        // 更新数据
        if (timeFrameData.current[timeFrame].length > 0) {
            updateChartData();
        }

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (chart.current) {
                chart.current.remove();
                chart.current = null;
            }
        };
    }

    const handleResize = () => {
        if (chart.current && chartContainerRef.current) {
            chart.current.applyOptions({
                width: chartContainerRef.current.clientWidth,
                height: 560,
            });
        }
    };

    const applyOptions = () => {
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
    }

    // 缓存相关的常量和工具函数
    const getCacheKey = (mint: string, timeFrame: string) => `${LOCAL_STORAGE_HISTORY_CACHE_PREFIX}${mint}_${timeFrame}`;

    const getCachedData = (mint: string, timeFrame: string) => {
        try {
            const cacheKey = getCacheKey(mint, timeFrame);
            const cached = localStorage.getItem(cacheKey);
            if (!cached) return null;

            const { data, timestamp } = JSON.parse(cached);
            
            // 检查缓存是否过期
            if (Date.now() - timestamp > LOCAL_STORAGE_HISTORY_CACHE_EXPIRY) {
                localStorage.removeItem(cacheKey);
                return null;
            }

            return data;
        } catch (err) {
            console.error('Error reading cache:', err);
            return null;
        }
    };

    const setCachedData = (mint: string, timeFrame: string, data: any[]) => {
        try {
            const cacheKey = getCacheKey(mint, timeFrame);
            const cacheData = {
                data,
                timestamp: Date.now()
            };
            localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        } catch (err) {
            console.error('Error setting cache:', err);
        }
    };

    // 使用useLazyQuery替代useQuery
    const [fetchMintData, { loading, error }] = useLazyQuery(queryAllTokenMintForChart, {
        onCompleted: (data) => {
            if (data?.mintTokenEntities && token?.mint) {
                // 保存数据到缓存
                setCachedData(token.mint, timeFrame, data.mintTokenEntities);
                // 处理获取到的数据
                processAndUpdateData(data.mintTokenEntities);
            }
        }
    });

    // 处理和更新数据的函数
    const processAndUpdateData = useCallback((mintTokenEntities: any[]) => {
        if (!token?.feeRate) return;

        try {
            // 处理数据
            baseData.current = processRawData(mintTokenEntities, parseFloat(token.feeRate));
            timeFrameData.current['1min'] = baseData.current;

            // 生成其他时间周期的数据
            const timeFrames: TimeFrame[] = ['5min', '15min', '30min', '1hour', '2hour', '4hour', 'day'];
            timeFrames.forEach(tf => {
                const minutes = getTimeFrameMinutes(tf);
                timeFrameData.current[tf] = aggregateCandles(baseData.current, minutes);
            });

            // 更新图表数据
            updateChartData();
        } catch (err) {
            console.error('Error processing data:', err);
        }
    }, [token?.feeRate]);

    // 获取数据的函数
    const loadData = useCallback(async () => {
        if (!token?.mint) return;

        try {
            // 尝试从缓存获取数据
            const cachedData = getCachedData(token.mint, timeFrame);
            
            if (cachedData) {
                // 如果有缓存数据，直接使用
                console.log('Using cached data...');
                processAndUpdateData(cachedData);
            } else {
                // 如果没有缓存数据，从GraphQL获取
                console.log('Fetching data from GraphQL...');
                fetchMintData({
                    variables: {
                        skip: 0,
                        first: 1000,
                        mint: token.mint
                    }
                });
            }
        } catch (err) {
            console.error('Error loading data:', err);
        }
    }, [token?.mint, timeFrame, fetchMintData, processAndUpdateData]);

    // 监听token或timeFrame变化时加载数据
    useEffect(() => {
        loadData();
    }, [loadData]);

    // 显示加载状态或错误
    useEffect(() => {
        if (loading) {
            if (chartContainerRef.current) {
                chartContainerRef.current.innerHTML = `
                    <div class="flex items-center justify-center h-[560px]">
                        <div class="text-base-content">Loading chart data...</div>
                    </div>
                `;
            }
        } else if (error) {
            if (chartContainerRef.current) {
                chartContainerRef.current.innerHTML = `
                    <div class="flex items-center justify-center h-[560px]">
                        <div class="text-error">Error loading chart data: ${error.message}</div>
                    </div>
                `;
            }
        }
    }, [loading, error]);

    // 清理和初始化图表
    const cleanupAndInitChart = useCallback(() => {
        if (chart.current) {
            chart.current.remove();
            chart.current = null;
        }

        if (!chartContainerRef.current) return;
        initializeChart(chartContainerRef.current);
    }, [isDarkMode, gridColor, labelColor, timeFrame, isLineChart]);

    // 组件挂载时初始化图表
    useEffect(() => {
        return cleanupAndInitChart();
    }, [cleanupAndInitChart, isDarkMode]);

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

    // 更新图表数据
    const updateChartData = useCallback(() => {
        if (!chart.current || !timeFrameData.current[timeFrame].length || !series.current) return;

        const data = timeFrameData.current[timeFrame];

        if (isLineChart) {
            // 转换为折线图数据
            const lineData = data.map(item => ({
                time: item.time as UTCTimestamp,
                value: Number(item.close),
            }));
            series.current.setData(lineData);
        } else {
            // K线图数据
            series.current.setData(data);
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
        const lastIndex = data.length - 1;
        
        timeScale.scrollToPosition(5, false);
        timeScale.setVisibleLogicalRange({
            from: lastIndex - visibleBars,
            to: lastIndex + 5
        });
    }, [timeFrame, isLineChart]);

    // 切换图表类型
    const toggleChartType = useCallback(() => {
        if (!chart.current) return;
        // 移除现有的系列
        if (series.current) {
            chart.current.removeSeries(series.current);
        }

        const newIsLineChart = !isLineChart;

        // 创建新的系列
        addChart(newIsLineChart);

        // 更新数据
        updateChartData();
        
        // 切换状态
        setIsLineChart(newIsLineChart);

        // 重新设置crosshairMove事件
        subscribeCrosshairMove(newIsLineChart);
    }, [isLineChart, updateChartData]);

    return (
        <div className="mt-6">
            <div className="bg-base-200 rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-base-content">Price History</h2>
                    <div className="flex items-center gap-4">
                        <button
                            className="btn btn-sm btn-outline"
                            onClick={toggleChartType}
                        >
                            {isLineChart ? 'K-Line' : 'Dot-Line'}
                        </button>
                        <select
                            value={timeFrame}
                            onChange={(e) => setTimeFrame(e.target.value as TimeFrame)}
                            className="select select-bordered select-sm w-40 bg-base-300 text-base-content"
                        >
                            {timeFrameOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="relative">
                    <div ref={chartContainerRef} className="w-full" />
                    <div
                        ref={tooltipRef}
                        className="absolute hidden text-sm bg-base-300/90 p-2 rounded shadow-lg text-base-content/90 pointer-events-none z-50"
                        style={{ left: '12px', top: '12px' }}
                    />
                </div>
            </div>
        </div>
    );
};
