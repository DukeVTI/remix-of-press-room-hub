import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CharacterCountInput } from "@/components/CharacterCountInput";

interface MediaUploaderProps {
  onUpload: (file: File, alt: string, description: string) => void;
  maxAltLength?: number;
  maxDescriptionLength?: number;
  accept?: string;
  disabled?: boolean;
  className?: string;
}

export function MediaUploader({
  onUpload,
  maxAltLength = 120,
  maxDescriptionLength = 300,
  accept = "image/*",
  disabled = false,
  className = "",
}: MediaUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [alt, setAlt] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    setError(null);
    if (selected) {
      setPreview(URL.createObjectURL(selected));
    } else {
      setPreview(null);
    }
  };

  const handleUpload = () => {
    if (!file) {
      setError("Please select a file.");
      return;
    }
    if (!alt.trim()) {
      setError("Alt text is required for accessibility.");
      return;
    }
    if (alt.length > maxAltLength) {
      setError(`Alt text must be under ${maxAltLength} characters.`);
      return;
    }
    if (description.length > maxDescriptionLength) {
      setError(`Description must be under ${maxDescriptionLength} characters.`);
      return;
    }
    setError(null);
    onUpload(file, alt.trim(), description.trim());
    setFile(null);
    setAlt("");
    setDescription("");
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className={`w-full flex flex-col gap-3 ${className}`}>
      <label className="font-medium" htmlFor="media-upload-input">Upload Image</label>
      <Input
        id="media-upload-input"
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        aria-label="Upload image"
        disabled={disabled}
      />
      {preview && (
        <img
          src={preview}
          alt={alt || "Image preview"}
          className="rounded border w-40 h-40 object-cover"
        />
      )}
      <CharacterCountInput
        value={alt}
        onChange={e => setAlt(e.target.value)}
        maxLength={maxAltLength}
        label="Alt Text (required)"
        required
        placeholder="Describe the image for screen readers"
        ariaLabel="Alt text"
        disabled={disabled}
      />
      <CharacterCountInput
        value={description}
        onChange={e => setDescription(e.target.value)}
        maxLength={maxDescriptionLength}
        label="Description (optional)"
        type="textarea"
        placeholder="Add a description for context (optional)"
        ariaLabel="Image description"
        disabled={disabled}
      />
      {error && <div className="text-red-600 text-sm" role="alert">{error}</div>}
      <Button onClick={handleUpload} disabled={disabled || !file || !alt.trim()} aria-label="Upload image with alt text">
        Upload
      </Button>
    </div>
  );
}
