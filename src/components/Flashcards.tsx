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
      <div className={styles.topicBlock} style={{ marginTop: "2rem" }}>
      <h4 style={{ color: "var(--text-primary)", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>Flashcards Review</span>
        <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", background: "var(--bg-secondary)", padding: "0.25rem 0.75rem", borderRadius: "1rem" }}>{currentIndex + 1} / {cards.length}</span>
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
            background: "var(--accent-primary)",
            border: "2px solid var(--text-primary)",
            borderRadius: "16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            textAlign: "center",
            boxShadow: "var(--shadow-md)"
          }}>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "1rem", textTransform: "uppercase", fontWeight: 700, letterSpacing: "1px" }}>Question</p>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--text-primary)" }}>{cards[currentIndex].front}</h3>
            <div style={{ position: "absolute", bottom: "1rem", right: "1rem", color: "var(--text-primary)", opacity: 0.5 }}>
              <RotateCw size={20} />
            </div>
          </div>

          {/* Back */}
          <div style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backfaceVisibility: "hidden",
            background: "var(--text-primary)",
            border: "2px solid var(--text-primary)",
            borderRadius: "16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            textAlign: "center",
            transform: "rotateY(180deg)",
            boxShadow: "var(--shadow-md)"
          }}>
            <p style={{ fontSize: "0.9rem", color: "var(--accent-primary)", marginBottom: "1rem", textTransform: "uppercase", fontWeight: 700, letterSpacing: "1px" }}>Answer</p>
            <p style={{ fontSize: "1.1rem", color: "var(--bg-primary)", lineHeight: "1.6", fontWeight: 500 }}>{cards[currentIndex].back}</p>
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
