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

export type GenerateMosaicOptions = {
  width: number;
  height: number;
  pixels: Uint8ClampedArray;
  gridWidth: number;
  gridHeight: number;
  palette: PaletteColor[];
  backgroundColor?: string;
};

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

  const sectionWidth = Math.max(1, Math.ceil(gridWidth / 4));
  const sectionHeight = Math.max(1, Math.ceil(gridHeight / 4));
  const sections: Section[] = [];
  const sectionCounts = new Map<string, number>();

  for (let sectionY = 0; sectionY < gridHeight; sectionY += sectionHeight) {
    for (let sectionX = 0; sectionX < gridWidth; sectionX += sectionWidth) {
      const widthInCells = Math.min(sectionWidth, gridWidth - sectionX);
      const heightInCells = Math.min(sectionHeight, gridHeight - sectionY);
      const id = `section-${sectionX}-${sectionY}`;
      const sectionCellCount = widthInCells * heightInCells;
      sections.push({
        id,
        startX: sectionX,
        startY: sectionY,
        width: widthInCells,
        height: heightInCells,
        cellCount: sectionCellCount,
      });
      sectionCounts.set(id, sectionCellCount);
    }
  }

  const cells: MosaicCell[] = [];
  const materialMap = new Map<string, MaterialItem>();
  const background = hexToRgb(backgroundColor);

  for (let y = 0; y < gridHeight; y += 1) {
    for (let x = 0; x < gridWidth; x += 1) {
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
          const sourceR = pixels[offset] * alpha + background.r * (1 - alpha);
          const sourceG = pixels[offset + 1] * alpha + background.g * (1 - alpha);
          const sourceB = pixels[offset + 2] * alpha + background.b * (1 - alpha);

          sampleTotalR += sourceR;
          sampleTotalG += sourceG;
          sampleTotalB += sourceB;
          sampleCount += 1;
        }
      }

      const averageR = sampleCount === 0 ? background.r : sampleTotalR / sampleCount;
      const averageG = sampleCount === 0 ? background.g : sampleTotalG / sampleCount;
      const averageB = sampleCount === 0 ? background.b : sampleTotalB / sampleCount;
      const nearest = findClosestPaletteColor({ r: averageR, g: averageG, b: averageB }, palette);
      const sectionIndex = Math.floor(y / sectionHeight) * Math.ceil(gridWidth / sectionWidth) + Math.floor(x / sectionWidth);
      const sectionId = sections[sectionIndex]?.id ?? 'section-0-0';

      cells.push({
        id: `cell-${x}-${y}`,
        x,
        y,
        colorId: nearest.id,
        rgb: nearest.rgb,
        sectionId,
      });

      const material = materialMap.get(nearest.id) ?? {
        colorId: nearest.id,
        name: nearest.name,
        hex: nearest.hex,
        count: 0,
      };

      material.count += 1;
      materialMap.set(nearest.id, material);
    }
  }

  const materialList = Array.from(materialMap.values()).sort((left, right) => {
    if (left.hex === right.hex) {
      return left.name.localeCompare(right.name);
    }
    return left.hex.localeCompare(right.hex);
  });

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
    palette,
  };
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
