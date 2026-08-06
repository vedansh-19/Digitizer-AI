import { CheckCircle, AlertCircle, PlayCircle, Loader2 } from "lucide-react";
import Flashcards from "./Flashcards";
import styles from "./ResultsViewer.module.css";
import { Mode } from "@/app/page";

export default function ResultsViewer({ result, isProcessing, mode }: { result: any, isProcessing: boolean, mode: Mode }) {
  if (isProcessing) {
    return (
      <div className={`${styles.loadingState} glass-panel`}>
        <Loader2 className={styles.spinner} size={40} />
        <p>Extracting structured data...</p>
      </div>
    );
  }

  if (!result) return null;

  const isLecture = mode === "lecture";

  return (
    <div className={`${styles.resultsContainer} glass-panel animate-fade-in`}>
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <CheckCircle className="text-gradient" size={28} />
          <h3 className="text-gradient">{isLecture ? "Lecture Summary" : "Digitized Notes"}</h3>
        </div>
      </div>

      <div className={styles.content}>
        {result.title && (
          <h2 className={styles.notesTitle}>{result.title}</h2>
        )}

        {result.summary && (
          <div className={styles.summaryBox}>
            <h4>Executive Summary</h4>
            <p>{result.summary}</p>
          </div>
        )}

        {result.keyPoints && result.keyPoints.length > 0 && (
          <div className={styles.topicBlock}>
            <h4>Key Points</h4>
            <ul>
              {result.keyPoints.map((point: string, i: number) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </div>
        )}

        {result.actionItems && result.actionItems.length > 0 && (
          <div className={styles.topicBlock}>
            <h4>Action Items / To-Dos</h4>
            <ul>
              {result.actionItems.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {result.notes && (
          <div className={styles.topicBlock}>
            <h4>Detailed Notes</h4>
            <div className={styles.rawText}>
              {result.notes}
            </div>
          </div>
        )}

        {result.quiz && result.quiz.length > 0 && (
          <div className={styles.topicBlock}>
            <h4>Practice Quiz</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {result.quiz.map((q: any, i: number) => (
                <div key={i} style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px' }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '1rem', color: 'var(--text-primary)' }}>Q{i+1}: {q.question}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    {q.options.map((opt: string, j: number) => (
                      <div key={j} style={{ padding: '0.75rem', background: 'var(--bg-glass)', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        {String.fromCharCode(65 + j)}. {opt}
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed var(--border-color)', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--accent-secondary)', fontWeight: 'bold' }}>Answer: </span>
                    <span style={{ color: 'var(--text-primary)' }}>{q.answer}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {result.flashcards && result.flashcards.length > 0 && (
          <Flashcards cards={result.flashcards} />
        )}
        
      </div>
    </div>
  );
}
