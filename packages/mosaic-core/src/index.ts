export type RGBColor = {
  r: number;
  g: number;
  b: number;
};

export type PaletteColor = {
  id: string;
  name: string;
  hex: string;
  rgb: RGBColor;
};

export type MosaicCell = {
  id: string;
  x: number;
  y: number;
  colorId: string;
  rgb: RGBColor;
  sectionId: string;
};

export type MaterialItem = {
  colorId: string;
  name: string;
  hex: string;
  count: number;
};

export type Section = {
  id: string;
  startX: number;
  startY: number;
  width: number;
  height: number;
  cellCount: number;
};

export type GenerationMode = 'balanced' | 'pixel-art';

export type MosaicResult = {
  width: number;
  height: number;
  gridWidth: number;
  gridHeight: number;
  cells: MosaicCell[];
  sections: Section[];
  materialList: MaterialItem[];
  palette: PaletteColor[];
};

export type SectionLayoutOptions = {
  gridWidth: number;
  gridHeight: number;
  sectionWidth?: number;
  sectionHeight?: number;
};

export type CropRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type CropRectOptions = {
  sourceWidth: number;
  sourceHeight: number;
  targetAspect: number;
  zoom?: number;
  centerX?: number;
  centerY?: number;
};

export type ImageBuffer = {
  width: number;
  height: number;
  data: Uint8ClampedArray;
};

export function calculateCropRect({
  sourceWidth,
  sourceHeight,
  targetAspect,
  zoom = 1,
  centerX = 0.5,
  centerY = 0.5,
}: CropRectOptions): CropRect {
  if (!Number.isFinite(sourceWidth) || !Number.isFinite(sourceHeight) || sourceWidth <= 0 || sourceHeight <= 0) {
    throw new Error('Invalid source image size');
  }

  const safeTargetAspect = Number.isFinite(targetAspect) && targetAspect > 0 ? targetAspect : sourceWidth / sourceHeight;
  const safeZoom = Number.isFinite(zoom) && zoom > 0 ? zoom : 1;
  const safeCenterX = Number.isFinite(centerX) ? Math.min(1, Math.max(0, centerX)) : 0.5;
  const safeCenterY = Number.isFinite(centerY) ? Math.min(1, Math.max(0, centerY)) : 0.5;

  let cropWidth = sourceWidth;
  let cropHeight = sourceHeight;

  if (sourceWidth / sourceHeight > safeTargetAspect) {
    cropHeight = sourceWidth / safeTargetAspect;
  } else {
    cropWidth = sourceHeight * safeTargetAspect;
  }

  cropWidth = Math.min(cropWidth, sourceWidth);
  cropHeight = Math.min(cropHeight, sourceHeight);

  if (cropWidth / cropHeight > safeTargetAspect) {
    cropWidth = cropHeight * safeTargetAspect;
  } else if (cropWidth / cropHeight < safeTargetAspect) {
    cropHeight = cropWidth / safeTargetAspect;
  }

  const zoomedWidth = Math.max(1, cropWidth / safeZoom);
  const zoomedHeight = Math.max(1, cropHeight / safeZoom);

  const x = Math.min(sourceWidth - zoomedWidth, Math.max(0, safeCenterX * (sourceWidth - zoomedWidth)));
  const y = Math.min(sourceHeight - zoomedHeight, Math.max(0, safeCenterY * (sourceHeight - zoomedHeight)));

  return {
    x,
    y,
    width: zoomedWidth,
    height: zoomedHeight,
  };
}

export function cropImageData(imageData: ImageBuffer, crop: CropRect): ImageBuffer {
  const width = Math.max(1, Math.round(crop.width));
  const height = Math.max(1, Math.round(crop.height));
  const output = new Uint8ClampedArray(width * height * 4);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const sourceX = Math.min(imageData.width - 1, Math.max(0, crop.x + (x / width) * crop.width));
      const sourceY = Math.min(imageData.height - 1, Math.max(0, crop.y + (y / height) * crop.height));
      const sourceIndex = (Math.round(sourceY) * imageData.width + Math.round(sourceX)) * 4;
      const targetIndex = (y * width + x) * 4;

      output[targetIndex] = imageData.data[sourceIndex];
      output[targetIndex + 1] = imageData.data[sourceIndex + 1];
      output[targetIndex + 2] = imageData.data[sourceIndex + 2];
      output[targetIndex + 3] = imageData.data[sourceIndex + 3];
    }
  }

  return {
    width,
    height,
    data: output,
  };
}

