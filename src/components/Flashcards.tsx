"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
import styles from "./ResultsViewer.module.css";
import { motion } from "framer-motion";

interface Flashcard {
  front: string;
  back: string;
}

interface FlashcardsProps {
  cards: Flashcard[];
}

export default function Flashcards({ cards }: FlashcardsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!cards || cards.length === 0) return null;

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 150);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }, 150);
  };

  return (
    <div className={styles.topicBlock} style={{ marginTop: "2rem", background: "rgba(0,0,0,0.2)", borderRadius: "12px", padding: "1.5rem" }}>
      <h4 style={{ color: "var(--accent-primary)", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>Flashcards Review</span>
        <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{currentIndex + 1} / {cards.length}</span>
      </h4>

      <div 
        style={{ 
          perspective: "1000px", 
          height: "250px", 
          width: "100%", 
          cursor: "pointer",
          marginBottom: "1.5rem"
        }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            transformStyle: "preserve-3d"
          }}
        >
          {/* Front */}
          <div style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backfaceVisibility: "hidden",
            background: "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            textAlign: "center"
          }}>
            <p style={{ fontSize: "0.9rem", color: "var(--accent-secondary)", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "1px" }}>Question</p>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "600", color: "white" }}>{cards[currentIndex].front}</h3>
            <div style={{ position: "absolute", bottom: "1rem", right: "1rem", color: "rgba(255,255,255,0.3)" }}>
              <RotateCw size={20} />
            </div>
          </div>

          {/* Back */}
          <div style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backfaceVisibility: "hidden",
            background: "linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(56, 189, 248, 0.2))",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            textAlign: "center",
            transform: "rotateY(180deg)"
          }}>
            <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.7)", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "1px" }}>Answer</p>
            <p style={{ fontSize: "1.1rem", color: "white", lineHeight: "1.6" }}>{cards[currentIndex].back}</p>
          </div>
        </motion.div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
        <button className="btn-secondary" onClick={(e) => { e.stopPropagation(); prevCard(); }} style={{ padding: "0.5rem 1rem" }}>
          <ChevronLeft size={20} />
        </button>
        <button className="btn-secondary" onClick={(e) => { e.stopPropagation(); nextCard(); }} style={{ padding: "0.5rem 1rem" }}>
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
