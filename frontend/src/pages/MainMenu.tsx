import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './MainMenu.module.css'

const MainMenu: React.FC = () => {
  const navigate = useNavigate()
  const [toLoadCareer, setToLoadCareer] = useState(false)
  const [toSettings, setToSettings] = useState(false)
  const [toNewCareer, setToNewCareer] = useState(false)
  const loadCareerTimerRef = useRef<number | null>(null)
  const settingsTimerRef = useRef<number | null>(null)
  const newCareerTimerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (loadCareerTimerRef.current !== null) {
        window.clearTimeout(loadCareerTimerRef.current)
      }

      if (settingsTimerRef.current !== null) {
        window.clearTimeout(settingsTimerRef.current)
      }

      if (newCareerTimerRef.current !== null) {
        window.clearTimeout(newCareerTimerRef.current)
      }
    }
  }, [])

  const handleLoadCareerClick = () => {
    if (toLoadCareer || toSettings || toNewCareer) {
      return
    }

    setToLoadCareer(true)
    loadCareerTimerRef.current = window.setTimeout(() => {
      navigate('/load-career')
    }, 400)
  }

  const handleSettingsClick = () => {
    if (toSettings || toLoadCareer || toNewCareer) {
      return
    }

    setToSettings(true)
    settingsTimerRef.current = window.setTimeout(() => {
      navigate('/settings')
    }, 400)
  }

  const handleNewCareerClick = () => {
    if (toNewCareer || toLoadCareer || toSettings) {
      return
    }

    setToNewCareer(true)
    newCareerTimerRef.current = window.setTimeout(() => {
      navigate('/new-career')
    }, 400)
  }

  return (
    <div className={`${styles.menuContainer} ${toSettings || toLoadCareer || toNewCareer ? styles.toSettings : ''}`}>
      <div className={styles.menuContent}>
        <h1 className={styles.title}>Project Racing</h1>
        <p className={styles.subtitle}>Team Owner Career Simulator</p>
        
        <div className={styles.buttonGroup}>
          <button 
            className={styles.menuButton}
            onClick={handleNewCareerClick}
          >
            New Career
          </button>
          <button 
            className={styles.menuButton}
            onClick={handleLoadCareerClick}
          >
            Load Career
          </button>
          <button 
            className={styles.menuButton}
            onClick={handleSettingsClick}
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
