
export const saveImage = async (imageUrl: string, text: string | null, filename: string) => {
  // If no text is provided, just download the raw image
  if (!text) {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${filename}_raw.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  // Create a canvas to composite image + text
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    console.error("Could not get canvas context");
    return;
  }

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = imageUrl;

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = (e) => reject(e);
  });

  // Set canvas size to match the source image
  canvas.width = img.width;
  canvas.height = img.height;

  // 1. Draw the Scene Image
  ctx.drawImage(img, 0, 0);

  // 2. Draw the Dialog Box (replicating the CSS style)
  // Dimensions
  const paddingX = canvas.width * 0.05; // 5% margin sides
  const paddingBottom = canvas.height * 0.05; // 5% margin bottom
  const boxHeight = canvas.height * 0.25; // 25% of height for dialog
  
  const boxX = paddingX;
  const boxY = canvas.height - boxHeight - paddingBottom;
  const boxW = canvas.width - (paddingX * 2);
  const boxH = boxHeight;

  // Outer Border (White) - simluating p-1
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(boxX, boxY, boxW, boxH);

  // Inner Border (Black) - simulating gap
  const borderSize = Math.max(2, canvas.width * 0.005);
  ctx.fillStyle = '#000000';
  ctx.fillRect(boxX + borderSize, boxY + borderSize, boxW - (borderSize * 2), boxH - (borderSize * 2));

  // Text Area (Black with White Border)
  const innerBoxX = boxX + (borderSize * 2);
  const innerBoxY = boxY + (borderSize * 2);
  const innerBoxW = boxW - (borderSize * 4);
  const innerBoxH = boxH - (borderSize * 4);

  // Draw the text area border (White)
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = borderSize;
  ctx.strokeRect(innerBoxX, innerBoxY, innerBoxW, innerBoxH);

  // 3. Draw Text
  const fontSize = Math.floor(canvas.height * 0.05); // Responsive font size
  ctx.font = `${fontSize}px "DotGothic16", sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.textBaseline = 'top';

  const textPadding = fontSize;
  const textX = innerBoxX + textPadding;
  const textY = innerBoxY + textPadding;
  const maxWidth = innerBoxW - (textPadding * 2);
  const lineHeight = fontSize * 1.5;

  // Wrap text
  const words = text.split(''); // Split by char for CJK wrapping
  let line = '';
  let y = textY;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n];
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, textX, y);
      line = words[n];
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, textX, y);

  // 4. Download
  const link = document.createElement('a');
  link.download = `${filename}_scene.png`;
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
