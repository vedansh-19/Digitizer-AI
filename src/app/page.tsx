"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Uploader from "@/components/Uploader";
import ResultsViewer from "@/components/ResultsViewer";
import Chat from "@/components/Chat";
import styles from "./page.module.css";
import { AnimatePresence, motion } from "framer-motion";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

export type Mode = "notes" | "lecture";

export const LANGUAGES = [
  "English", "Spanish", "French", "German", "Hindi", "Chinese", "Arabic", "Portuguese", "Russian", "Japanese"
];

export default function Home() {
  const [mode, setMode] = useState<Mode>("notes");
  const [language, setLanguage] = useState<string>("English");
  const [images, setImages] = useState<string[] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleUpload = async (base64Images: string[]) => {
    setImages(base64Images);
    setIsProcessing(true);
    setResult(null);
    
    try {
        const payload = { images: base64Images, mode, language };

        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
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
    setImages(null);
    setResult(null);
  };

  return (
    <main className={styles.main}>
      <Header mode={mode} setMode={setMode} language={language} setLanguage={setLanguage} />
      
      <div className={`container ${styles.content}`}>
        <AnimatePresence mode="wait">
          {!images ? (
            <motion.div
              key="uploader"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={styles.uploaderWrapper}
            >
              <h2 className="text-gradient">
                {mode === "notes" ? "Digitize Your Professor's Notes" : "Transcribe Your Audio Lectures"}
              </h2>
              <p>Upload a file and let AI extract the structured data.</p>
              
              <SignedIn>
                <Uploader onUpload={handleUpload} isProcessing={isProcessing} />
              </SignedIn>

              <SignedOut>
                <div style={{ marginTop: "2rem", padding: "3rem", background: "rgba(0,0,0,0.2)", borderRadius: "12px", border: "1px dashed rgba(255,255,255,0.1)" }}>
                  <h3 style={{ marginBottom: "1rem" }}>Sign in to continue</h3>
                  <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>You must be logged in to upload and analyze documents.</p>
                  <SignInButton mode="modal">
                    <button className="btn-primary" style={{ padding: "0.8rem 1.5rem" }}>Sign In or Create Account</button>
                  </SignInButton>
                </div>
              </SignedOut>

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
                  <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                    {images.map((img, idx) => (
                      <div key={idx} style={{ flexShrink: 0, width: images.length === 1 ? '100%' : '150px' }}>
                        {img.startsWith("data:image/") ? (
                          <img src={img} alt="Uploaded" className={styles.previewImage} style={{ height: images.length === 1 ? 'auto' : '150px', objectFit: 'cover' }} />
                        ) : img.startsWith("data:application/pdf") ? (
                          <embed src={img} type="application/pdf" className={styles.previewImage} style={{ width: "100%", height: images.length === 1 ? "400px" : "150px", borderRadius: "8px" }} />
                        ) : (
                          <div className={styles.previewImage} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: images.length === 1 ? '200px' : '150px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                            <p>Document</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <ResultsViewer result={result} isProcessing={isProcessing} mode={mode} />
              </div>
              
              <div className={styles.rightPanel}>
                <Chat context={result} mode={mode} language={language} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