export function calculateSectionLayout({
  gridWidth,
  gridHeight,
  sectionWidth = 16,
  sectionHeight = 16,
}: SectionLayoutOptions): Section[] {
  if (!Number.isFinite(gridWidth) || !Number.isFinite(gridHeight) || gridWidth <= 0 || gridHeight <= 0) {
    throw new Error('Invalid grid size');
  }

  if (!Number.isFinite(sectionWidth) || !Number.isFinite(sectionHeight) || sectionWidth <= 0 || sectionHeight <= 0) {
    throw new Error('Invalid section size');
  }

  const columns = Math.ceil(gridWidth / sectionWidth);
  const rows = Math.ceil(gridHeight / sectionHeight);
  const sections: Section[] = [];

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const widthInCells = Math.min(sectionWidth, gridWidth - column * sectionWidth);
      const heightInCells = Math.min(sectionHeight, gridHeight - row * sectionHeight);
      sections.push({
        id: `section-${column}-${row}`,
        startX: column * sectionWidth,
        startY: row * sectionHeight,
        width: widthInCells,
        height: heightInCells,
        cellCount: widthInCells * heightInCells,
      });
    }
  }

  return sections;
}

export type GenerateMosaicOptions = {
  width: number;
  height: number;
  pixels: Uint8ClampedArray;
  gridWidth: number;
  gridHeight: number;
  palette: PaletteColor[];
  backgroundColor?: string;
  sectionWidth?: number;
  sectionHeight?: number;
  colorLimit?: number;
  mode?: GenerationMode;
};

export function buildDemoPalette(): PaletteColor[] {
  const raw = [
    ['A01', 'Midnight', '#0f172a'],
    ['A02', 'Ocean', '#1d4ed8'],
    ['A03', 'Moss', '#15803d'],
    ['A04', 'Sun', '#fbbf24'],
    ['A05', 'Coral', '#f97316'],
    ['A06', 'Rose', '#e11d48'],
    ['A07', 'Cloud', '#e5e7eb'],
    ['A08', 'Slate', '#475569'],
  ];

  return raw.map(([id, name, hex]) => ({
    id,
    name,
    hex,
    rgb: hexToRgb(hex),
  }));
}

