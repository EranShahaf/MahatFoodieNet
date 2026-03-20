import { useRef, useState, useCallback } from "react";
import { Camera, X, ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhotoUploadProps {
  files: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
}

const PhotoUpload = ({ files, onChange, maxFiles = 5 }: PhotoUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const accepted = Array.from(incoming).filter((f) =>
        f.type.startsWith("image/")
      );
      const next = [...files, ...accepted].slice(0, maxFiles);
      onChange(next);

      const newPreviews = [...previews];
      accepted.slice(0, maxFiles - files.length).forEach((file) => {
        newPreviews.push(URL.createObjectURL(file));
      });
      setPreviews(newPreviews.slice(0, maxFiles));
    },
    [files, onChange, previews, maxFiles]
  );

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    onChange(files.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  };

  const hasFiles = files.length > 0;
  const canAddMore = files.length < maxFiles;

  return (
    <div className="space-y-3">
      {hasFiles && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {previews.map((src, i) => (
            <div
              key={src}
              className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-card"
            >
              <img
                src={src}
                alt={`Upload ${i + 1}`}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          {canAddMore && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-border bg-card transition-colors hover:border-primary/40"
            >
              <ImagePlus className="h-6 w-6 text-muted-foreground" />
            </button>
          )}
        </div>
      )}

      {!hasFiles && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
          }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={cn(
            "flex cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed bg-card p-10 transition-colors",
            dragActive
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/40"
          )}
        >
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Camera className="h-7 w-7 text-primary" />
            </div>
            <div className="text-center">
              <span className="text-sm font-medium text-foreground">
                Add photos
              </span>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Drag & drop or tap to browse (max {maxFiles})
              </p>
            </div>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) addFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
};

export default PhotoUpload;
