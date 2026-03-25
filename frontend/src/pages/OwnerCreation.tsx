import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './OwnerCreation.module.css'
import { SaveSlotData, Manufacturer } from '../types'
import { getFirstEmptySlotId, saveSlot, setActiveSlotId } from '../services/saveManager'

const NATIONALITIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola',
  'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria',
  'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados',
  'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan',
  'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei',
  'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia',
  'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile',
  'China', 'Colombia', 'Comoros', 'Congo (DRC)', 'Congo (Republic)',
  'Costa Rica', "Côte d'Ivoire", 'Croatia', 'Cuba', 'Cyprus',
  'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic',
  'East Timor', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea',
  'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji',
  'Finland', 'France', 'Gabon', 'Gambia', 'Georgia',
  'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala',
  'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras',
  'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran',
  'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica',
  'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati',
  'Kosovo', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia',
  'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein',
  'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia',
  'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania',
  'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco',
  'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar',
  'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand',
  'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia',
  'Norway', 'Oman', 'Pakistan', 'Palau', 'Palestine',
  'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines',
  'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia',
  'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia',
  'Saint Vincent and the Grenadines', 'Samoa', 'San Marino',
  'São Tomé and Príncipe', 'Saudi Arabia', 'Senegal', 'Serbia',
  'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia',
  'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan',
  'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden',
  'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania',
  'Thailand', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia',
  'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine',
  'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay',
  'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam',
  'Yemen', 'Zambia', 'Zimbabwe',
]

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

// Popular US cities — at least a few per state
const US_CITIES = [
  // Alabama
  'Birmingham, AL', 'Huntsville, AL', 'Mobile, AL',
  // Alaska
  'Anchorage, AK', 'Fairbanks, AK',
  // Arizona
  'Phoenix, AZ', 'Tucson, AZ', 'Scottsdale, AZ',
  // Arkansas
  'Little Rock, AR', 'Fayetteville, AR',
  // California
  'Los Angeles, CA', 'San Francisco, CA', 'San Diego, CA', 'Sacramento, CA', 'San Jose, CA',
  // Colorado
  'Denver, CO', 'Colorado Springs, CO', 'Boulder, CO',
  // Connecticut
  'Hartford, CT', 'New Haven, CT', 'Stamford, CT',
  // Delaware
  'Wilmington, DE', 'Dover, DE',
  // Florida
  'Miami, FL', 'Orlando, FL', 'Tampa, FL', 'Jacksonville, FL', 'Daytona Beach, FL',
  // Georgia
  'Atlanta, GA', 'Savannah, GA', 'Augusta, GA',
  // Hawaii
  'Honolulu, HI',
  // Idaho
  'Boise, ID', 'Idaho Falls, ID',
  // Illinois
  'Chicago, IL', 'Springfield, IL', 'Joliet, IL',
  // Indiana
  'Indianapolis, IN', 'Fort Wayne, IN', 'Bloomington, IN',
  // Iowa
  'Des Moines, IA', 'Cedar Rapids, IA', 'Newton, IA',
  // Kansas
  'Kansas City, KS', 'Wichita, KS', 'Topeka, KS',
  // Kentucky
  'Louisville, KY', 'Lexington, KY',
  // Louisiana
  'New Orleans, LA', 'Baton Rouge, LA', 'Shreveport, LA',
  // Maine
  'Portland, ME', 'Bangor, ME',
  // Maryland
  'Baltimore, MD', 'Annapolis, MD',
  // Massachusetts
  'Boston, MA', 'Worcester, MA', 'Cambridge, MA',
  // Michigan
  'Detroit, MI', 'Grand Rapids, MI', 'Ann Arbor, MI',
  // Minnesota
  'Minneapolis, MN', 'St. Paul, MN', 'Rochester, MN',
  // Mississippi
  'Jackson, MS', 'Biloxi, MS',
  // Missouri
  'St. Louis, MO', 'Kansas City, MO', 'Springfield, MO',
  // Montana
  'Billings, MT', 'Missoula, MT',
  // Nebraska
  'Omaha, NE', 'Lincoln, NE',
  // Nevada
  'Las Vegas, NV', 'Reno, NV',
  // New Hampshire
  'Manchester, NH', 'Concord, NH', 'Loudon, NH',
  // New Jersey
  'Newark, NJ', 'Jersey City, NJ', 'Trenton, NJ',
  // New Mexico
  'Albuquerque, NM', 'Santa Fe, NM',
  // New York
  'New York City, NY', 'Buffalo, NY', 'Rochester, NY', 'Syracuse, NY',
  // North Carolina
  'Charlotte, NC', 'Mooresville, NC', 'Concord, NC', 'Raleigh, NC', 'Greensboro, NC',
  // North Dakota
  'Fargo, ND', 'Bismarck, ND',
  // Ohio
  'Columbus, OH', 'Cleveland, OH', 'Cincinnati, OH',
  // Oklahoma
  'Oklahoma City, OK', 'Tulsa, OK',
  // Oregon
  'Portland, OR', 'Eugene, OR', 'Salem, OR',
  // Pennsylvania
  'Philadelphia, PA', 'Pittsburgh, PA', 'Harrisburg, PA',
  // Rhode Island
  'Providence, RI',
  // South Carolina
  'Charleston, SC', 'Columbia, SC', 'Greenville, SC',
  // South Dakota
  'Sioux Falls, SD', 'Rapid City, SD',
  // Tennessee
  'Nashville, TN', 'Memphis, TN', 'Knoxville, TN',
  // Texas
  'Houston, TX', 'Dallas, TX', 'Austin, TX', 'San Antonio, TX', 'Fort Worth, TX',
  // Utah
  'Salt Lake City, UT', 'Provo, UT',
  // Vermont
  'Burlington, VT', 'Montpelier, VT',
  // Virginia
  'Richmond, VA', 'Virginia Beach, VA', 'Norfolk, VA',
  // Washington
  'Seattle, WA', 'Tacoma, WA', 'Spokane, WA',
  // West Virginia
  'Charleston, WV', 'Morgantown, WV',
  // Wisconsin
  'Milwaukee, WI', 'Madison, WI', 'Green Bay, WI',
  // Wyoming
  'Cheyenne, WY', 'Casper, WY',
]

