import { Sparkles, FileText, Stethoscope } from "lucide-react";
import styles from "./Header.module.css";
import { Mode } from "@/app/page";

interface HeaderProps {
  mode: Mode;
  setMode: (mode: Mode) => void;
}

export default function Header({ mode, setMode }: HeaderProps) {
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
            className={`${styles.modeBtn} ${mode === "prescription" ? styles.active : ""}`}
            onClick={() => setMode("prescription")}
          >
            <Stethoscope size={18} />
            <span>Prescriptions</span>
          </button>
        </div>
      </div>
    </header>
  );
}
