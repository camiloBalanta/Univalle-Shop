import { useCallback, useMemo, useState, type DragEvent } from 'react';
import { CloudUpload, ImagePlus, Trash2 } from 'lucide-react';
import { isValidHttpUrl, normalizeImageUrl } from '../../utils/image';

type UploadZoneProps = {
  images: string[];
  onChange: (images: string[]) => void;
};

export function UploadZone({ images, onChange }: UploadZoneProps) {
  const [urlInput, setUrlInput] = useState('');

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files) return;
      const loaded: string[] = [];

      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject('invalid');
          reader.onerror = () => reject('error');
          reader.readAsDataURL(file);
        });
        loaded.push(base64);
      }

      if (loaded.length) {
        onChange([...images, ...loaded]);
      }
    },
    [images, onChange],
  );

  const handleDrop = useCallback(
    async (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (event.dataTransfer.files.length) {
        await handleFiles(event.dataTransfer.files);
      } else {
        const text = event.dataTransfer.getData('text/plain');
        if (text && isValidHttpUrl(text)) {
          onChange([...images, normalizeImageUrl(text)]);
        }
      }
    },
    [handleFiles, images, onChange],
  );

  const handleAddUrl = () => {
    if (isValidHttpUrl(urlInput)) {
      onChange([...images, normalizeImageUrl(urlInput)]);
      setUrlInput('');
    }
  };

  const previews = useMemo(() => images, [images]);

  return (
    <div className="grid gap-4 rounded-[32px] border border-slate-200/80 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/80">
      <div
        className="group relative flex min-h-[210px] flex-col items-center justify-center gap-3 rounded-[28px] border-2 border-dashed border-slate-300 bg-white/80 p-5 text-center transition hover:border-brand-500 hover:bg-brand-50/50 dark:border-slate-700 dark:bg-slate-900/70 dark:hover:border-brand-500"
        onDrop={handleDrop}
        onDragOver={(event) => event.preventDefault()}
      >
        <div className="grid h-14 w-14 place-items-center rounded-3xl bg-brand-600 text-white shadow-lg">
          <CloudUpload size={28} />
        </div>
        <p className="max-w-[22rem] text-sm font-black text-slate-900 dark:text-white">
          Arrastra imágenes o selecciona archivos para generar vistas previas instantáneas.
        </p>
        <p className="text-sm text-muted">Formatos compatibles: JPG, PNG, GIF o URL de imagen válida.</p>
        <label className="inline-flex cursor-pointer items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-black text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100">
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => handleFiles(event.target.files)}
          />
          <ImagePlus size={16} /> Cargar imágenes
        </label>
      </div>

      <div className="grid gap-3">
        <div className="grid gap-2">
          <label className="text-sm font-black text-slate-700 dark:text-slate-200">Agregar URL de imagen</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={urlInput}
              onChange={(event) => setUrlInput(event.target.value)}
              placeholder="https://..."
              className="input flex-1"
            />
            <button
              type="button"
              onClick={handleAddUrl}
              className="btn-primary px-5"
            >
              Añadir
            </button>
          </div>
        </div>

        {previews.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {previews.map((image, index) => (
              <div key={`${image}-${index}`} className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <img src={image} alt={`Preview ${index + 1}`} className="h-32 w-full object-cover transition duration-300 group-hover:scale-105" />
                <button
                  type="button"
                  onClick={() => onChange(images.filter((_, indexToRemove) => indexToRemove !== index))}
                  className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950/90 text-white transition hover:bg-rose-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}