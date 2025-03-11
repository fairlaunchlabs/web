import { InitiazlizedTokenData, TokenMetadataIPFS } from "../types/types";
import { QRCodeSVG } from 'qrcode.react';
import ReactDOM from 'react-dom';
import React, { useMemo } from 'react';
import { APP_NAME } from "../config/constants";
import { BN_LAMPORTS_PER_SOL, calculateMaxSupply, calculateTargetMintTime, calculateTotalSupplyToTargetEras, formatLargeNumber, formatSeconds, getMintSpeed } from "./format";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";

const BOX_WIDTH = 6;

const loadPixelFonts = async () => {
  const normalFont = new FontFace('RetroPixel', 'url(/fonts/retro-pixel-cute-mono.ttf)');
  const thickFont = new FontFace('RetroPixelThick', 'url(/fonts/retro-pixel-thick.ttf)');

  await Promise.all([normalFont.load(), thickFont.load()]);
  document.fonts.add(normalFont);
  document.fonts.add(thickFont);
  return { normalFont, thickFont };
};

// Draw rectangle in pixel style
const drawPixelRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, color: string = '#FFFFFF', borderWidth: number = 6) => {
  // Draw shadow
  ctx.fillStyle = '#000000';
  ctx.fillRect(x + borderWidth, y + borderWidth, width, height);

  // Draw body
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);

  // Draw border
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = borderWidth;
  ctx.strokeRect(x, y, width, height);

  // Draw right and bottom pixels
  ctx.fillStyle = '#000000';
  for (let i = 0; i <= width; i += borderWidth) {
    ctx.fillRect(x + i, y + height, borderWidth, borderWidth);
  }
  for (let i = 0; i <= height; i += borderWidth) {
    ctx.fillRect(x + width, y + i, borderWidth, borderWidth);
  }
};

// Draw multi line text, handle overflow
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

  const words = text.split(' ');
  let line = '';
  let lines: string[] = [];

  // Draw multi line text, handle overflow
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

  // Limit max lines
  lines = lines.slice(0, maxLines);

  // Draw each line
  lines.forEach((line, i) => {
    ctx.fillText(line.trim(), x + padding + 10, y + padding + ((i + 1) * lineHeight));
  });

  // Return actual lines
  return lines.length;
};

// Handle dynamic images, only get the first frame
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

