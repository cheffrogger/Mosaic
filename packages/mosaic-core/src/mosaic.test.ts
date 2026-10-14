import { describe, expect, it } from 'vitest';
import { buildDemoPalette, generateMosaicFromPixels } from './index';

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
});
