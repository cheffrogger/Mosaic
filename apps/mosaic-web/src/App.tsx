import { useEffect, useMemo, useRef, useState } from 'react';
import { buildDemoPalette, type MaterialItem, type PaletteColor } from '@mosaic/core';

const GRID_SIZE = 32;
const DEMO_PALETTE = buildDemoPalette();
const DB_NAME = 'mosaic-projects';
const STORE_NAME = 'projects';

export type SavedProject = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  sourceImageUrl: string;
  sourceName?: string;
  pixelWidth: number;
  pixelHeight: number;
  gridWidth: number;
  gridHeight: number;
  palette: PaletteColor[];
  materialList: MaterialItem[];
  cells: Array<{ id: string; x: number; y: number; colorId: string; rgb: { r: number; g: number; b: number }; sectionId: string }>;
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
    request.onsuccess = () => resolve((request.result ?? []) as SavedProject[]);
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

function drawMosaicPreview(canvas: HTMLCanvasElement | null, cells: SavedProject['cells'] | undefined) {
  if (!canvas || !cells || cells.length === 0) {
    return;
  }

  const context = canvas.getContext('2d');
  if (!context) {
    return;
  }

  const size = Math.min(canvas.width, canvas.height) / GRID_SIZE;
  context.clearRect(0, 0, canvas.width, canvas.height);

  cells.forEach((cell) => {
    const x = cell.x * size;
    const y = cell.y * size;
    context.fillStyle = rgbToHex(cell.rgb);
    context.fillRect(x, y, size + 1, size + 1);
  });
}

export default function App() {
  const workerRef = useRef<Worker | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [project, setProject] = useState<SavedProject | null>(null);
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [status, setStatus] = useState('Load a local image to start the first 32×32 mosaic flow.');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const worker = new Worker(new URL('./workers/mosaic.worker.ts', import.meta.url), { type: 'module' });
    workerRef.current = worker;

    worker.onmessage = (event) => {
      const { type, requestId, result, error } = event.data as {
        type: 'result' | 'error';
        requestId?: string;
        result?: SavedProject;
        error?: string;
      };

      if (type === 'result' && result) {
        setProject(result);
        setStatus(`Generated 32×32 mosaic with ${result.materialList.reduce((sum, item) => sum + item.count, 0)} cells.`);
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
    drawMosaicPreview(canvasRef.current, project?.cells);
  }, [project]);

  const materialTotal = useMemo(() => project?.materialList.reduce((sum, item) => sum + item.count, 0) ?? 0, [project]);

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

  const handleImageLoad = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      setIsGenerating(true);
      setStatus(`Decoding ${file.name}...`);
      const { imageData, previewUrl } = await readImageFile(file);
      const worker = workerRef.current;
      if (!worker) {
        throw new Error('Worker is not ready');
      }

      const requestId = crypto.randomUUID();
      const projectName = file.name.replace(/\.[^.]+$/, '') || 'Generated mosaic';
      const payload = {
        type: 'generate',
        requestId,
        projectName,
        width: imageData.width,
        height: imageData.height,
        pixels: imageData.data,
        gridWidth: GRID_SIZE,
        gridHeight: GRID_SIZE,
        palette: DEMO_PALETTE,
        backgroundColor: '#ffffff',
      };

      worker.postMessage(payload, [imageData.data.buffer]);
      setProject((current) => current ? { ...current, sourceImageUrl: previewUrl, sourceName: file.name, name: projectName } : {
        id: requestId,
        name: projectName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sourceImageUrl: previewUrl,
        sourceName: file.name,
        pixelWidth: imageData.width,
        pixelHeight: imageData.height,
        gridWidth: GRID_SIZE,
        gridHeight: GRID_SIZE,
        palette: DEMO_PALETTE,
        materialList: [],
        cells: [],
        sections: [],
      });
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Image import failed');
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!project) {
      return;
    }

    try {
      setStatus('Saving local project...');
      const saved = {
        ...project,
        id: project.id || crypto.randomUUID(),
        updatedAt: new Date().toISOString(),
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

    setProject(record);
    setStatus(`Opened ${record.name} from local storage.`);
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">M1 vertical slice</p>
          <h1>Mosaic 32×32 flow</h1>
        </div>
        <div className="top-actions">
          <label className="file-picker">
            <input type="file" accept="image/*" onChange={handleImageLoad} />
            Load image
          </label>
          <button type="button" onClick={handleSave} disabled={!project || isGenerating}>
            Save locally
          </button>
        </div>
      </header>

      <section className="status-panel">
        <strong>Status:</strong> <span>{status}</span>
      </section>

      <section className="layout-grid">
        <div className="panel">
          <h2>Source</h2>
          {project?.sourceImageUrl ? (
            <img src={project.sourceImageUrl} alt="Selected source" className="source-preview" />
          ) : (
            <div className="empty-box">No image loaded yet</div>
          )}
        </div>

        <div className="panel">
          <h2>32×32 mosaic</h2>
          <canvas ref={canvasRef} width={320} height={320} className="mosaic-canvas" />
          {project && (
            <div className="summary-line">
              <span>{materialTotal} tiles required</span>
              <span>{project.materialList.length} colors used</span>
            </div>
          )}
        </div>
      </section>

      <section className="bottom-grid">
        <div className="panel">
          <h3>Demo palette (local only)</h3>
          <div className="palette-grid">
            {DEMO_PALETTE.map((color: PaletteColor) => (
              <div key={color.id} className="swatch-row">
                <span className="swatch" style={{ backgroundColor: color.hex }} />
                <span>{color.name}</span>
                <code>{color.hex}</code>
              </div>
            ))}
          </div>
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
