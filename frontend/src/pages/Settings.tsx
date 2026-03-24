import React from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Settings.module.css'
import { useTheme } from '../hooks/useTheme'

const Settings: React.FC = () => {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  return (
    <div className={styles.container}>
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

      <div className={styles.content}>
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate('/')}>
            ← Back
          </button>
          <h1 className={styles.title}>Settings</h1>
        </div>

        <div className={styles.settingsCard}>
          <h2>Display Settings</h2>
          
          <div className={styles.themeCard}>
          <div className={styles.settingItem}>
            <div className={styles.settingLabel}>
              <h3>Theme</h3>
              <p>Choose between light and dark mode for your Project Racing experience</p>
            </div>
            <div className={styles.settingControl}>
              <label className={styles.toggleSwitch}>
                <input 
                  type="checkbox"
                  checked={theme === 'dark'}
                  onChange={toggleTheme}
                  className={styles.toggleInput}
                />
                <span className={styles.toggleSlider}>
                  <span className={styles.toggleLabel}>{theme === 'light' ? 'Light' : 'Dark'}</span>
                </span>
              </label>
            </div>
          </div>
          </div>
        </div>

        <div className={styles.settingsCard}>
          <h2>About</h2>
          <div className={styles.aboutContent}>
            <p><strong>Project Racing</strong></p>
            <p>Version: 0.1.0 (Pre-Alpha)</p>
            <p>A web-based team management game</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
