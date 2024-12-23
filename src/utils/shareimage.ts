import { InitiazlizedTokenData, TokenMetadataIPFS } from "../types/types";
import { QRCodeSVG } from 'qrcode.react';
import ReactDOM from 'react-dom';
import React, { useMemo } from 'react';
import { APP_NAME } from "../config/constants";
import { BN_LAMPORTS_PER_SOL, calculateMaxSupply, calculateTargetMintTime, calculateTotalSupplyToTargetEras, formatLargeNumber, formatSeconds, getMintSpeed } from "./format";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";

const BOX_WIDTH = 6;

// 加载像素字体
const loadPixelFonts = async () => {
    const normalFont = new FontFace('RetroPixel', 'url(/fonts/retro-pixel-cute-mono.ttf)');
    const thickFont = new FontFace('RetroPixelThick', 'url(/fonts/retro-pixel-thick.ttf)');
    
    await Promise.all([normalFont.load(), thickFont.load()]);
    document.fonts.add(normalFont);
    document.fonts.add(thickFont);
    return { normalFont, thickFont };
};

// 绘制像素风格的矩形
const drawPixelRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, color: string = '#FFFFFF', borderWidth: number = 6) => {
    // 绘制阴影
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + borderWidth, y + borderWidth, width, height);

    // 绘制主体矩形
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);

    // 绘制边框
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = borderWidth;  
    ctx.strokeRect(x, y, width, height);

    // 绘制右边和下边的像素点
    ctx.fillStyle = '#000000';
    for (let i = 0; i <= width; i += borderWidth) {  
        ctx.fillRect(x + i, y + height, borderWidth, borderWidth);  
    }
    for (let i = 0; i <= height; i += borderWidth) {  
        ctx.fillRect(x + width, y + i, borderWidth, borderWidth);  
    }
};

// 绘制多行文本，处理溢出
const drawMultiLineText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    maxLines: number = 4,
    padding: number = 4
) => {
    ctx.font = '20px RetroPixel';
    // 移除 fillStyle 设置，由外部控制
    
    const words = text.split(' ');
    let line = '';
    let lines: string[] = [];
    
    // 分行处理
    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > maxWidth - padding * 2 && n > 0) {
            lines.push(line);
            line = words[n] + ' ';
        } else {
            line = testLine;
        }
    }
    lines.push(line);
    
    // 限制最大行数
    lines = lines.slice(0, maxLines);
    
    // 绘制每一行
    lines.forEach((line, i) => {
        ctx.fillText(line.trim(), x + padding + 10, y + padding + ((i + 1) * lineHeight));
    });
    
    // 返回实际使用的行数
    return lines.length;
};

// 处理动态图片，只获取第一帧
const getFirstFrameFromImage = async (image: HTMLImageElement, type: string): Promise<ImageBitmap | HTMLImageElement> => {
    if (type === 'image/gif' || type === 'image/webp') {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = image.width;
        tempCanvas.height = image.height;
        const tempCtx = tempCanvas.getContext('2d')!;
        tempCtx.drawImage(image, 0, 0);
        return await createImageBitmap(tempCanvas);
    }
    return image;
};

// 绘制上涨走势折线图
const drawTrendLine = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    lineColor: string = '#009866',
    shadowColor: string = '#000000'
) => {
    const shadowLength = 4;
    // 定义控制点
    const points = [
        { x: x, y: y + height - 5 },              // 起点
        { x: x + 30, y: y + height - 10 },        // 第一个波动
        { x: x + 60, y: y + height - 35 },        // 开始上升
        // { x: x + 90, y: y + 25 },                 // 急速上升
        { x: x + width - 30, y: y + 15 },         // 继续上升
        { x: x + width, y: y }                    // 终点
    ];

    // 绘制阴影
    ctx.fillStyle = shadowColor;
    ctx.beginPath();
    ctx.moveTo(points[0].x + shadowLength, points[0].y);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x + shadowLength, points[i].y);
    }
    // 阴影偏移
    ctx.lineTo(points[points.length - 1].x + shadowLength, points[points.length - 1].y + shadowLength);
    for (let i = points.length - 1; i >= 0; i--) {
        ctx.lineTo(points[i].x + shadowLength, points[i].y + shadowLength);
    }
    ctx.closePath();
    ctx.fill();

    // 绘制主线
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = shadowLength;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();

    // 箭头参数
    const arrowTipX = x + width + 15;
    const arrowBaseX = x + width - 5;
    const arrowOffset = 8;

    // 绘制箭头阴影
    ctx.fillStyle = shadowColor;
    ctx.beginPath();
    ctx.moveTo(arrowTipX + shadowLength, y + shadowLength);
    ctx.lineTo(arrowBaseX + shadowLength, y - arrowOffset + shadowLength);
    ctx.lineTo(arrowBaseX + shadowLength, y + arrowOffset + shadowLength);
    ctx.fill();

    // 绘制箭头
    ctx.fillStyle = lineColor;
    ctx.beginPath();
    ctx.moveTo(arrowTipX, y);
    ctx.lineTo(arrowBaseX, y - arrowOffset);
    ctx.lineTo(arrowBaseX, y + arrowOffset);
    ctx.fill();

    // 返回箭头结束位置，方便定位后续文字
    return {
        arrowEndX: arrowTipX + shadowLength,
        centerY: y + height / 2
    };
};

