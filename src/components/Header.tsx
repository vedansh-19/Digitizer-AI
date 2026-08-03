import { Sparkles, FileText, AudioLines, Globe } from "lucide-react";
import styles from "./Header.module.css";
import { Mode, LANGUAGES } from "@/app/page";

interface HeaderProps {
  mode: Mode;
  setMode: (mode: Mode) => void;
  language: string;
  setLanguage: (lang: string) => void;
}

export default function Header({ mode, setMode, language, setLanguage }: HeaderProps) {
  return (
    <header className={`${styles.header} glass-panel`}>
      <div className={`container ${styles.headerContent}`}>
        <div className={styles.logo}>
          <Sparkles className={styles.logoIcon} />
          <span className="text-gradient">Digitizer AI</span>
        </div>
        
        <div className={styles.modeSelector}>
          <button 
            className={`${styles.modeBtn} ${mode === "notes" ? styles.active : ""}`}
            onClick={() => setMode("notes")}
          >
            <FileText size={18} />
            <span>Notes</span>
          </button>
          <button 
            className={`${styles.modeBtn} ${mode === "lecture" ? styles.active : ""}`}
            onClick={() => setMode("lecture")}
          >
            <AudioLines size={18} />
            <span>Lecture</span>
          </button>
        </div>

        <div className={styles.languageSelector} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Globe size={18} style={{ color: 'var(--text-secondary)' }} />
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--text-primary)',
              padding: '0.4rem 0.8rem',
              borderRadius: '20px',
              fontSize: '0.9rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {LANGUAGES.map(lang => (
              <option key={lang} value={lang} style={{ background: '#121212', color: 'white' }}>{lang}</option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
