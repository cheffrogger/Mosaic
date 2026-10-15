import { useEffect, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent, type MouseEvent } from 'react';
import { applyColorReplacement, buildAdaptivePaletteFromPixels, buildDemoPalette, buildMaterialList, calculateCropRect, cropImageData, type MaterialItem, type MosaicCell, type PaletteColor } from '@mosaic/core';

const DEFAULT_GRID_WIDTH = 32;
const DEFAULT_GRID_HEIGHT = 32;
const DEFAULT_SECTION_WIDTH = 16;
const DEFAULT_SECTION_HEIGHT = 16;
const DEFAULT_COLOR_LIMIT = 8;
const DEMO_PALETTE = buildDemoPalette();
const DB_NAME = 'mosaic-projects';
const STORE_NAME = 'projects';

function createId() {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export type SavedProject = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  sourceImageUrl: string;
  sourceName?: string;
  pixelWidth: number;
  pixelHeight: number;
  crop: { x: number; y: number; width: number; height: number };
  gridWidth: number;
  gridHeight: number;
  sectionWidth: number;
  sectionHeight: number;
  colorLimit: number;
  mode: 'balanced' | 'pixel-art';
  selectedPaletteIds: string[];
  palette: PaletteColor[];
  materialList: MaterialItem[];
  cells: MosaicCell[];
  sections: Array<{ id: string; startX: number; startY: number; width: number; height: number; cellCount: number }>;
};

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB open failed'));
  });
}

async function saveProject(project: SavedProject) {
  const database = await openDatabase();
  return new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(project);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error('Project save failed'));
  });
}

async function loadProjects(): Promise<SavedProject[]> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => {
      const records = (request.result ?? []) as SavedProject[];
      resolve(records.map((record) => ({
        ...record,
        cells: (record.cells ?? []).map((cell) => ({ ...cell, locked: cell.locked === true })),
      })));
    };
    request.onerror = () => reject(request.error ?? new Error('Project load failed'));
  });
}

async function readImageFile(file: File): Promise<{ imageData: ImageData; previewUrl: string }> {
  const previewUrl = URL.createObjectURL(file);
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const nextImage = new Image();
    nextImage.onload = () => resolve(nextImage);
    nextImage.onerror = () => reject(new Error('Could not decode image file'));
    nextImage.src = previewUrl;
  });

  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas context is unavailable in this browser');
  }

  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return { imageData, previewUrl };
}

