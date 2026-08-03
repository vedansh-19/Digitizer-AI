"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Uploader from "@/components/Uploader";
import ResultsViewer from "@/components/ResultsViewer";
import Chat from "@/components/Chat";
import styles from "./page.module.css";
import { AnimatePresence, motion } from "framer-motion";

export type Mode = "notes" | "prescription" | "lecture";

export default function Home() {
  const [mode, setMode] = useState<Mode>("notes");
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleUpload = async (base64Image: string) => {
    setImage(base64Image);
    setIsProcessing(true);
    setResult(null);
    
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image, mode })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data.result);
    } catch (err: any) {
      console.error(err);
      alert("Error: " + (err.message || "Failed to analyze image"));
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
  };

  return (
    <main className={styles.main}>
      <Header mode={mode} setMode={setMode} />
      
      <div className={`container ${styles.content}`}>
        <AnimatePresence mode="wait">
          {!image ? (
            <motion.div
              key="uploader"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={styles.uploaderWrapper}
            >
              <h2 className="text-gradient">
                {mode === "notes" ? "Digitize Your Professor's Notes" : mode === "prescription" ? "Digitize Your Medical Prescriptions" : "Transcribe Your Audio Lectures"}
              </h2>
              <p>Upload a file and let AI extract the structured data.</p>
              <Uploader onUpload={handleUpload} isProcessing={isProcessing} />
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={styles.resultsLayout}
            >
              <div className={styles.leftPanel}>
                <button className="btn-secondary" onClick={reset} style={{ marginBottom: "1rem" }}>
                  &larr; Upload Another
                </button>
                <div className="glass-panel" style={{ padding: "1rem", marginBottom: "1.5rem" }}>
                  {image.startsWith("data:image/") ? (
                    <img src={image} alt="Uploaded" className={styles.previewImage} />
                  ) : image.startsWith("data:application/pdf") ? (
                    <embed src={image} type="application/pdf" className={styles.previewImage} style={{ width: "100%", height: "400px", borderRadius: "8px" }} />
                  ) : (
                    <div className={styles.previewImage} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                      <p>Document Uploaded</p>
                    </div>
                  )}
                </div>
                <ResultsViewer result={result} isProcessing={isProcessing} mode={mode} />
              </div>
              
              <div className={styles.rightPanel}>
                <Chat context={result} mode={mode} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
