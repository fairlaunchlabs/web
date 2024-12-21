import React, { useRef, useState, useEffect } from 'react';
import { createChart, UTCTimestamp } from 'lightweight-charts';
import { useLazyQuery } from '@apollo/client';
import { queryAllTokenMintForChart } from '../../utils/graphql';
import { formatPrice, processRawData } from '../../utils/format';
import { TokenChartsProps } from '../../types/types';
import { useTheme } from '../../utils/contexts';
import { ErrorBox } from '../common/ErrorBox';
import { LOCAL_STORAGE_HISTORY_CACHE_EXPIRY, LOCAL_STORAGE_HISTORY_CACHE_PREFIX } from '../../config/constants';

type TimeFrame = '1min' | '5min' | '15min' | '30min' | '1hour' | '2hour' | '4hour' | 'day';

const USE_CACHE = false; // TODO: 先都从GraphQL加载，以后再优化Cache

const timeFrameDatas = {
    "1min": {
        label: "1 Minute",
        bars: 240,
        minutes: 1,
    },
    "5min": {
        label: "5 Minutes",
        bars: 144,
        minutes: 5,
    },
    "15min": {
        label: "15 Minutes",
        bars: 96,
        minutes: 15,
    },
    "30min": {
        label: "30 Minutes",
        bars: 48,
        minutes: 30,
    },
    "1hour": {
        label: "1 Hour",
        bars: 24,
        minutes: 60,
    },
    "2hour": {
        label: "2 Hours",
        bars: 48,
        minutes: 120,
    },
    "4hour": {
        label: "4 Hours",
        bars: 42,
        minutes: 240,
    },
    "day": {
        label: "1 Day",
        bars: 90,
        minutes: 1440,
    },
}

