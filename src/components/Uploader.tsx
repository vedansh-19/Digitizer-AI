import { useState, useRef } from "react";
import { UploadCloud, Loader2 } from "lucide-react";
import styles from "./Uploader.module.css";
import { motion } from "framer-motion";

interface UploaderProps {
  onUpload: (base64s: string[]) => void;
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

  const processFiles = async (files: FileList | File[]) => {
    const promises = Array.from(files).map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            if (file.type.startsWith("image/")) {
              const img = new Image();
              img.onload = () => {
                const canvas = document.createElement("canvas");
                let width = img.width;
                let height = img.height;
                
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
                
                resolve(canvas.toDataURL("image/jpeg", 0.8));
              };
              img.src = e.target.result as string;
            } else {
              resolve(e.target.result as string);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    });

    const base64s = await Promise.all(promises);
    onUpload(base64s);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
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
        multiple
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
          
        </div>
      )}
    </motion.div>
  );
}
