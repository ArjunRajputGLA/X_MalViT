"use client";

import React, { useState } from "react";
import { UploadCloud } from "lucide-react";

interface BinaryDropzoneProps {
  uploadedFile: File | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const BinaryDropzone: React.FC<BinaryDropzoneProps> = ({
  uploadedFile,
  onFileChange,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div
      onDragEnter={() => setIsDragOver(true)}
      onDragOver={() => setIsDragOver(true)}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={() => setIsDragOver(false)}
      className={`relative rounded-tile border-2 border-dashed px-4 py-3 transition-colors cursor-pointer ${
        isDragOver
          ? "border-accent bg-accent-soft/70"
          : "border-line bg-surface-2 hover:border-accent/60"
      }`}
    >
      <input
        type="file"
        accept="image/png,image/jpeg"
        onChange={onFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      <div className="flex items-center justify-center gap-2.5 text-center pointer-events-none">
        <UploadCloud
          className={`w-4 h-4 flex-shrink-0 transition-colors ${
            isDragOver ? "text-accent" : "text-muted"
          }`}
        />
        {uploadedFile ? (
          <div className="text-[12px] text-ok font-medium tabular-nums truncate">
            Selected: <span className="font-mono">{uploadedFile.name}</span> (
            {(uploadedFile.size / 1024).toFixed(1)} KB)
          </div>
        ) : (
          <div className="text-[13px] text-muted">
            <span className="font-medium text-accent">Choose file</span> or drag and drop PNG/JPG
          </div>
        )}
      </div>
    </div>
  );
};
