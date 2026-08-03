import { useState, useRef } from "react";
import { UploadCloud, Loader2 } from "lucide-react";
import styles from "./Uploader.module.css";
import { motion } from "framer-motion";

interface UploaderProps {
  onUpload: (base64: string) => void;
  isProcessing: boolean;
}

export default function Uploader({ onUpload, isProcessing }: UploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        if (file.type.startsWith("image/")) {
          // Compress image using canvas
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            let width = img.width;
            let height = img.height;
            
            // Max dimension 1200px
            const MAX_DIMENSION = 1200;
            if (width > height && width > MAX_DIMENSION) {
              height = Math.round((height * MAX_DIMENSION) / width);
              width = MAX_DIMENSION;
            } else if (height > MAX_DIMENSION) {
              width = Math.round((width * MAX_DIMENSION) / height);
              height = MAX_DIMENSION;
            }
            
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx?.drawImage(img, 0, 0, width, height);
            
            // Compress to JPEG with 0.8 quality
            const compressedBase64 = canvas.toDataURL("image/jpeg", 0.8);
            onUpload(compressedBase64);
          };
          img.src = e.target.result as string;
        } else {
          // For non-images (like PDF), just pass the base64 directly
          onUpload(e.target.result as string);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <motion.div 
      className={`${styles.uploader} glass-panel glass-panel-interactive ${isDragging ? styles.dragging : ""}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => !isProcessing && fileInputRef.current?.click()}
      whileHover={!isProcessing ? { scale: 1.02 } : {}}
      whileTap={!isProcessing ? { scale: 0.98 } : {}}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleChange} 
        style={{ display: "none" }} 
      />
      
      {isProcessing ? (
        <div className={styles.processing}>
          <Loader2 className={styles.spinner} size={48} />
          <p>Analyzing document with AI...</p>
        </div>
      ) : (
        <div className={styles.content}>
          <div className={styles.iconWrapper}>
            <UploadCloud size={48} />
          </div>
          <h3>Click or drag file to upload</h3>
          <p>Supports Image, PDF, Documents & Audio (MP3/WAV)</p>
          
          <div className={styles.youtubeInputContainer} style={{ marginTop: "1.5rem", width: "100%" }}>
            <p style={{ margin: "1rem 0 0.5rem", fontSize: "0.9rem", color: "var(--text-secondary)" }}>Or paste a YouTube URL:</p>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input 
                type="url" 
                placeholder="https://youtube.com/watch?v=..." 
                className="input-field"
                style={{ flex: 1, padding: "0.75rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.2)", color: "white" }}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  const url = e.target.value;
                  if (url.includes("youtube.com") || url.includes("youtu.be")) {
                    onUpload(url);
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