const MANUFACTURERS: Manufacturer[] = ['Ford', 'Toyota', 'Chevrolet']

const STARTING_MONEY_OPTIONS = [
  { value: 500000, label: '$500K — Shoestring Budget' },
  { value: 1000000, label: '$1M — Starter' },
  { value: 2500000, label: '$2.5M — Modest' },
  { value: 5000000, label: '$5M — Competitive' },
  { value: 10000000, label: '$10M — Well-Funded' },
  { value: 25000000, label: '$25M — Big Time' },
  { value: 50000000, label: '$50M — Unlimited' },
]

function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate()
}

function calculateAge(month: number, day: number, year: number): number {
  const today = new Date()
  const birthDate = new Date(year, month - 1, day)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

const currentYear = new Date().getFullYear()
const MIN_BIRTH_YEAR = currentYear - 120
const MAX_BIRTH_YEAR = currentYear - 18

const OwnerCreation: React.FC = () => {
  const navigate = useNavigate()
  const [toMenu, setToMenu] = useState(false)
  const backTimerRef = useRef<number | null>(null)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [birthMonth, setBirthMonth] = useState(0)
  const [birthDay, setBirthDay] = useState(0)
  const [birthYear, setBirthYear] = useState(0)
  const [nationality, setNationality] = useState('')
  const [slotError, setSlotError] = useState('')
  const [natOpen, setNatOpen] = useState(false)
  const natRef = useRef<HTMLDivElement | null>(null)

  // Team creation fields
  const [teamName, setTeamName] = useState('')
  const [teamCity, setTeamCity] = useState('')
  const [cityOpen, setCityOpen] = useState(false)
  const cityRef = useRef<HTMLDivElement | null>(null)
  const [manufacturer, setManufacturer] = useState<Manufacturer | ''>('')
  const [startingMoney, setStartingMoney] = useState(2500000)

  const age = birthMonth > 0 && birthDay > 0 && birthYear > 0
    ? calculateAge(birthMonth, birthDay, birthYear)
    : null

  const maxDay = birthMonth > 0 && birthYear > 0
    ? getDaysInMonth(birthMonth, birthYear)
    : 31

  useEffect(() => {
    if (birthDay > maxDay) {
      setBirthDay(maxDay)
    }
  }, [birthMonth, birthYear, maxDay, birthDay])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (natRef.current && !natRef.current.contains(e.target as Node)) {
        setNatOpen(false)
      }
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setCityOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      if (backTimerRef.current !== null) {
        window.clearTimeout(backTimerRef.current)
      }
    }
  }, [])

  const handleBackClick = () => {
    if (toMenu) return
    setToMenu(true)
    backTimerRef.current = window.setTimeout(() => {
      navigate('/')
    }, 400)
  }

  const isFormValid =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    birthMonth > 0 &&
    birthDay > 0 &&
    birthYear > 0 &&
    nationality.length > 0 &&
    age !== null &&
    age >= 18 &&
    age <= 120 &&
    teamName.trim().length > 0 &&
    teamCity.length > 0 &&
    manufacturer !== '' &&
    startingMoney > 0

  const handleContinue = () => {
    if (!isFormValid) return

    const emptySlotId = getFirstEmptySlotId()
    if (emptySlotId === null) {
      setSlotError('All save slots are full. Delete a save from the Load Career screen first.')
      return
    }

    const saveData: SaveSlotData = {
      slotId: emptySlotId,
      createdAt: new Date().toISOString(),
      lastPlayedAt: new Date().toISOString(),
      owner: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        nationality,
        birthMonth,
        birthDay,
        birthYear,
      },
      selectedTeam: {
        id: 1,
        series_id: 0,
        name: teamName.trim(),
        founded_year: 2026,
        base_city: teamCity,
        budget: startingMoney,
        reputation: 50,
        garage_rating: 50,
        headquarters: teamCity,
        manufacturer: manufacturer as Manufacturer,
      },
      money: startingMoney,
      chassis: [],
      inventory: [],
      currentWeek: 1,
      currentDate: '2026-01-01',
      currentSeason: 2026,
      totalChampionships: 0,
      totalWins: 0,
      carNumber: '1',
      maxAge: 65,
      hiredPitCrew: [],
      hiredDrivers: [],
      hiredCrewChiefs: [],
      hiredSpotters: [],
      hiredPitCrews: [],
      seasonResults: [],
      standings: [],
      ownerStandings: [],
      seasonPhase: 'preseason',
      driverChampionshipEarnings: 0,
      ownerChampionshipEarnings: 0,
      carEntries: [],
      orgStats: {
        championshipWins: 0,
        raceWins: 0,
        top5s: 0,
        top10s: 0,
        poles: 0,
        races: 0,
        dnfs: 0,
      },
    }

    saveSlot(saveData)
    setActiveSlotId(emptySlotId)
    navigate('/series-select')
  }

  const dayOptions: number[] = []
  for (let d = 1; d <= maxDay; d++) {
    dayOptions.push(d)
  }

  const yearOptions: number[] = []
  for (let y = MAX_BIRTH_YEAR; y >= MIN_BIRTH_YEAR; y--) {
    yearOptions.push(y)
  }

  return (
    <div className={`${styles.container} ${toMenu ? styles.toMenu : ''}`}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={handleBackClick}>
          ← Back
        </button>
        <div className={styles.headerText}>
          <h1 className={styles.title}>New Career</h1>
          <p className={styles.subtitle}>Create your owner identity and team.</p>
        </div>
      </div>

      {slotError && <div className={styles.errorBanner}>{slotError}</div>}

      <div className={styles.formCard}>
        <h2 className={styles.sectionTitle}>Personal Information</h2>

        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="firstName">First Name</label>
            <input
              id="firstName"
              className={styles.input}
              type="text"
              placeholder="Enter first name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              maxLength={30}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="lastName">Last Name</label>
            <input
              id="lastName"
              className={styles.input}
              type="text"
              placeholder="Enter last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              maxLength={30}
            />
          </div>
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label className={styles.label}>Nationality</label>
            <div className={styles.dropdown} ref={natRef}>
              <button
                type="button"
                className={`${styles.dropdownTrigger} ${natOpen ? styles.dropdownOpen : ''}`}
                onClick={() => setNatOpen((o) => !o)}
              >
                {nationality || 'Select nationality'}
              </button>
              {natOpen && (
                <ul className={styles.dropdownList}>
                  {NATIONALITIES.map((n) => (
                    <li
                      key={n}
                      className={`${styles.dropdownItem} ${nationality === n ? styles.dropdownItemActive : ''}`}
                      onClick={() => { setNationality(n); setNatOpen(false) }}
                    >
                      {n}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.formCard}>
        <h2 className={styles.sectionTitle}>Date of Birth</h2>

        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="birthMonth">Month</label>
            <select
              id="birthMonth"
              className={styles.select}
              value={birthMonth}
              onChange={(e) => setBirthMonth(Number(e.target.value))}
            >
              <option value={0}>Select month</option>
              {MONTHS.map((m, i) => (
                <option key={m} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="birthDay">Day</label>
            <select
              id="birthDay"
              className={styles.select}
              value={birthDay}
              onChange={(e) => setBirthDay(Number(e.target.value))}
            >
              <option value={0}>Select day</option>
              {dayOptions.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="birthYear">Year</label>
            <select
              id="birthYear"
              className={styles.select}
              value={birthYear}
              onChange={(e) => setBirthYear(Number(e.target.value))}
            >
              <option value={0}>Select year</option>
              {yearOptions.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {age !== null && (
          <div className={styles.ageDisplay}>
            Age: <strong>{age}</strong>
          </div>
        )}
      </div>

      <div className={styles.formCard}>
        <h2 className={styles.sectionTitle}>Team Information</h2>

        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="teamName">Team Name</label>
            <input
              id="teamName"
              className={styles.input}
              type="text"
              placeholder="Enter team name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              maxLength={40}
            />
          </div>
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label className={styles.label}>City</label>
            <div className={styles.dropdown} ref={cityRef}>
              <button
                type="button"
                className={`${styles.dropdownTrigger} ${cityOpen ? styles.dropdownOpen : ''}`}
                onClick={() => setCityOpen((o) => !o)}
              >
                {teamCity || 'Select city'}
              </button>
              {cityOpen && (
                <ul className={styles.dropdownList}>
                  {US_CITIES.map((c) => (
                    <li
                      key={c}
                      className={`${styles.dropdownItem} ${teamCity === c ? styles.dropdownItemActive : ''}`}
                      onClick={() => { setTeamCity(c); setCityOpen(false) }}
                    >
                      {c}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label className={styles.label}>Manufacturer</label>
            <div className={styles.manufacturerGroup}>
              {MANUFACTURERS.map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`${styles.manufacturerBtn} ${manufacturer === m ? styles.manufacturerBtnActive : ''}`}
                  onClick={() => setManufacturer(m)}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.formCard}>
        <h2 className={styles.sectionTitle}>Starting Budget</h2>

        <div className={styles.moneyGrid}>
          {STARTING_MONEY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`${styles.moneyBtn} ${startingMoney === opt.value ? styles.moneyBtnActive : ''}`}
              onClick={() => setStartingMoney(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.continueBtn}
          disabled={!isFormValid}
          onClick={handleContinue}
        >
          Continue to Series Selection →
        </button>
      </div>

      <div className={styles.footer}>
        <div className={styles.version}>v0.1.0 - Pre-Alpha</div>
        <div className={styles.copyright}>© Project Racing</div>
      </div>
    </div>
  )
}

export default OwnerCreation