// Draw price line
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
  // Define control points
  const points = [
    { x: x, y: y + height - 5 },              // Start point
    { x: x + 30, y: y + height - 10 },        // First wave
    { x: x + 60, y: y + height - 35 },        // Start rising
    // { x: x + 90, y: y + 25 },                 // Rapid rise
    { x: x + width - 30, y: y + 15 },         // Continue rising
    { x: x + width, y: y }                    // End point
  ];

  // Draw shadow
  ctx.fillStyle = shadowColor;
  ctx.beginPath();
  ctx.moveTo(points[0].x + shadowLength, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x + shadowLength, points[i].y);
  }
  // Shadow offset
  ctx.lineTo(points[points.length - 1].x + shadowLength, points[points.length - 1].y + shadowLength);
  for (let i = points.length - 1; i >= 0; i--) {
    ctx.lineTo(points[i].x + shadowLength, points[i].y + shadowLength);
  }
  ctx.closePath();
  ctx.fill();

  // Draw main line
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = shadowLength;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.stroke();

  // Arrow parameters
  const arrowTipX = x + width + 15;
  const arrowBaseX = x + width - 5;
  const arrowOffset = 8;

  // Draw arrow shadow
  ctx.fillStyle = shadowColor;
  ctx.beginPath();
  ctx.moveTo(arrowTipX + shadowLength, y + shadowLength);
  ctx.lineTo(arrowBaseX + shadowLength, y - arrowOffset + shadowLength);
  ctx.lineTo(arrowBaseX + shadowLength, y + arrowOffset + shadowLength);
  ctx.fill();

  // Draw arrow
  ctx.fillStyle = lineColor;
  ctx.beginPath();
  ctx.moveTo(arrowTipX, y);
  ctx.lineTo(arrowBaseX, y - arrowOffset);
  ctx.lineTo(arrowBaseX, y + arrowOffset);
  ctx.fill();

  // Return arrow end X and center Y
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
  // Load pixel fonts
  await loadPixelFonts();

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  // Set canvas size
  canvas.width = 600;
  canvas.height = 1100;

  // Load background image
  const bgImage = new Image();
  bgImage.src = '/images/share_image_bg.png';

  // Wait for background image to load
  await new Promise((resolve) => {
    bgImage.onload = resolve;
  });

  // Draw background image
  ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

  // Logo in top-right corner
  const logoHeight = 32;
  const logoWidth = 32;
  const logoImage = new Image();
  logoImage.src = '/images/flip-flops-64_64.png';

  await new Promise((resolve) => {
    logoImage.onload = resolve;
  });

  // Draw Logo image
  const logoX = canvas.width - logoWidth - 40; // Distance from right edge 40 pixels
  const logoY = 40; // Distance from top edge 40 pixels
  ctx.drawImage(logoImage, logoX, logoY, logoHeight, logoWidth);

  // Draw application name
  ctx.font = 'bold 24px RetroPixel';
  ctx.fillStyle = '#000000';
  const textX = logoX - 110; // leave 100 pixels left of logo
  ctx.fillText(APP_NAME, textX, logoY + 24);

  // Token Symbol and Name
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

      // For GIF/WebP
      const imageSource = await getFirstFrameFromImage(tokenImage, imageData.imageType);

      // Use the same position and size as before
      const x = 40;
      const y = 120;
      const width = 520;
      const height = 520;

      // Draw background and border, using 12 pixel border width (original 3x)
      drawPixelRect(ctx, x, y, width, height, '#ffffff', BOX_WIDTH);

      // In the white background, center draw the image
      const scale = Math.min(width / imageSource.width, height / imageSource.height);
      const scaledWidth = imageSource.width * scale - BOX_WIDTH;
      const scaledHeight = imageSource.height * scale - BOX_WIDTH;
      const imageX = x + (width - scaledWidth) / 2;
      const imageY = y + (height - scaledHeight) / 2;

      ctx.drawImage(imageSource, imageX, imageY, scaledWidth, scaledHeight);

    } catch (error) {
      console.error('Error loading token image:', error);
      // If the image fails to load, show a default blank box
      drawPixelRect(ctx, 40, 120, 520, 520, '#ffffff', BOX_WIDTH);
      ctx.font = '24px RetroPixel';
      ctx.fillText('Token Image', 220, 380);
    }
  } else {
    // If no image, show a default blank box
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
  const totalHeight = lineHeight * maxLines + padding * 2; // 8 is sum of padding

  // Draw description box
  drawPixelRect(ctx, descriptionX, descriptionY, descriptionWidth, totalHeight, '#009866', BOX_WIDTH);

  // Draw description text
  if (metadata?.description) {
    ctx.fillStyle = '#FFFFFF'; // Set white text
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
    ctx.fillStyle = '#000000'; // Restore black text, for future text
  }

  // Information area
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

  // Price information
  const priceY = 920;

  // Draw trend line
  const chartX = 40;
  const chartY = priceY - 20;
  const chartWidth = 120;
  const chartHeight = 80;

  const { arrowEndX } = drawTrendLine(ctx, chartX, chartY, chartWidth, chartHeight);

  // Draw difficulty change
  const difficultyChange = ((currentCost(token) / originalCost(token) - 1) * 100).toFixed(1);
  ctx.font = 'bold 32px RetroPixel';
  ctx.fillStyle = '#000000';
  ctx.fillText(`+${difficultyChange}%`, arrowEndX + 15, priceY);

  // Draw difficulty description
  ctx.font = '18px RetroPixel';
  ctx.fillStyle = '#333333';
  ctx.fillText('Mint cost increased', arrowEndX + 15, priceY + 20);

  // Draw URC discount
  ctx.font = 'bold 28px RetroPixel';
  ctx.fillStyle = '#ff0000';
  ctx.fillText(`-${discount}%`, arrowEndX + 15, priceY + 60);

  // Draw URC description
  ctx.font = '18px RetroPixel';
  ctx.fillStyle = '#333333';
  ctx.fillText('URC discount', arrowEndX + 15, priceY + 80);

  // Mint size and fee
  ctx.font = '22px RetroPixel';
  ctx.fillStyle = '#000000';
  ctx.fillText(`${Number(token.feeRate) / LAMPORTS_PER_SOL} SOL to get ${(new BN(token.mintSizeEpoch)).div(BN_LAMPORTS_PER_SOL).toString()} ${token.tokenSymbol}s`, 40, priceY + 110);

  // Time stamp
  const now = new Date();
  ctx.font = '16px RetroPixel';
  ctx.fillStyle = '#333333';
  ctx.fillText(`@ ${now.toLocaleString()}`, 40, priceY + 140);

  // Bar code
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

    // Draw bar code container
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(420, priceY - 30, 140, 140);
    drawPixelRect(ctx, 420, priceY - 30, 140, 140, '#ffffff');

    ctx.drawImage(img, 430, priceY - 20, 120, 120);
    ctx.font = '20px RetroPixel';
    ctx.fillText('Scan and mint', 420, priceY + 140);
  }

  return canvas;
};