function rgbToHex({ r, g, b }: { r: number; g: number; b: number }) {
  const toHex = (value: number) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function drawMosaicPreview(canvas: HTMLCanvasElement | null, cells: SavedProject['cells'] | undefined, gridWidth: number, gridHeight: number, selectedCellId: string | null) {
  if (!canvas || !cells || cells.length === 0) {
    return;
  }

  const context = canvas.getContext('2d');
  if (!context) {
    return;
  }

  context.clearRect(0, 0, canvas.width, canvas.height);
  const cellWidth = canvas.width / Math.max(gridWidth, 1);
  const cellHeight = canvas.height / Math.max(gridHeight, 1);

  cells.forEach((cell) => {
    const x = cell.x * cellWidth;
    const y = cell.y * cellHeight;
    context.fillStyle = rgbToHex(cell.rgb);
    context.fillRect(x, y, cellWidth + 0.5, cellHeight + 0.5);

    if (cell.locked || cell.id === selectedCellId) {
      context.strokeStyle = cell.id === selectedCellId ? '#e68756' : 'rgba(32, 49, 43, 0.9)';
      context.lineWidth = cell.id === selectedCellId ? 2 : 1;
      context.strokeRect(x + 0.5, y + 0.5, Math.max(cellWidth - 1, 0.5), Math.max(cellHeight - 1, 0.5));
    }
  });
}

function getPaletteSelection(ids: string[]) {
  if (ids.length === 0) {
    return [DEMO_PALETTE[0].id];
  }
  return ids;
}

function createBaseProjectFromImage({
  imageData,
  fileName,
  previewUrl,
  gridWidth,
  gridHeight,
  sectionWidth,
  sectionHeight,
  colorLimit,
  mode,
  selectedPaletteIds,
  palette,
  crop,
}: {
  imageData: ImageData;
  fileName: string;
  previewUrl: string;
  gridWidth: number;
  gridHeight: number;
  sectionWidth: number;
  sectionHeight: number;
  colorLimit: number;
  mode: 'balanced' | 'pixel-art';
  selectedPaletteIds: string[];
  palette: PaletteColor[];
  crop: { x: number; y: number; width: number; height: number };
}): SavedProject {
  const projectName = fileName.replace(/\.[^.]+$/, '') || 'Generated mosaic';
  return {
    id: createId(),
    name: projectName,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sourceImageUrl: previewUrl,
    sourceName: fileName,
    pixelWidth: imageData.width,
    pixelHeight: imageData.height,
    crop,
    gridWidth,
    gridHeight,
    sectionWidth,
    sectionHeight,
    colorLimit,
    mode,
    selectedPaletteIds: [...selectedPaletteIds],
    palette,
    materialList: [],
    cells: [],
    sections: [],
  };
}

export default function App() {
  const workerRef = useRef<Worker | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [project, setProject] = useState<SavedProject | null>(null);
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [history, setHistory] = useState<SavedProject[]>([]);
  const [status, setStatus] = useState('Load a local image to start the mosaic flow.');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastImageData, setLastImageData] = useState<ImageData | null>(null);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropCenterX, setCropCenterX] = useState(0.5);
  const [cropCenterY, setCropCenterY] = useState(0.5);
  const [crop, setCrop] = useState<{ x: number; y: number; width: number; height: number }>({ x: 0, y: 0, width: 0, height: 0 });
  const generationSignatureRef = useRef('');
  const [gridWidth, setGridWidth] = useState(DEFAULT_GRID_WIDTH);
  const [gridHeight, setGridHeight] = useState(DEFAULT_GRID_HEIGHT);
  const [sectionWidth, setSectionWidth] = useState(DEFAULT_SECTION_WIDTH);
  const [sectionHeight, setSectionHeight] = useState(DEFAULT_SECTION_HEIGHT);
  const [colorLimit, setColorLimit] = useState(DEFAULT_COLOR_LIMIT);
  const [mode, setMode] = useState<'balanced' | 'pixel-art'>('balanced');
  const [imagePalette, setImagePalette] = useState<PaletteColor[]>(DEMO_PALETTE);
  const [selectedPaletteIds, setSelectedPaletteIds] = useState<string[]>(getPaletteSelection(DEMO_PALETTE.map((color) => color.id)));
  const [replacementSourceId, setReplacementSourceId] = useState(DEMO_PALETTE[0]?.id ?? '');
  const [replacementTargetId, setReplacementTargetId] = useState(DEMO_PALETTE[1]?.id ?? DEMO_PALETTE[0]?.id ?? '');

  useEffect(() => {
    const worker = new Worker(new URL('./workers/mosaic.worker.ts', import.meta.url), { type: 'module' });
    workerRef.current = worker;

    worker.onmessage = (event) => {
      const { type, result, error } = event.data as {
        type: 'result' | 'error';
        result?: SavedProject;
        error?: string;
      };

      if (type === 'result' && result) {
        setProject(result);
        setSelectedCellId((current) => result.cells.some((cell) => cell.id === current) ? current : result.cells[0]?.id ?? null);
        setStatus(`Generated ${result.gridWidth}×${result.gridHeight} mosaic with ${result.materialList.reduce((sum, item) => sum + item.count, 0)} cells.`);
        setIsGenerating(false);
      }

      if (type === 'error') {
        setStatus(error ?? 'Generation failed');
        setIsGenerating(false);
      }
    };

    return () => worker.terminate();
  }, []);

  useEffect(() => {
    drawMosaicPreview(canvasRef.current, project?.cells, project?.gridWidth ?? gridWidth, project?.gridHeight ?? gridHeight, selectedCellId);
  }, [project, gridWidth, gridHeight, selectedCellId]);

  const materialTotal = useMemo(() => project?.materialList.reduce((sum, item) => sum + item.count, 0) ?? 0, [project]);
  const activePalette = useMemo(() => imagePalette.filter((color) => selectedPaletteIds.includes(color.id)), [imagePalette, selectedPaletteIds]);
  const effectiveCrop = useMemo(() => {
    if (!lastImageData) {
      return crop.width > 0 ? crop : null;
    }

    return calculateCropRect({
      sourceWidth: lastImageData.width,
      sourceHeight: lastImageData.height,
      targetAspect: gridWidth / gridHeight,
      zoom: cropZoom,
      centerX: cropCenterX,
      centerY: cropCenterY,
    });
  }, [crop, cropCenterX, cropCenterY, cropZoom, gridHeight, gridWidth, lastImageData]);

  useEffect(() => {
    if (!(lastImageData && gridWidth && gridHeight)) {
      return;
    }

    const nextCrop = calculateCropRect({
      sourceWidth: lastImageData.width,
      sourceHeight: lastImageData.height,
      targetAspect: gridWidth / gridHeight,
      zoom: cropZoom,
      centerX: cropCenterX,
      centerY: cropCenterY,
    });
    setCrop(nextCrop);
  }, [cropCenterX, cropCenterY, cropZoom, gridHeight, gridWidth, lastImageData]);

  useEffect(() => {
    void (async () => {
      try {
        const records = await loadProjects();
        setSavedProjects(records.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)));
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  const getGenerationSignature = () => JSON.stringify({
    imageWidth: lastImageData?.width ?? 0,
    imageHeight: lastImageData?.height ?? 0,
    gridWidth,
    gridHeight,
    sectionWidth,
    sectionHeight,
    colorLimit,
    mode,
    cropZoom,
    cropCenterX,
    cropCenterY,
    palette: selectedPaletteIds,
  });

  useEffect(() => {
    if (!lastImageData || !project || isGenerating) {
      return;
    }

    const nextSignature = getGenerationSignature();
    if (generationSignatureRef.current === nextSignature) {
      return;
    }

    generationSignatureRef.current = nextSignature;
    handleRefreshGeneration();
  }, [cropCenterX, cropCenterY, cropZoom, colorLimit, gridHeight, gridWidth, isGenerating, lastImageData, mode, project, sectionHeight, sectionWidth, selectedPaletteIds]);

  const togglePaletteColor = (colorId: string) => {
    setSelectedPaletteIds((current) => {
      const next = current.includes(colorId)
        ? current.filter((id) => id !== colorId)
        : [...current, colorId];
      return next.length === 0 ? [imagePalette[0]?.id ?? DEMO_PALETTE[0].id] : next;
    });
  };

  const enqueueGeneration = ({
    imageData,
    sourceName,
    projectName,
    previewUrl,
    readyProject,
    lockedCells,
  }: {
    imageData: ImageData;
    sourceName: string;
    projectName: string;
    previewUrl?: string;
    readyProject?: SavedProject;
    lockedCells?: MosaicCell[];
  }) => {
    const worker = workerRef.current;
    if (!worker) {
      throw new Error('Worker is not ready');
    }

    const workingImageData = cropImageData(imageData, effectiveCrop ?? calculateCropRect({
      sourceWidth: imageData.width,
      sourceHeight: imageData.height,
      targetAspect: gridWidth / gridHeight,
      zoom: cropZoom,
      centerX: cropCenterX,
      centerY: cropCenterY,
    }));

    const payload = {
      type: 'generate',
      requestId: createId(),
      projectName,
      width: workingImageData.width,
      height: workingImageData.height,
      pixels: workingImageData.data,
      sourceImageUrl: readyProject?.sourceImageUrl ?? previewUrl ?? project?.sourceImageUrl ?? '',
      lockedCells,
      gridWidth,
      gridHeight,
      sectionWidth,
      sectionHeight,
      colorLimit,
      mode,
      palette: activePalette.length ? activePalette : DEMO_PALETTE,
      backgroundColor: '#ffffff',
    };

    const optimisticProject = readyProject ?? createBaseProjectFromImage({
      imageData,
      fileName: sourceName,
      previewUrl: previewUrl ?? project?.sourceImageUrl ?? '',
      gridWidth,
      gridHeight,
      sectionWidth,
      sectionHeight,
      colorLimit,
      mode,
      selectedPaletteIds: [...selectedPaletteIds],
      palette: activePalette.length ? activePalette : DEMO_PALETTE,
      crop: effectiveCrop ?? calculateCropRect({
        sourceWidth: imageData.width,
        sourceHeight: imageData.height,
        targetAspect: gridWidth / gridHeight,
        zoom: cropZoom,
        centerX: cropCenterX,
        centerY: cropCenterY,
      }),
    });

    setProject(optimisticProject);
    setStatus(`Generating ${projectName}...`);
    setIsGenerating(true);
    worker.postMessage(payload, [workingImageData.data.buffer]);
  };

  const handleImageLoad = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      setStatus(`Decoding ${file.name}...`);
      const { imageData, previewUrl } = await readImageFile(file);
      setLastImageData(imageData);
      const generatedPalette = buildAdaptivePaletteFromPixels({
        width: imageData.width,
        height: imageData.height,
        pixels: imageData.data,
        targetCount: Math.max(12, Math.min(24, Math.round((gridWidth * gridHeight) / 12))),
        basePalette: DEMO_PALETTE,
      });
      setImagePalette(generatedPalette);
      setSelectedPaletteIds(generatedPalette.map((color) => color.id));
      const nextCrop = calculateCropRect({
        sourceWidth: imageData.width,
        sourceHeight: imageData.height,
        targetAspect: gridWidth / gridHeight,
        zoom: cropZoom,
        centerX: cropCenterX,
        centerY: cropCenterY,
      });
      setCrop(nextCrop);
      generationSignatureRef.current = JSON.stringify({
        imageWidth: imageData.width,
        imageHeight: imageData.height,
        gridWidth,
        gridHeight,
        sectionWidth,
        sectionHeight,
        colorLimit,
        mode,
        cropZoom,
        cropCenterX,
        cropCenterY,
        palette: selectedPaletteIds,
      });
      const projectName = file.name.replace(/\.[^.]+$/, '') || 'Generated mosaic';
      const nextProject = createBaseProjectFromImage({
        imageData,
        fileName: file.name,
        previewUrl,
        gridWidth,
        gridHeight,
        sectionWidth,
        sectionHeight,
        colorLimit,
        mode,
        selectedPaletteIds: [...selectedPaletteIds],
        palette: activePalette.length ? activePalette : DEMO_PALETTE,
        crop: nextCrop,
      });

      setProject(nextProject);
      enqueueGeneration({
        imageData,
        sourceName: file.name,
        projectName,
        previewUrl,
        readyProject: nextProject,
      });
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Image import failed');
      setIsGenerating(false);
    }
  };

  const handleRefreshGeneration = () => {
    if (!lastImageData) {
      setStatus('Load a local image before regenerating the mosaic.');
      return;
    }

    if (!project) {
      setStatus('No project is available to refresh yet.');
      return;
    }

    const sourceName = project.sourceName ?? 'Generated mosaic';
    const projectName = project.name || sourceName.replace(/\.[^.]+$/, '') || 'Generated mosaic';
    const lockedCells = project.gridWidth === gridWidth && project.gridHeight === gridHeight
      ? project.cells.filter((cell) => cell.locked)
      : [];
    generationSignatureRef.current = JSON.stringify({
      imageWidth: lastImageData.width,
      imageHeight: lastImageData.height,
      gridWidth,
      gridHeight,
      sectionWidth,
      sectionHeight,
      colorLimit,
      mode,
      cropZoom,
      cropCenterX,
      cropCenterY,
      palette: selectedPaletteIds,
    });
    const nextProject = {
      ...project,
      id: createId(),
      name: projectName,
      updatedAt: new Date().toISOString(),
      crop: effectiveCrop ?? project.crop,
      gridWidth,
      gridHeight,
      sectionWidth,
      sectionHeight,
      colorLimit,
      mode,
      selectedPaletteIds: [...selectedPaletteIds],
      palette: activePalette.length ? activePalette : DEMO_PALETTE,
    } satisfies SavedProject;

    setHistory((current) => [...current.slice(-9), project]);
    setProject(nextProject);
    enqueueGeneration({
      imageData: lastImageData,
      sourceName,
      projectName,
      previewUrl: project.sourceImageUrl,
      readyProject: nextProject,
      lockedCells,
    });
  };

  const handleUndo = () => {
    const previous = history[history.length - 1];
    if (!previous) {
      setStatus('There is no previous project state to restore.');
      return;
    }

    setHistory((current) => current.slice(0, -1));
    setProject(previous);
    setStatus(`Restored ${previous.name} from the recent project history.`);
  };

  const handleExportProject = () => {
    if (!project) {
      return;
    }

    const payload = JSON.stringify({ ...project, updatedAt: new Date().toISOString() }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${project.name.replace(/\s+/g, '-').toLowerCase() || 'mosaic-project'}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setStatus(`Exported ${project.name} as a portable project file.`);
  };

  const handleImportProject = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const payload = JSON.parse(await file.text()) as Partial<SavedProject>;
      if (!payload.id || !payload.name) {
        throw new Error('The project file is incomplete.');
      }

      const record = {
        ...payload,
        id: payload.id,
        name: payload.name,
        sourceImageUrl: payload.sourceImageUrl ?? '',
        crop: payload.crop ?? { x: 0, y: 0, width: payload.pixelWidth ?? 0, height: payload.pixelHeight ?? 0 },
        gridWidth: payload.gridWidth ?? DEFAULT_GRID_WIDTH,
        gridHeight: payload.gridHeight ?? DEFAULT_GRID_HEIGHT,
        sectionWidth: payload.sectionWidth ?? DEFAULT_SECTION_WIDTH,
        sectionHeight: payload.sectionHeight ?? DEFAULT_SECTION_HEIGHT,
        colorLimit: payload.colorLimit ?? DEFAULT_COLOR_LIMIT,
        mode: payload.mode ?? 'balanced',
        selectedPaletteIds: payload.selectedPaletteIds && payload.selectedPaletteIds.length ? payload.selectedPaletteIds : DEMO_PALETTE.map((color) => color.id),
        palette: payload.palette && payload.palette.length ? payload.palette : DEMO_PALETTE,
        materialList: payload.materialList ?? [],
        cells: payload.cells ?? [],
        sections: payload.sections ?? [],
      } as SavedProject;
      record.cells = record.cells.map((cell) => ({ ...cell, locked: cell.locked === true }));

      setProject(record);
      setSelectedCellId(record.cells[0]?.id ?? null);
      setLastImageData(null);
      setGridWidth(record.gridWidth);
      setGridHeight(record.gridHeight);
      setSectionWidth(record.sectionWidth);
      setSectionHeight(record.sectionHeight);
      setColorLimit(record.colorLimit);
      setMode(record.mode);
      setSelectedPaletteIds(record.selectedPaletteIds);
      setStatus(`Imported ${record.name} from a portable project file.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'The project file could not be imported.');
    }
  };

  const handleApplyColorReplacement = () => {
    if (!project || !replacementSourceId || !replacementTargetId || replacementSourceId === replacementTargetId) {
      return;
    }

    const palette = project.palette.length ? project.palette : DEMO_PALETTE;
    const replacement = applyColorReplacement({
      cells: project.cells,
      palette,
      sourceColorId: replacementSourceId,
      targetColorId: replacementTargetId,
    });

    setHistory((current) => [...current.slice(-9), project]);
    setProject({
      ...project,
      cells: replacement.cells,
      materialList: replacement.materialList,
      updatedAt: new Date().toISOString(),
    });
    setStatus(`Replaced ${replacementSourceId} with ${replacementTargetId}.`);
  };

  const selectedCell = project?.cells.find((cell) => cell.id === selectedCellId);

  const handleMosaicClick = (event: MouseEvent<HTMLCanvasElement>) => {
    if (!project) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.min(project.gridWidth - 1, Math.max(0, Math.floor(((event.clientX - bounds.left) / bounds.width) * project.gridWidth)));
    const y = Math.min(project.gridHeight - 1, Math.max(0, Math.floor(((event.clientY - bounds.top) / bounds.height) * project.gridHeight)));
    const cell = project.cells.find((item) => item.x === x && item.y === y);
    if (cell) {
      setSelectedCellId(cell.id);
    }
  };

  const handleMosaicKeyDown = (event: KeyboardEvent<HTMLCanvasElement>) => {
    if (!project?.cells.length) {
      return;
    }

    const current = selectedCell ?? project.cells[0];
    let x = current.x;
    let y = current.y;

    if (event.key === 'ArrowLeft') x = Math.max(0, x - 1);
    else if (event.key === 'ArrowRight') x = Math.min(project.gridWidth - 1, x + 1);
    else if (event.key === 'ArrowUp') y = Math.max(0, y - 1);
    else if (event.key === 'ArrowDown') y = Math.min(project.gridHeight - 1, y + 1);
    else return;

    event.preventDefault();
    const nextCell = project.cells.find((cell) => cell.x === x && cell.y === y);
    if (nextCell) {
      setSelectedCellId(nextCell.id);
    }
  };

  const handleSelectedCellColorChange = (event: ChangeEvent<HTMLSelectElement>) => {
    if (!project || !selectedCell || selectedCell.locked) {
      return;
    }

    const targetColor = project.palette.find((color) => color.id === event.target.value);
    if (!targetColor || targetColor.id === selectedCell.colorId) {
      return;
    }

    const cells = project.cells.map((cell) => cell.id === selectedCell.id
      ? { ...cell, colorId: targetColor.id, rgb: { ...targetColor.rgb } }
      : cell);
    setHistory((current) => [...current.slice(-9), project]);
    setProject({ ...project, cells, materialList: buildMaterialList(cells, project.palette), updatedAt: new Date().toISOString() });
    setStatus(`Changed cell ${selectedCell.y + 1}, ${selectedCell.x + 1} to ${targetColor.name}.`);
  };

  const handleToggleSelectedCellLock = () => {
    if (!project || !selectedCell) {
      return;
    }

    const locked = !selectedCell.locked;
    const cells = project.cells.map((cell) => cell.id === selectedCell.id ? { ...cell, locked } : cell);
    setHistory((current) => [...current.slice(-9), project]);
    setProject({ ...project, cells, updatedAt: new Date().toISOString() });
    setStatus(`${locked ? 'Locked' : 'Unlocked'} cell ${selectedCell.y + 1}, ${selectedCell.x + 1}.`);
  };

  const handleSave = async () => {
    if (!project) {
      return;
    }

    try {
      setStatus('Saving local project...');
      const saved = {
        ...project,
        id: project.id || createId(),
        updatedAt: new Date().toISOString(),
        crop: effectiveCrop ?? project.crop,
        gridWidth,
        gridHeight,
        sectionWidth,
        sectionHeight,
        colorLimit,
        mode,
        selectedPaletteIds: [...selectedPaletteIds],
        palette: activePalette,
      };
      await saveProject(saved);
      const refreshed = await loadProjects();
      setSavedProjects(refreshed.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)));
      setStatus('Project saved locally in IndexedDB.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Save failed');
    }
  };

  const handleOpenSavedProject = async (projectId: string) => {
    const record = savedProjects.find((item) => item.id === projectId);
    if (!record) {
      return;
    }

    setGridWidth(record.gridWidth || DEFAULT_GRID_WIDTH);
    setGridHeight(record.gridHeight || DEFAULT_GRID_HEIGHT);
    setSectionWidth(record.sectionWidth || DEFAULT_SECTION_WIDTH);
    setSectionHeight(record.sectionHeight || DEFAULT_SECTION_HEIGHT);
    setColorLimit(record.colorLimit || DEFAULT_COLOR_LIMIT);
    setMode(record.mode || 'balanced');
    setSelectedPaletteIds(record.selectedPaletteIds && record.selectedPaletteIds.length ? record.selectedPaletteIds : DEMO_PALETTE.map((color) => color.id));
    setCrop(record.crop ?? { x: 0, y: 0, width: record.pixelWidth || 0, height: record.pixelHeight || 0 });
    generationSignatureRef.current = JSON.stringify({
      imageWidth: record.pixelWidth || 0,
      imageHeight: record.pixelHeight || 0,
      gridWidth: record.gridWidth || DEFAULT_GRID_WIDTH,
      gridHeight: record.gridHeight || DEFAULT_GRID_HEIGHT,
      sectionWidth: record.sectionWidth || DEFAULT_SECTION_WIDTH,
      sectionHeight: record.sectionHeight || DEFAULT_SECTION_HEIGHT,
      colorLimit: record.colorLimit || DEFAULT_COLOR_LIMIT,
      mode: record.mode || 'balanced',
      cropZoom: 1,
      cropCenterX: 0.5,
      cropCenterY: 0.5,
      palette: record.selectedPaletteIds && record.selectedPaletteIds.length ? record.selectedPaletteIds : DEMO_PALETTE.map((color) => color.id),
    });
    setProject(record);
    setSelectedCellId(record.cells[0]?.id ?? null);
    setStatus(`Opened ${record.name} from local storage.`);
  };

  const headingLabel = `${project?.gridWidth ?? gridWidth}×${project?.gridHeight ?? gridHeight}`;
  const paletteLimit = Math.max(DEMO_PALETTE.length, imagePalette.length);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">M3 · correction and safety</p>
          <h1>Mosaic builder</h1>
        </div>
        <div className="top-actions">
          <label className="file-picker">
            <input type="file" accept="image/*" onChange={handleImageLoad} />
            Load image
          </label>
          <button type="button" onClick={handleRefreshGeneration} disabled={!lastImageData || isGenerating}>
            Refresh mosaic
          </button>
          <button type="button" onClick={handleUndo} disabled={!history.length}>
            Undo
          </button>
          <button type="button" onClick={handleSave} disabled={!project || isGenerating}>
            Save locally
          </button>
        </div>
      </header>

      <section className="status-panel">
        <strong>Status:</strong> <span>{status}</span>
      </section>

      <section className="panel controls-panel">
        <h3>M2 settings</h3>
        <div className="controls-grid">
          <label>
            Grid width
            <input type="number" min={1} max={256} value={gridWidth} onChange={(event) => setGridWidth(Number(event.target.value) || DEFAULT_GRID_WIDTH)} />
          </label>
          <label>
            Grid height
            <input type="number" min={1} max={256} value={gridHeight} onChange={(event) => setGridHeight(Number(event.target.value) || DEFAULT_GRID_HEIGHT)} />
          </label>
          <label>
            Section width
            <input type="number" min={1} max={256} value={sectionWidth} onChange={(event) => setSectionWidth(Number(event.target.value) || DEFAULT_SECTION_WIDTH)} />
          </label>
          <label>
            Section height
            <input type="number" min={1} max={256} value={sectionHeight} onChange={(event) => setSectionHeight(Number(event.target.value) || DEFAULT_SECTION_HEIGHT)} />
          </label>
          <label>
            Color limit (K)
            <input type="number" min={1} max={paletteLimit} value={Math.min(colorLimit, paletteLimit)} onChange={(event) => setColorLimit(Math.max(1, Math.min(Number(event.target.value) || 1, paletteLimit)))} />
          </label>
          <label>
            Mode
            <select value={mode} onChange={(event) => setMode(event.target.value as 'balanced' | 'pixel-art')}>
              <option value="balanced">Balanced</option>
              <option value="pixel-art">Pixel Art</option>
            </select>
          </label>
        </div>
      </section>

      <section className="panel controls-panel">
        <h3>Image crop and zoom</h3>
        <div className="controls-grid">
          <label>
            Zoom
            <input type="range" min={1} max={4} step={0.1} value={cropZoom} onChange={(event) => setCropZoom(Number(event.target.value))} />
          </label>
          <label>
            Crop X ({cropCenterX.toFixed(2)})
            <input type="range" min={0} max={1} step={0.01} value={cropCenterX} onChange={(event) => setCropCenterX(Number(event.target.value))} />
          </label>
          <label>
            Crop Y ({cropCenterY.toFixed(2)})
            <input type="range" min={0} max={1} step={0.01} value={cropCenterY} onChange={(event) => setCropCenterY(Number(event.target.value))} />
          </label>
          {effectiveCrop && (
            <span className="summary-line">
              <span>Crop {effectiveCrop.width.toFixed(0)}×{effectiveCrop.height.toFixed(0)}</span>
              <span>at {effectiveCrop.x.toFixed(0)},{effectiveCrop.y.toFixed(0)}</span>
            </span>
          )}
        </div>
      </section>

      <section className="layout-grid">
        <div className="panel">
          <h2>Source</h2>
          {project?.sourceImageUrl ? (
            <div className="source-preview-wrap" style={{ position: 'relative', aspectRatio: `${project.pixelWidth || 1} / ${project.pixelHeight || 1}` }}>
              <img src={project.sourceImageUrl} alt="Selected source" className="source-preview" style={{ objectFit: 'contain' }} />
              {effectiveCrop && (
                <div
                  className="source-crop-overlay"
                  style={{
                    position: 'absolute',
                    left: `${(effectiveCrop.x / Math.max(project.pixelWidth, 1)) * 100}%`,
                    top: `${(effectiveCrop.y / Math.max(project.pixelHeight, 1)) * 100}%`,
                    width: `${(effectiveCrop.width / Math.max(project.pixelWidth, 1)) * 100}%`,
                    height: `${(effectiveCrop.height / Math.max(project.pixelHeight, 1)) * 100}%`,
                    border: '2px solid rgba(255,255,255,0.95)',
                    background: 'rgba(255,255,255,0.12)',
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.32)',
                    borderRadius: '4px',
                  }}
                />
              )}
            </div>
          ) : (
            <div className="empty-box">No image loaded yet</div>
          )}
        </div>

        <div className="panel">
          <h2>{headingLabel} mosaic</h2>
          <canvas
            ref={canvasRef}
            width={320}
            height={320}
            className="mosaic-canvas"
            role="grid"
            aria-label="Mosaic grid"
            aria-describedby="selected-cell-description"
            aria-rowcount={project?.gridHeight ?? gridHeight}
            aria-colcount={project?.gridWidth ?? gridWidth}
            tabIndex={project ? 0 : -1}
            onClick={handleMosaicClick}
            onKeyDown={handleMosaicKeyDown}
          />
          {project && (
            <div className="summary-line">
              <span>{materialTotal} tiles required</span>
              <span>{project.materialList.length} colors used</span>
            </div>
          )}
          <div className="cell-editor" aria-live="polite">
            {selectedCell && project ? (
              <>
                <p id="selected-cell-description">
                  Cell {selectedCell.y + 1}, {selectedCell.x + 1} · {project.palette.find((color) => color.id === selectedCell.colorId)?.name ?? selectedCell.colorId}{selectedCell.locked ? ' · locked' : ''}
                </p>
                <div className="controls-grid narrow">
                  <label>
                    Selected cell color
                    <select aria-label="Selected cell color" value={selectedCell.colorId} disabled={selectedCell.locked} onChange={handleSelectedCellColorChange}>
                      {project.palette.map((color) => (
                        <option key={color.id} value={color.id}>{color.name}</option>
                      ))}
                    </select>
                  </label>
                  <button type="button" onClick={handleToggleSelectedCellLock}>
                    {selectedCell.locked ? 'Unlock cell' : 'Lock cell'}
                  </button>
                </div>
              </>
            ) : (
              <p id="selected-cell-description">Select a cell on the mosaic to edit it.</p>
            )}
          </div>
        </div>
      </section>

      <section className="bottom-grid">
        <div className="panel">
          <details className="palette-disclosure">
            <summary>
              <span>Demo palette (local only)</span>
              <span className="palette-count">{activePalette.length} selected</span>
            </summary>
            <div className="palette-grid">
              {imagePalette.map((color: PaletteColor) => (
                <label key={color.id} className="swatch-row clickable">
                  <input type="checkbox" checked={selectedPaletteIds.includes(color.id)} onChange={() => togglePaletteColor(color.id)} />
                  <span className="swatch" style={{ backgroundColor: color.hex }} />
                  <span>{color.name}</span>
                  <code>{color.hex}</code>
                </label>
              ))}
            </div>
          </details>
        </div>

        <div className="panel">
          <h3>Material list</h3>
          {project?.materialList.length ? (
            <ul className="material-list">
              {project.materialList.map((item) => (
                <li key={item.colorId}>
                  <span className="swatch tiny" style={{ backgroundColor: item.hex }} />
                  <span>{item.name}</span>
                  <strong>{item.count}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-box">Material list will appear after generation.</div>
          )}
        </div>
      </section>

      <section className="bottom-grid">
        <div className="panel">
          <h3>Color replacement</h3>
          <div className="controls-grid narrow">
            <label>
              Replace
              <select value={replacementSourceId} onChange={(event) => setReplacementSourceId(event.target.value)}>
                {(project?.palette.length ? project.palette : imagePalette).map((color) => (
                  <option key={color.id} value={color.id}>{color.name}</option>
                ))}
              </select>
            </label>
            <label>
              With
              <select value={replacementTargetId} onChange={(event) => setReplacementTargetId(event.target.value)}>
                {(project?.palette.length ? project.palette : imagePalette).map((color) => (
                  <option key={color.id} value={color.id}>{color.name}</option>
                ))}
              </select>
            </label>
          </div>
          <button type="button" onClick={handleApplyColorReplacement} disabled={!project || replacementSourceId === replacementTargetId}>
            Apply replacement
          </button>
        </div>

        <div className="panel">
          <h3>Project files</h3>
          <div className="controls-grid narrow">
            <button type="button" onClick={handleExportProject} disabled={!project}>
              Export project JSON
            </button>
            <label className="file-picker compact">
              <input type="file" accept="application/json" onChange={handleImportProject} />
              Import project JSON
            </label>
          </div>
        </div>
      </section>

      <section className="panel">
        <h3>Stored projects</h3>
        {savedProjects.length ? (
          <div className="saved-projects">
            {savedProjects.map((savedProject) => (
              <button key={savedProject.id} type="button" onClick={() => void handleOpenSavedProject(savedProject.id)}>
                {savedProject.name} · {savedProject.updatedAt.slice(0, 10)}
              </button>
            ))}
          </div>
        ) : (
          <div className="empty-box">No saved projects yet. Use Save locally after generating a mosaic.</div>
        )}
      </section>
    </main>
  );
}