export const TokenCharts: React.FC<TokenChartsProps> = ({
    token,
    height,
 }) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const [timeFrame, setTimeFrame] = useState<TimeFrame>('5min');
    const [isLineChart, setIsLineChart] = useState(true);
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
    
    const { isDarkMode } = useTheme();

    const gridColor = isDarkMode ? 'rgba(70, 130, 180, 0.2)' : 'rgba(70, 130, 180, 0.1)';
    const labelColor = isDarkMode ? '#DDD' : '#000';

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
            height,
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
                    
                    // Get tooltip position
                    const container = chartContainerRef.current.getBoundingClientRect();
                    const tooltipWidth = tooltipRef.current.offsetWidth;
                    const tooltipHeight = tooltipRef.current.offsetHeight;
                    
                    // Ensure tooltip does not go beyond container boundaries
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

    const initializeChart = (chartRef: HTMLDivElement, _isLineChart: boolean, _timeFrame: TimeFrame) => {
        chartRef.innerHTML = '';
        createMainChart(chartRef);
        addChart(_isLineChart);
        addHistogramSeries();
        applyOptions();
        subscribeCrosshairMove(_isLineChart);
        if (timeFrameData.current[_timeFrame].length > 0) {
            updateChartData(_isLineChart, _timeFrame);
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
                height,
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

    const getCacheKey = (mint: string, timeFrame: string) => `${LOCAL_STORAGE_HISTORY_CACHE_PREFIX}${mint}_${timeFrame}`;

    const getCachedData = (mint: string, timeFrame: string) => {
        try {
            const cacheKey = getCacheKey(mint, timeFrame);
            const cached = localStorage.getItem(cacheKey);
            if (!cached) return null;

            const { data, timestamp } = JSON.parse(cached);
            
            // Check if cache is expired
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

    const updateChartData = (_isLineChart: boolean, _timeFrame: TimeFrame) => {
        if (!chart.current || !timeFrameData.current[_timeFrame].length || !series.current) return;

        const data = timeFrameData.current[_timeFrame];
        if (_isLineChart) {
            const lineData = data.map(item => ({
                time: item.time as UTCTimestamp,
                value: Number(item.close),
            }));
            series.current.setData(lineData);
        } else {
            series.current.setData(data);
        }
        
        if (volumeSeries.current) {
            volumeSeries.current.setData(data.map(item => ({
                time: item.time,
                value: item.volume,
                color: item.close >= item.open ? '#26a69a' : '#ef5350'
            })));
        }

        const visibleBars = timeFrameDatas[_timeFrame].bars;
        const timeScale = chart.current.timeScale();
        const lastIndex = data.length - 1;
        
        timeScale.scrollToPosition(5, false);
        timeScale.setVisibleLogicalRange({
            from: lastIndex - visibleBars,
            to: lastIndex + 5
        });
    }
    
    const [fetchMintData, { loading, error }] = useLazyQuery(queryAllTokenMintForChart, {
        fetchPolicy: 'network-only',
        nextFetchPolicy: 'network-only',
        onCompleted: (data) => {
            if (data?.mintTokenEntities && data.mintTokenEntities.length > 0) {
                try {
                    setCachedData(token.mint, timeFrame, data.mintTokenEntities);
                    processAndUpdateData(data.mintTokenEntities, timeFrame);
                } catch (processingError) {
                    console.error('Error processing fetched data:', processingError);
                }
            } else {
                console.warn('No token entities found for mint:', token?.mint);
            }
        },
        onError: (err) => {
            console.error('GraphQL Query Error:', {
                errorMessage: err.message,
                errorDetails: err
            });
        }
    });

    const processAndUpdateData = (mintTokenEntities: any[], _timeFrame: TimeFrame) => {
        if (!token?.feeRate) return;

        try {
            baseData.current = processRawData(mintTokenEntities, parseFloat(token.feeRate));
            timeFrameData.current['1min'] = baseData.current;

            const timeFrames: TimeFrame[] = ['5min', '15min', '30min', '1hour', '2hour', '4hour', 'day'];
            timeFrames.forEach(tf => {
                const minutes = timeFrameDatas[tf].minutes;
                timeFrameData.current[tf] = aggregateCandles(baseData.current, minutes);
            });

            updateChartData(isLineChart, _timeFrame);
        } catch (err) {
            console.error('Error processing data:', err);
        }
    }

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
    
    const _loadData = (_timeFrame: TimeFrame) => {
        try {
            const cachedData = getCachedData(token.mint, _timeFrame);
            
            if (cachedData && USE_CACHE) {
                processAndUpdateData(cachedData, _timeFrame);
            } else {
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
    }

    const _loadChart = (_timeFrame: TimeFrame) => {
        if (chart.current) {
            chart.current.remove();
            chart.current = null;
        }

        if(chartContainerRef?.current) initializeChart(chartContainerRef.current, isLineChart, _timeFrame);
        else return;
    }

    useEffect(() => {
        if (!token?.mint) return;
        _loadData(timeFrame);
    }, [token?.mint]);

    useEffect(() => {
        if (loading) {
            if (chartContainerRef.current) {
                chartContainerRef.current.innerHTML = `
                    <div class="flex items-center justify-center h-[560px]">
                        <div class="text-base-content">Loading chart data...</div>
                    </div>
                `;
            }
            return;
        } else if (error) {
            if (chartContainerRef.current) {
                chartContainerRef.current.innerHTML = `
                    <ErrorBox title="Error loading chart data" message={error.message} />
                `;
            }
            return;
        }
        _loadChart(timeFrame);
    }, [loading, error, isLineChart, gridColor, labelColor]);

    return (
        <div className="mt-6">
            <h2 className="text-xl font-semibold text-base-content">Mint Cost</h2>
            <div className="pixel-box bg-base-200 p-6">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                        <button 
                            className="btn btn-sm btn-secondary"
                            onClick={() => _loadData(timeFrame)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                        <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => setIsLineChart(!isLineChart)}
                        >
                            {isLineChart ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M7 8h2v8H7z"/>
                                    <path d="M11 6h2v10h-2z"/>
                                    <path d="M15 10h2v6h-2z"/>
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M3 12s4-9 6-9 4 6 6 6 4-9 6-9" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            )}
                        </button>
                        <select
                            value={timeFrame}
                            onChange={(e) => {
                                setTimeFrame(e.target.value as TimeFrame);
                                _loadChart(e.target.value as TimeFrame);
                            }}
                            className="select select-bordered select-sm w-40 bg-base-300 text-base-content"
                        >
                            {Object.entries(timeFrameDatas).map(([key, value]) => (
                                <option key={key} value={key}>
                                    {value.label}
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
