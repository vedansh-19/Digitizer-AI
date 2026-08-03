import { Mode } from "@/app/page";
import styles from "./ResultsViewer.module.css";
import { CheckCircle2, FileText, Loader2 } from "lucide-react";
import Flashcards from "./Flashcards";

interface ResultsViewerProps {
  result: any;
  isProcessing: boolean;
  mode: Mode;
}

export default function ResultsViewer({ result, isProcessing, mode }: ResultsViewerProps) {
  if (isProcessing) {
    return (
      <div className={`glass-panel ${styles.loadingState}`}>
        <Loader2 className="spinner" size={40} color="var(--accent-primary)" />
        <p>Extracting structured data...</p>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className={`glass-panel ${styles.resultsContainer} animate-fade-in`}>
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <FileText className="text-gradient" />
          <h3>{mode === "notes" ? "Structured Notes" : "Lecture Notes"}</h3>
        </div>
        <div className={styles.statusBadge}>
          <CheckCircle2 size={14} />
          <span>Extracted Successfully</span>
        </div>
      </div>

      <div className={styles.content}>

        {mode === "notes" && result.title && (
          <div className={styles.section}>
            <h2 className={styles.notesTitle}>{result.title}</h2>
            {result.topics && result.topics.map((topic: any, idx: number) => (
              <div key={idx} className={styles.topicBlock}>
                <h4>{topic.heading}</h4>
                <ul>
                  {topic.points.map((pt: string, i: number) => (
                    <li key={i}>{pt}</li>
                  ))}
                </ul>
              </div>
            ))}
            
            {result.flashcards && result.flashcards.length > 0 && (
              <Flashcards cards={result.flashcards} />
            )}
          </div>
        )}

        {mode === "lecture" && result.title && (
          <div className={styles.section}>
            <h2 className={styles.notesTitle}>{result.title}</h2>
            
            {result.keyPoints && result.keyPoints.length > 0 && (
              <div className={styles.topicBlock}>
                <h4>Key Points</h4>
                <ul>
                  {result.keyPoints.map((pt: string, i: number) => (
                    <li key={i}>{pt}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {result.notes && (
              <div className={styles.topicBlock}>
                <h4>Detailed Notes</h4>
                <p style={{ lineHeight: "1.6", color: "var(--text-secondary)" }}>{result.notes}</p>
              </div>
            )}

            {result.actionItems && result.actionItems.length > 0 && (
              <div className={styles.topicBlock}>
                <h4>Action Items</h4>
                <ul>
                  {result.actionItems.map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.quiz && result.quiz.length > 0 && (
              <div className={styles.topicBlock} style={{ marginTop: "2rem", padding: "1.5rem", background: "rgba(0,0,0,0.2)", borderRadius: "12px" }}>
                <h4 style={{ color: "var(--accent-primary)", marginBottom: "1rem" }}>Pop Quiz!</h4>
                {result.quiz.map((q: any, i: number) => (
                  <div key={i} style={{ marginBottom: "1.5rem" }}>
                    <p style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>{i + 1}. {q.question}</p>
                    <ul style={{ listStyleType: "none", paddingLeft: "1rem", marginBottom: "0.5rem" }}>
                      {q.options && q.options.map((opt: string, optIdx: number) => (
                        <li key={optIdx} style={{ padding: "0.25rem 0", color: "var(--text-secondary)" }}>• {opt}</li>
                      ))}
                    </ul>
                    <details style={{ cursor: "pointer", color: "var(--accent-secondary)", fontSize: "0.9rem" }}>
                      <summary>Reveal Answer</summary>
                      <p style={{ marginTop: "0.5rem", color: "var(--text-primary)", fontWeight: "500" }}>{q.answer}</p>
                    </details>
                  </div>
                ))}
              </div>
            )}

            {result.flashcards && result.flashcards.length > 0 && (
              <Flashcards cards={result.flashcards} />
            )}
          </div>
        )}

        {result.detailedExplanation && (
          <div className={styles.section}>
            <h4>Detailed Explanation</h4>
            <p style={{ lineHeight: "1.6", color: "var(--text-secondary)" }}>{result.detailedExplanation}</p>
          </div>
        )}

        {result.summary && (
          <div className={styles.summaryBox}>
            <h4>Summary</h4>
            <p>{result.summary}</p>
          </div>
        )}

        {result.additionalInfo && (
          <div className={styles.section}>
            <h4>Additional Information</h4>
            <p className={styles.rawText}>{result.additionalInfo}</p>
          </div>
        )}
      </div>
    </div>
  );
}