export function generateMosaicFromPixels({
  width,
  height,
  pixels,
  gridWidth,
  gridHeight,
  palette,
  backgroundColor = '#ffffff',
  sectionWidth,
  sectionHeight,
  colorLimit,
  mode = 'balanced',
}: GenerateMosaicOptions): MosaicResult {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    throw new Error('Invalid image size');
  }

  if (gridWidth <= 0 || gridHeight <= 0) {
    throw new Error('Invalid grid size');
  }

  if (pixels.length < width * height * 4) {
    throw new Error('Pixel buffer is too small for the requested image size');
  }

  if (palette.length === 0) {
    throw new Error('Palette cannot be empty');
  }

  const resolvedSectionWidth = sectionWidth ?? Math.max(1, Math.ceil(gridWidth / 4));
  const resolvedSectionHeight = sectionHeight ?? Math.max(1, Math.ceil(gridHeight / 4));
  const sections = calculateSectionLayout({
    gridWidth,
    gridHeight,
    sectionWidth: resolvedSectionWidth,
    sectionHeight: resolvedSectionHeight,
  });

  const cells: MosaicCell[] = [];
  const materialMap = new Map<string, MaterialItem>();
  const background = hexToRgb(backgroundColor);
  const preliminaryColors: string[] = [];

  for (let y = 0; y < gridHeight; y += 1) {
    for (let x = 0; x < gridWidth; x += 1) {
      const sampledColor = sampleCellColor({
        x,
        y,
        width,
        height,
        gridWidth,
        gridHeight,
        pixels,
        background,
        mode,
      });
      const nearest = findClosestPaletteColor(sampledColor, palette);
      preliminaryColors.push(nearest.id);
      const sectionId = sections.find((section) => x >= section.startX && x < section.startX + section.width && y >= section.startY && y < section.startY + section.height)?.id ?? sections[0]?.id ?? 'section-0-0';

      cells.push({
        id: `cell-${x}-${y}`,
        x,
        y,
        colorId: nearest.id,
        rgb: nearest.rgb,
        sectionId,
      });
    }
  }

  const activePaletteIds = selectPaletteIds(preliminaryColors, palette, colorLimit);
  const activePalette = palette.filter((color) => activePaletteIds.has(color.id));

  for (const cell of cells) {
    const activeColor = findClosestPaletteColor(cell.rgb, activePalette);
    cell.colorId = activeColor.id;
    cell.rgb = activeColor.rgb;

    const material = materialMap.get(activeColor.id) ?? {
      colorId: activeColor.id,
      name: activeColor.name,
      hex: activeColor.hex,
      count: 0,
    };

    material.count += 1;
    materialMap.set(activeColor.id, material);
  }

  const materialList = buildMaterialList(cells, palette);

  const sectionCells = new Map<string, number>();
  for (const cell of cells) {
    const current = sectionCells.get(cell.sectionId) ?? 0;
    sectionCells.set(cell.sectionId, current + 1);
  }

  for (const section of sections) {
    section.cellCount = sectionCells.get(section.id) ?? 0;
  }

  const totalCellCount = cells.length;
  if (totalCellCount !== gridWidth * gridHeight) {
    throw new Error('Mosaic generation mismatch: cell count does not match the requested grid');
  }

  const materialTotal = materialList.reduce((sum, item) => sum + item.count, 0);
  if (materialTotal !== totalCellCount) {
    throw new Error('Mosaic generation mismatch: material total does not match the cell count');
  }

  return {
    width,
    height,
    gridWidth,
    gridHeight,
    cells,
    sections,
    materialList,
    palette: activePalette,
  };
}

export function buildMaterialList(cells: MosaicCell[], palette: PaletteColor[]): MaterialItem[] {
  const materialMap = new Map<string, MaterialItem>();

  for (const cell of cells) {
    const color = palette.find((item) => item.id === cell.colorId) ?? {
      id: cell.colorId,
      name: cell.colorId,
      hex: rgbToHex(cell.rgb),
      rgb: cell.rgb,
    };

    const material = materialMap.get(cell.colorId) ?? {
      colorId: cell.colorId,
      name: color.name,
      hex: color.hex,
      count: 0,
    };

    material.count += 1;
    materialMap.set(cell.colorId, material);
  }

  return Array.from(materialMap.values()).sort((left, right) => {
    if (left.hex === right.hex) {
      return left.name.localeCompare(right.name);
    }
    return left.hex.localeCompare(right.hex);
  });
}

export function applyColorReplacement({
  cells,
  palette,
  sourceColorId,
  targetColorId,
}: {
  cells: MosaicCell[];
  palette: PaletteColor[];
  sourceColorId: string;
  targetColorId: string;
}): { cells: MosaicCell[]; materialList: MaterialItem[] } {
  if (!sourceColorId || !targetColorId || sourceColorId === targetColorId) {
    return {
      cells: [...cells],
      materialList: buildMaterialList(cells, palette),
    };
  }

  const targetColor = palette.find((color) => color.id === targetColorId);
  if (!targetColor) {
    throw new Error(`Color ${targetColorId} is not available in the current palette`);
  }

  const updatedCells = cells.map((cell) => {
    if (cell.colorId !== sourceColorId) {
      return cell;
    }

    return {
      ...cell,
      colorId: targetColorId,
      rgb: { ...targetColor.rgb },
    };
  });

  return {
    cells: updatedCells,
    materialList: buildMaterialList(updatedCells, palette),
  };
}

