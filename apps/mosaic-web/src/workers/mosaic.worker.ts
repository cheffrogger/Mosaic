import { generateMosaicFromPixels, type MosaicCell } from '@mosaic/core';

self.onmessage = (event) => {
  const {
    type,
    requestId,
    projectName,
    width,
    height,
    pixels,
    sourceImageUrl,
    lockedCells,
    gridWidth,
    gridHeight,
    sectionWidth,
    sectionHeight,
    colorLimit,
    mode,
    palette,
    backgroundColor,
  } = event.data as {
    type: string;
    requestId: string;
    projectName?: string;
    width: number;
    height: number;
    pixels: Uint8ClampedArray;
    sourceImageUrl?: string;
    lockedCells?: MosaicCell[];
    gridWidth: number;
    gridHeight: number;
    sectionWidth?: number;
    sectionHeight?: number;
    colorLimit?: number;
    mode?: 'balanced' | 'pixel-art';
    palette: Array<{ id: string; name: string; hex: string; rgb: { r: number; g: number; b: number } }>;
    backgroundColor?: string;
  };

  if (type !== 'generate') {
    return;
  }

  try {
    const result = generateMosaicFromPixels({
      width,
      height,
      pixels: new Uint8ClampedArray(pixels),
      gridWidth,
      gridHeight,
      sectionWidth,
      sectionHeight,
      colorLimit,
      mode,
      lockedCells,
      palette,
      backgroundColor: backgroundColor ?? '#ffffff',
    });

    const payload = {
      type: 'result',
      requestId,
      result: {
        id: requestId,
        name: projectName || 'Generated mosaic',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sourceImageUrl: sourceImageUrl ?? '',
        sourceName: projectName || 'Generated mosaic',
        pixelWidth: width,
        pixelHeight: height,
        gridWidth,
        gridHeight,
        sectionWidth,
        sectionHeight,
        colorLimit,
        mode,
        selectedPaletteIds: palette.map((color) => color.id),
        palette: result.palette,
        materialList: result.materialList,
        cells: result.cells,
        sections: result.sections,
      },
    };

    self.postMessage(payload);
  } catch (error) {
    self.postMessage({
      type: 'error',
      requestId,
      error: error instanceof Error ? error.message : 'Failed to generate mosaic',
    });
  }
};
