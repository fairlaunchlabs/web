import React, { useRef, useState, useEffect, useCallback } from 'react';
import { createChart, UTCTimestamp } from 'lightweight-charts';
import { useQuery } from '@apollo/client';
import { queryAllTokenMintForChart } from '../../utils/graphql';
import { formatPrice, processRawData } from '../../utils/format';
import { TokenChartsProps } from '../../types/types';
import { useTheme } from '../../utils/contexts';

// 定义时间周期类型
type TimeFrame = '1min' | '5min' | '15min' | '30min' | '1hour' | '2hour' | '4hour' | 'day';

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

    // 清理和初始化图表
    const cleanupAndInitChart = useCallback(() => {
        if (chart.current) {
            chart.current.remove();
            chart.current = null;
        }

        if (!chartContainerRef.current) return;
        console.log("cleanupAndInitChart start");
        const handleResize = () => {
            if (chart.current && chartContainerRef.current) {
                chart.current.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                    height: 560,
                });
            }
        };

        chartContainerRef.current.innerHTML = '';

        chart.current = createChart(chartContainerRef.current, {
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
            width: chartContainerRef.current.clientWidth,
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

        // 添加K线图或折线图
        if (isLineChart) {
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

        // 添加成交量图
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

        // 添加K线数据提示
        chart.current.subscribeCrosshairMove((param: any) => {
            if (!tooltipRef.current || !chartContainerRef.current) return;
            
            if (param.time && param.point && param.point.x >= 0 && param.point.y >= 0) {
                const price = param.seriesData.get(series.current);
                const volume = param.seriesData.get(volumeSeries.current);
                const time = new Date(param.time * 1000).toLocaleString();
                
                if (price) {
                    let tooltipContent = '';
                    if (isLineChart) {
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

        // 更新数据
        if (timeFrameData.current[timeFrame].length > 0) {
            updateChartData();
        }

        window.addEventListener('resize', handleResize);
        console.log("cleanupAndInitChart end");

        return () => {
            window.removeEventListener('resize', handleResize);
            if (chart.current) {
                chart.current.remove();
                chart.current = null;
            }
        };
    }, [isDarkMode, gridColor, labelColor, timeFrame, isLineChart]);

    // 组件挂载时初始化图表
    useEffect(() => {
        return cleanupAndInitChart();
    }, [cleanupAndInitChart, isDarkMode]);

    // 查询图表数据
    const { loading, error, data } = useQuery(queryAllTokenMintForChart, {
        variables: {
            skip: 0,
            first: 1000, // 根据需要调整
            mint: token?.mint
        }
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
    const generateAllTimeFrameData = useCallback(() => {
        if (!data?.mintTokenEntities || !token?.feeRate) return;

        // 处理原始数据生成基础数据
        baseData.current = processRawData(data.mintTokenEntities, parseFloat(token.feeRate));
        timeFrameData.current['1min'] = baseData.current;

        // 生成其他时间周期的数据
        const timeFrames: TimeFrame[] = ['5min', '15min', '30min', '1hour', '2hour', '4hour', 'day'];
        timeFrames.forEach(tf => {
            const minutes = getTimeFrameMinutes(tf);
            timeFrameData.current[tf] = aggregateCandles(baseData.current, minutes);
        });

        // 更新图表数据
        updateChartData();
    }, [data, token]);

    // 在数据加载完成后生成图表数据
    useEffect(() => {
        if (!loading && data) {
            generateAllTimeFrameData();
        }
    }, [loading, data, generateAllTimeFrameData]);

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
            console.log(lineData);
            series.current.setData(lineData); // ######
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
        console.log("updateChartData end");
    }, [timeFrame, isLineChart]);

    // 切换图表类型
    const toggleChartType = useCallback(() => {
        if (!chart.current) return;
        console.log("toggleChartType start");
        // 移除现有的系列
        if (series.current) {
            chart.current.removeSeries(series.current);
        }

        const newIsLineChart = !isLineChart;

        // 创建新的系列
        if (newIsLineChart) {
            // 创建折线图
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
            // 创建K线图
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

        // 更新数据
        // updateChartData(); // ######
        
        // 切换状态
        setIsLineChart(newIsLineChart);

        // 重新设置crosshairMove事件
        chart.current.subscribeCrosshairMove((param: any) => {
            if (!tooltipRef.current || !chartContainerRef.current) return;
            
            if (param.time && param.point && param.point.x >= 0 && param.point.y >= 0) {
                const price = param.seriesData.get(series.current);
                const volume = param.seriesData.get(volumeSeries.current);
                const time = new Date(param.time * 1000).toLocaleString();
                
                if (price) {
                    let tooltipContent = '';
                    if (newIsLineChart) {
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
        console.log("toggleChartType end");
    }, [isLineChart, updateChartData]);

    // 初始化图表
    useEffect(() => {
        if (!chartContainerRef.current) return;

        if (error) {
            // 如果有错误，显示错误信息
            chartContainerRef.current.innerHTML = `
                <div class="flex items-center justify-center w-full h-full min-h-[400px] text-red-500">
                    <div class="text-center">
                        <div class="text-lg font-medium mb-2">Failed to load chart data</div>
                        <div class="text-sm opacity-75">Please try again later</div>
                    </div>
                </div>
            `;
            return;
        }

        if (loading) {
            // 显示加载状态
            chartContainerRef.current.innerHTML = `
                <div class="flex items-center justify-center w-full h-full min-h-[400px] text-gray-400">
                    <div class="text-center">
                        <div class="text-lg font-medium mb-2">Loading chart data...</div>
                        <div class="text-sm opacity-75">Please wait</div>
                    </div>
                </div>
            `;
            return;
        }

        // 清除任何现有内容
        chartContainerRef.current.innerHTML = '';

        chart.current = createChart(chartContainerRef.current, {
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
            width: chartContainerRef.current.clientWidth,
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

        // 添加K线图或折线图
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

        // 添加成交量图
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

        // 添加K线数据提示
        chart.current.subscribeCrosshairMove((param: any) => {
            if (!tooltipRef.current || !chartContainerRef.current) return;
            
            if (param.time && param.point && param.point.x >= 0 && param.point.y >= 0) {
                const price = param.seriesData.get(series.current);
                const volume = param.seriesData.get(volumeSeries.current);
                const time = new Date(param.time * 1000).toLocaleString();
                
                if (price) {
                    let tooltipContent = '';
                    if (isLineChart) {
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

        // 初始化数据
        updateChartData();

        // 响应式处理
        const handleResize = () => {
            if (chart.current && chartContainerRef.current) {
                chart.current.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                    height: 560,
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
    }, [error, loading]);

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
