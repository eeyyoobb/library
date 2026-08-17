"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Props {
  type: "image" | "video";
  accept: string;
  placeholder: string;
  variant: "dark" | "light";
  onFileSelect: (file: File) => void;
  value?: string;
}

const FileUpload = ({
  type,
  accept,
  placeholder,
  variant,
  onFileSelect,
  value,
}: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState<string | null>(value ?? null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const styles = {
    button:
      variant === "dark"
        ? "bg-dark-300"
        : "bg-light-600 border-gray-100 border",

    placeholder: variant === "dark" ? "text-light-100" : "text-slate-500",

    text: variant === "dark" ? "text-light-100" : "text-dark-400",
  };

  const validateFile = (file: File) => {
    if (type === "image") {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid image",
          description: "Please select a valid image file.",
          variant: "destructive",
        });

        return false;
      }

      if (file.size > 20 * 1024 * 1024) {
        toast({
          title: "File size too large",
          description: "Please upload an image smaller than 20MB.",
          variant: "destructive",
        });

        return false;
      }
    }

    if (type === "video") {
      if (!file.type.startsWith("video/")) {
        toast({
          title: "Invalid video",
          description: "Please select a valid video file.",
          variant: "destructive",
        });

        return false;
      }

      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "File size too large",
          description: "Please upload a video smaller than 50MB.",
          variant: "destructive",
        });

        return false;
      }
    }

    return true;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    if (!validateFile(selectedFile)) {
      e.target.value = "";
      return;
    }

    setFileName(selectedFile.name);

    if (type === "image") {
      const objectUrl = URL.createObjectURL(selectedFile);

      setPreviewUrl((oldUrl) => {
        if (oldUrl) {
          URL.revokeObjectURL(oldUrl);
        }

        return objectUrl;
      });
    }

    // Important:
    // Return the actual File to BookForm.
    onFileSelect(selectedFile);
  };

  const removeFile = () => {
    setFileName(null);

    setPreviewUrl((oldUrl) => {
      if (oldUrl) {
        URL.revokeObjectURL(oldUrl);
      }

      return null;
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />

      <button
        type="button"
        className={cn(
          "upload-btn flex items-center gap-2 p-3 rounded-lg",
          styles.button,
        )}
        onClick={(e) => {
          e.preventDefault();
          fileInputRef.current?.click();
        }}
      >
        <Image
          src="/icons/upload.svg"
          alt="upload-icon"
          width={20}
          height={20}
          className="object-contain"
        />

        <p className={cn("text-base font-medium", styles.placeholder)}>
          {fileName
            ? `${type === "image" ? "Image" : "Video"} selected`
            : placeholder}
        </p>

        {fileName && (
          <p
            className={cn(
              "upload-filename truncate text-xs text-green-600 ml-auto",
              styles.text,
            )}
          >
            {fileName}
          </p>
        )}
      </button>

      {fileName && (
        <div className="flex items-center justify-between p-3 border rounded-xl bg-slate-50 dark:bg-dark-300">
          <div className="flex items-center gap-3 min-w-0">
            {type === "image" && previewUrl ? (
              <img
                src={previewUrl}
                alt={fileName}
                className="w-16 h-16 rounded-lg object-cover"
              />
            ) : (
              <Image src="/icons/upload.svg" alt="" width={32} height={32} />
            )}

            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-dark-400 dark:text-light-100 truncate">
                {fileName}
              </span>

              <span className="text-xs text-green-600">
                Ready to include in book package
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={removeFile}
            className="text-xs text-red-500 hover:text-red-600 ml-3"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
