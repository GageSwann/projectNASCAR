import React from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './MainMenu.module.css'

const MainMenu: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className={styles.menuContainer}>
      <div className={styles.checkeredFlag}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="checkerboard" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="10" height="10" fill="white" />
              <rect x="10" y="10" width="10" height="10" fill="white" />
              <rect x="10" y="0" width="10" height="10" fill="black" />
              <rect x="0" y="10" width="10" height="10" fill="black" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#checkerboard)" />
        </svg>
      </div>
      
      <div className={styles.menuContent}>
        <h1 className={styles.title}>Project Racing</h1>
        <p className={styles.subtitle}>Team Owner Career Simulator</p>
        
        <div className={styles.buttonGroup}>
          <button 
            className={styles.menuButton}
            onClick={() => navigate('/careers')}
          >
            New Career
          </button>
          <button 
            className={styles.menuButton}
            onClick={() => navigate('/game')}
          >
            Load Career
          </button>
          <button 
            className={styles.menuButton}
            onClick={() => navigate('/settings')}
          >
            Settings
          </button>
        </div>

        <div className={styles.version}>v0.1.0 - Pre-Alpha</div>
        <div className={styles.copyright}>© Project Racing</div>
      </div>
    </div>
  )
}

export default MainMenu