function sampleCellColor({
  x,
  y,
  width,
  height,
  gridWidth,
  gridHeight,
  pixels,
  background,
  mode,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  gridWidth: number;
  gridHeight: number;
  pixels: Uint8ClampedArray;
  background: RGBColor;
  mode: GenerationMode;
}): RGBColor {
  if (mode === 'pixel-art') {
    const sampleX = Math.min(width - 1, Math.max(0, Math.floor(((x + 0.5) * width) / gridWidth)));
    const sampleY = Math.min(height - 1, Math.max(0, Math.floor(((y + 0.5) * height) / gridHeight)));
    const offset = (sampleY * width + sampleX) * 4;
    const alpha = pixels[offset + 3] / 255;
    return {
      r: pixels[offset] * alpha + background.r * (1 - alpha),
      g: pixels[offset + 1] * alpha + background.g * (1 - alpha),
      b: pixels[offset + 2] * alpha + background.b * (1 - alpha),
    };
  }

  const cellXStart = Math.floor((x / gridWidth) * width);
  const cellXEnd = Math.ceil(((x + 1) / gridWidth) * width);
  const cellYStart = Math.floor((y / gridHeight) * height);
  const cellYEnd = Math.ceil(((y + 1) / gridHeight) * height);

  let sampleTotalR = 0;
  let sampleTotalG = 0;
  let sampleTotalB = 0;
  let sampleCount = 0;

  for (let py = cellYStart; py < cellYEnd; py += 1) {
    for (let px = cellXStart; px < cellXEnd; px += 1) {
      const sourceX = Math.min(Math.max(px, 0), width - 1);
      const sourceY = Math.min(Math.max(py, 0), height - 1);
      const offset = (sourceY * width + sourceX) * 4;
      const alpha = pixels[offset + 3] / 255;
      sampleTotalR += pixels[offset] * alpha + background.r * (1 - alpha);
      sampleTotalG += pixels[offset + 1] * alpha + background.g * (1 - alpha);
      sampleTotalB += pixels[offset + 2] * alpha + background.b * (1 - alpha);
      sampleCount += 1;
    }
  }

  return {
    r: sampleCount === 0 ? background.r : sampleTotalR / sampleCount,
    g: sampleCount === 0 ? background.g : sampleTotalG / sampleCount,
    b: sampleCount === 0 ? background.b : sampleTotalB / sampleCount,
  };
}

function selectPaletteIds(preliminaryColors: string[], palette: PaletteColor[], colorLimit?: number): Set<string> {
  const counts = new Map<string, number>();
  const orderMap = new Map<string, number>();

  palette.forEach((color, index) => orderMap.set(color.id, index));
  preliminaryColors.forEach((colorId) => {
    counts.set(colorId, (counts.get(colorId) ?? 0) + 1);
  });

  const limit = colorLimit && colorLimit > 0 ? Math.min(colorLimit, palette.length) : palette.length;
  const orderedIds = [...counts.entries()].sort((left, right) => {
    if (right[1] !== left[1]) {
      return right[1] - left[1];
    }
    return (orderMap.get(left[0]) ?? 0) - (orderMap.get(right[0]) ?? 0);
  }).map(([id]) => id);

  const selected = new Set<string>();
  for (const id of orderedIds) {
    if (selected.size >= limit) {
      break;
    }
    selected.add(id);
  }

  for (const color of palette) {
    if (selected.size >= limit) {
      break;
    }
    selected.add(color.id);
  }

  return selected;
}

function findClosestPaletteColor(rgb: RGBColor, palette: PaletteColor[]): PaletteColor {
  let nearest = palette[0];
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const color of palette) {
    const distance = squaredDistance(rgb, color.rgb);
    if (distance < bestDistance) {
      nearest = color;
      bestDistance = distance;
    }
  }

  return nearest;
}

function squaredDistance(a: RGBColor, b: RGBColor): number {
  const deltaR = a.r - b.r;
  const deltaG = a.g - b.g;
  const deltaB = a.b - b.b;
  return deltaR * deltaR + deltaG * deltaG + deltaB * deltaB;
}

function rgbToHex({ r, g, b }: RGBColor): string {
  const toHex = (value: number) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hexToRgb(hex: string): RGBColor {
  const normalized = hex.replace('#', '').trim();
  const value = normalized.length === 3
    ? normalized.split('').map((digit) => digit + digit).join('')
    : normalized;

  const parsed = Number.parseInt(value, 16);
  const safeValue = Number.isNaN(parsed) ? 0 : parsed;

  return {
    r: (safeValue >> 16) & 255,
    g: (safeValue >> 8) & 255,
    b: safeValue & 255,
  };
}
