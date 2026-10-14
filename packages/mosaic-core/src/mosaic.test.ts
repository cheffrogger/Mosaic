import { describe, expect, it } from 'vitest';
import {
  applyColorReplacement,
  buildDemoPalette,
  calculateCropRect,
  calculateSectionLayout,
  generateMosaicFromPixels,
} from './index';

describe('mosaic core', () => {
  it('creates a 32x32 mosaic and counts material exactly', () => {
    const width = 32;
    const height = 32;
    const rgba = new Uint8ClampedArray(width * height * 4);

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const index = (y * width + x) * 4;
        rgba[index] = x < 16 ? 255 : 0;
        rgba[index + 1] = 0;
        rgba[index + 2] = x < 16 ? 0 : 255;
        rgba[index + 3] = 255;
      }
    }

    const mosaic = generateMosaicFromPixels({
      width,
      height,
      pixels: rgba,
      gridWidth: 32,
      gridHeight: 32,
      palette: buildDemoPalette(),
      backgroundColor: '#ffffff',
    });

    expect(mosaic.cells).toHaveLength(32 * 32);
    expect(mosaic.materialList.length).toBeGreaterThan(0);
    expect(mosaic.materialList.reduce((sum, item) => sum + item.count, 0)).toBe(32 * 32);
    expect(mosaic.materialList.every((item) => item.count > 0)).toBe(true);
  });

  it('calculates custom section layouts for 50x50 grids', () => {
    const sections = calculateSectionLayout({
      gridWidth: 50,
      gridHeight: 50,
      sectionWidth: 10,
      sectionHeight: 10,
    });

    expect(sections).toHaveLength(25);
    expect(sections[sections.length - 1]?.cellCount).toBe(100);

    const largeSections = calculateSectionLayout({
      gridWidth: 50,
      gridHeight: 50,
      sectionWidth: 16,
      sectionHeight: 16,
    });

    expect(largeSections).toHaveLength(16);
    expect(largeSections[largeSections.length - 1]?.width).toBe(2);
    expect(largeSections[largeSections.length - 1]?.height).toBe(2);
    expect(largeSections.reduce((sum, section) => sum + section.cellCount, 0)).toBe(2500);
  });

  it('keeps the crop centered on the source image and preserves the target aspect ratio', () => {
    const crop = calculateCropRect({
      sourceWidth: 1200,
      sourceHeight: 900,
      targetAspect: 1.6,
      zoom: 1.75,
      centerX: 0.5,
      centerY: 0.5,
    });

    expect(crop.width).toBeCloseTo(685.7142857142857, 5);
    expect(crop.height).toBeCloseTo(428.57142857142856, 5);
    expect(crop.width / crop.height).toBeCloseTo(1.6, 5);
    expect(crop.x).toBeGreaterThanOrEqual(0);
    expect(crop.y).toBeGreaterThanOrEqual(0);
    expect(crop.x + crop.width).toBeLessThanOrEqual(1200);
    expect(crop.y + crop.height).toBeLessThanOrEqual(900);
  });

  it('respects color limits and pixel-art mode', () => {
    const width = 8;
    const height = 1;
    const rgba = new Uint8ClampedArray(width * height * 4);

    for (let x = 0; x < width; x += 1) {
      const index = x * 4;
      rgba[index] = x < 4 ? 255 : 0;
      rgba[index + 1] = x < 4 ? 0 : 255;
      rgba[index + 2] = 0;
      rgba[index + 3] = 255;
    }

    const mosaic = generateMosaicFromPixels({
      width,
      height,
      pixels: rgba,
      gridWidth: 8,
      gridHeight: 1,
      palette: [
        { id: 'red', name: 'Red', hex: '#ff0000', rgb: { r: 255, g: 0, b: 0 } },
        { id: 'green', name: 'Green', hex: '#00ff00', rgb: { r: 0, g: 255, b: 0 } },
        { id: 'blue', name: 'Blue', hex: '#0000ff', rgb: { r: 0, g: 0, b: 255 } },
      ],
      colorLimit: 1,
      mode: 'pixel-art',
      backgroundColor: '#000000',
    });

    expect(new Set(mosaic.cells.map((cell) => cell.colorId)).size).toBeLessThanOrEqual(1);
    expect(mosaic.materialList.reduce((sum, item) => sum + item.count, 0)).toBe(8);
  });

  it('applies a color replacement and keeps material totals consistent', () => {
    const palette = buildDemoPalette();
    const cells = [
      { id: 'cell-0', x: 0, y: 0, colorId: 'A01', rgb: { r: 15, g: 23, b: 42 }, sectionId: 'section-0-0' },
      { id: 'cell-1', x: 1, y: 0, colorId: 'A01', rgb: { r: 15, g: 23, b: 42 }, sectionId: 'section-0-0' },
      { id: 'cell-2', x: 2, y: 0, colorId: 'A02', rgb: { r: 29, g: 78, b: 216 }, sectionId: 'section-0-0' },
    ];

    const updated = applyColorReplacement({
      cells,
      palette,
      sourceColorId: 'A01',
      targetColorId: 'A08',
    });

    expect(updated.cells.every((cell) => cell.colorId !== 'A01')).toBe(true);
    expect(updated.cells.filter((cell) => cell.colorId === 'A08')).toHaveLength(2);
    expect(updated.materialList.reduce((sum, item) => sum + item.count, 0)).toBe(3);
  });
});