const currentCost = (token: InitiazlizedTokenData) => {
    const feeRateInSol = Number(token.feeRate) / LAMPORTS_PER_SOL;
    const currentMintSize = Number(token.mintSizeEpoch) / LAMPORTS_PER_SOL;
    return currentMintSize > 0 ? feeRateInSol / currentMintSize : 0;
};

const originalCost = (token: InitiazlizedTokenData) => {
    const feeRateInSol = Number(token.feeRate) / LAMPORTS_PER_SOL;
    const initialMintSize = Number(token.initialMintSize) / LAMPORTS_PER_SOL;
    return initialMintSize > 0 ? feeRateInSol / initialMintSize : 0;
};

export const drawShareImage = async (token: InitiazlizedTokenData, metadata: TokenMetadataIPFS, discount: string, inputCode: string, currentUrl: string) => {
    // 加载字体
    await loadPixelFonts();
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    // 设置画布大小
    canvas.width = 600;
    canvas.height = 1100;
    
    // 加载背景图片
    const bgImage = new Image();
    bgImage.src = '/images/share_image_bg.png';
    
    // 等待背景图片加载完成
    await new Promise((resolve) => {
        bgImage.onload = resolve;
    });
    
    // 绘制背景图片
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

    // Logo in top-right corner
    const logoHeight = 32;
    const logoWidth = 32;
    const logoImage = new Image();
    logoImage.src = '/images/flip-flops-64_64.png';
    
    await new Promise((resolve) => {
        logoImage.onload = resolve;
    });
    
    // 绘制 Logo 图片
    const logoX = canvas.width - logoWidth - 40; // 距离右边界40像素
    const logoY = 40; // 距离上边界40像素
    ctx.drawImage(logoImage, logoX, logoY, logoHeight, logoWidth);
    
    // 绘制应用名称
    ctx.font = 'bold 24px RetroPixel';
    ctx.fillStyle = '#000000';
    const textX = logoX - 110; // Logo左侧100像素
    ctx.fillText(APP_NAME, textX, logoY + 24);

    // Token Symbol 和 Name
    ctx.font = '52px RetroPixelThick';
    ctx.fillText(token.tokenSymbol || 'MOCK', 40, 70);
    ctx.font = '24px RetroPixel';
    ctx.fillText(token.tokenName || 'Mock Token', 40, 100);

    // Token Image
    if (metadata?.image) {
        try {
            const { fetchImageFromUrlOrCache } = await import('./db');
            const imageData = await fetchImageFromUrlOrCache(metadata.image, Number(token.metadataTimestamp));
            const tokenImage = new Image();
            tokenImage.src = imageData.blobUrl;
            
            await new Promise((resolve) => {
                tokenImage.onload = resolve;
            });

            // 处理动态图片（GIF/WebP）
            const imageSource = await getFirstFrameFromImage(tokenImage, imageData.imageType);
            
            // 使用与之前相同的位置和大小
            const x = 40;
            const y = 120;
            const width = 520;
            const height = 520;
            
            // 先绘制背景和边框，使用12像素的边框宽度（原来的3倍）
            drawPixelRect(ctx, x, y, width, height, '#ffffff', BOX_WIDTH);
            
            // 在白色背景上居中绘制图片
            const scale = Math.min(width / imageSource.width, height / imageSource.height);
            const scaledWidth = imageSource.width * scale - BOX_WIDTH;
            const scaledHeight = imageSource.height * scale - BOX_WIDTH;
            const imageX = x + (width - scaledWidth) / 2;
            const imageY = y + (height - scaledHeight) / 2;
            
            ctx.drawImage(imageSource, imageX, imageY, scaledWidth, scaledHeight);
            
        } catch (error) {
            console.error('Error loading token image:', error);
            // 如果图片加载失败，显示默认的空白框
            drawPixelRect(ctx, 40, 120, 520, 520, '#ffffff', BOX_WIDTH);
            ctx.font = '24px RetroPixel';
            ctx.fillText('Token Image', 220, 380);
        }
    } else {
        // 如果没有图片，显示默认的空白框
        drawPixelRect(ctx, 40, 120, 520, 520, '#ffffff', BOX_WIDTH);
        ctx.font = '24px RetroPixel';
        ctx.fillText('Token Image', 220, 380);
    }

    // Token Description
    const descriptionX = 40;
    const descriptionY = 660;
    const descriptionWidth = 520;
    const lineHeight = 24;
    const maxLines = 4;
    const padding = 8;
    const totalHeight = lineHeight * maxLines + padding * 2; // 8 是上下 padding 的总和
    
    // 绘制描述框
    drawPixelRect(ctx, descriptionX, descriptionY, descriptionWidth, totalHeight, '#009866', BOX_WIDTH);
    
    // 绘制描述文本
    if (metadata?.description) {
        ctx.fillStyle = '#FFFFFF'; // 设置白色字体
        drawMultiLineText(
            ctx,
            metadata.description,
            descriptionX,
            descriptionY,
            descriptionWidth,
            lineHeight,
            maxLines,
            padding
        );
        ctx.fillStyle = '#000000'; // 恢复黑色字体，用于后续文字
    }

    // 信息区域
    const infoY = 790;
    // Max supply
    const maxSupply = calculateMaxSupply(token.epochesPerEra, token.initialTargetMintSizePerEpoch, token.reduceRatio);
    drawPixelRect(ctx, 40, infoY, 170, 60, '#ffffff');
    ctx.font = '16px RetroPixel';
    ctx.fillText('Max supply', 50, infoY + 20);
    ctx.font = 'bold 24px RetroPixel';
    ctx.fillText(formatLargeNumber(maxSupply), 50, infoY + 45);

    // Target milestone supply
    const targetMilestoneSupply = calculateTotalSupplyToTargetEras(token.epochesPerEra, token.initialTargetMintSizePerEpoch, token.reduceRatio, token.targetEras);
    drawPixelRect(ctx, 215, infoY, 170, 60, '#ffffff');
    ctx.font = '16px RetroPixel';
    ctx.fillText('Target MS supply', 225, infoY + 20);
    ctx.font = 'bold 24px RetroPixel';
    ctx.fillText(formatLargeNumber(targetMilestoneSupply), 225, infoY + 45);

    // Target mint interval
    const mintSpeed = getMintSpeed(token.targetSecondsPerEpoch, token.initialTargetMintSizePerEpoch, token.initialMintSize);
    drawPixelRect(ctx, 390, infoY, 170, 60, '#ffffff');
    ctx.font = '16px RetroPixel';
    ctx.fillText('Target interval', 400, infoY + 20);
    ctx.font = 'bold 24px RetroPixel';
    ctx.fillText(formatSeconds(mintSpeed), 400, infoY + 45);

    // 价格信息
    const priceY = 920;
    
    // 绘制走势图
    const chartX = 40;
    const chartY = priceY - 20;
    const chartWidth = 120;
    const chartHeight = 80;
    
    const { arrowEndX } = drawTrendLine(ctx, chartX, chartY, chartWidth, chartHeight);

    // 绘制难度涨幅
    const difficultyChange = ((currentCost(token) / originalCost(token) - 1) * 100).toFixed(1);
    ctx.font = 'bold 32px RetroPixel';
    ctx.fillStyle = '#000000';
    ctx.fillText(`+${difficultyChange}%`, arrowEndX + 15, priceY);
    
    // 添加难度说明
    ctx.font = '18px RetroPixel';
    ctx.fillStyle = '#333333';
    ctx.fillText('Mint cost increased', arrowEndX + 15, priceY + 20);

    // 绘制URC折扣
    ctx.font = 'bold 28px RetroPixel';
    ctx.fillStyle = '#ff0000';
    ctx.fillText(`-${discount}%`, arrowEndX + 15, priceY + 60);

    // 添加URC说明
    ctx.font = '18px RetroPixel';
    ctx.fillStyle = '#333333';
    ctx.fillText('URC discount', arrowEndX + 15, priceY + 80);

    // Mint size and fee
    ctx.font = '22px RetroPixel';
    ctx.fillStyle = '#000000';
    ctx.fillText(`${Number(token.feeRate) / LAMPORTS_PER_SOL} SOL to get ${(new BN(token.mintSizeEpoch)).div(BN_LAMPORTS_PER_SOL).toString()} ${token.tokenSymbol}s`, 40, priceY + 110);

    // 时间戳
    const now = new Date();
    ctx.font = '16px RetroPixel';
    ctx.fillStyle = '#333333';
    ctx.fillText(`@ ${now.toLocaleString()}`, 40, priceY + 140);

    // 二维码
    const qrWrapper = document.createElement('div');
    ReactDOM.render(
        React.createElement(QRCodeSVG, {
            value: currentUrl + "/" + inputCode,
            size: 150,
            level: 'L'
        }),
        qrWrapper
    );

    const qrSvg = qrWrapper.querySelector('svg');
    if (qrSvg) {
        const svgData = new XMLSerializer().serializeToString(qrSvg);
        const img = new Image();
        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
        
        await new Promise((resolve) => {
            img.onload = resolve;
        });

        // 绘制二维码容器
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(420, priceY - 30, 140, 140);
        drawPixelRect(ctx, 420, priceY - 30, 140, 140, '#ffffff');
        
        ctx.drawImage(img, 430, priceY - 20, 120, 120);
        ctx.font = '20px RetroPixel';
        ctx.fillText('Scan and mint', 420, priceY + 140);
    }

    return canvas;
};