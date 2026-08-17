"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Props {
  type?: "pdf" | "image";
  accept?: string;
  placeholder: string;
  variant: "dark" | "light";
  onFileSelect: (file: File) => void;
  value?: string;
}

const PdfUpload = ({
  type = "pdf",
  accept = "application/pdf",
  placeholder,
  variant,
  onFileSelect,
  value,
}: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState<string | null>(value ?? null);

  const styles = {
    button:
      variant === "dark"
        ? "bg-dark-300"
        : "bg-light-600 border-gray-100 border",

    placeholder: variant === "dark" ? "text-light-100" : "text-slate-500",

    text: variant === "dark" ? "text-light-100" : "text-dark-400",
  };

  const validateFile = (file: File): boolean => {
    if (type === "pdf" && file.type !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Please upload a valid PDF document.",
        variant: "destructive",
      });

      return false;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File size too large",
        description: "Please upload a PDF file smaller than 50MB.",
        variant: "destructive",
      });

      return false;
    }

    return true;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!validateFile(file)) {
      e.target.value = "";
      return;
    }

    setFileName(file.name);

    // Return the actual File to BookForm.
    onFileSelect(file);
  };

  return (
    <div className="flex flex-col gap-3">
      <input
        type="file"
        ref={fileInputRef}
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
          {fileName ? "PDF selected" : placeholder}
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
          <div className="flex items-center gap-3">
            <Image
              src="/icons/pdf-icon.svg"
              alt="PDF Icon"
              width={32}
              height={32}
            />

            <div className="flex flex-col">
              <span className="text-sm font-medium text-dark-400 dark:text-light-100 truncate max-w-xs">
                {fileName}
              </span>

              <span className="text-xs text-green-600">
                Ready to include in book package
              </span>
            </div>
          </div>

          <button
            type="button"
            className="text-xs text-red-500 hover:text-red-600"
            onClick={() => {
              setFileName(null);

              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }}
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
};

export default PdfUpload;
