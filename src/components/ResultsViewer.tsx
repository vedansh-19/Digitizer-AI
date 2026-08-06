import { CheckCircle, AlertCircle, PlayCircle, Loader2, BookOpen, Sigma } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
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

        {result.pageByPage && result.pageByPage.length > 0 && (
          <div className={styles.topicBlock}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={20} />
              Page-by-Page Explanation
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {result.pageByPage.map((p: any, i: number) => (
                <div key={i} style={{ borderLeft: '4px solid var(--accent-secondary)', paddingLeft: '1rem' }}>
                  <p style={{ fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Page/Segment: {p.page}</p>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{p.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {result.formulas && result.formulas.length > 0 && (
          <div className={styles.topicBlock}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sigma size={20} />
              Extracted Formulas
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px' }}>
              {result.formulas.map((formula: string, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'center', padding: '1rem', background: 'var(--bg-glass)', borderRadius: '8px', border: '1px solid var(--border-color)', overflowX: 'auto' }}>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {`$$${formula}$$`}
                  </ReactMarkdown>
                </div>
              ))}
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
