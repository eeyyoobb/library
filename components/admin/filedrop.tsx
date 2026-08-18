import { useRef, useState } from "react";
import { FileText, ImageIcon, UploadCloud, X } from "lucide-react";

import { cn } from "@/lib/utils";

interface FileDropProps {
  kind: "image" | "pdf";
  accept: string;
  label: string;
  hint: string;
  file: File | null;
  onFileSelect: (file: File | null) => void;
}

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileDrop({
  kind,
  accept,
  label,
  hint,
  file,
  onFileSelect,
}: FileDropProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = (next: File | null) => {
    onFileSelect(next);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(next && kind === "image" ? URL.createObjectURL(next) : null);
  };

  const Icon = kind === "image" ? ImageIcon : FileText;

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          handleFile(event.dataTransfer.files?.[0] ?? null);
        }}
        className={cn(
          "group flex w-full items-center gap-4 rounded-2xl border border-dashed border-border bg-secondary/40 px-5 py-6 text-left transition-colors",
          "hover:border-ring hover:bg-secondary/70",
          dragging && "border-ring bg-secondary",
        )}
      >
        {preview ? (
          <img
            src={preview}
            alt="Selected cover preview"
            className="h-20 w-14 rounded-md object-cover shadow-[var(--shadow-soft)]"
          />
        ) : (
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-background text-muted-foreground shadow-[var(--shadow-soft)]">
            {file ? <Icon /> : <UploadCloud />}
          </span>
        )}

        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-foreground">
            {file ? file.name : label}
          </span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            {file ? formatSize(file.size) : hint}
          </span>
        </span>

        {file && (
          <span
            role="button"
            tabIndex={-1}
            aria-label="Remove file"
            onClick={(event) => {
              event.stopPropagation();
              handleFile(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
          >
            <X />
          </span>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
      />
    </div>
  );
}