import { useEffect, useMemo, useState } from 'react'
import HeaderBar from './components/HeaderBar'
import WeekPlanner from './components/WeekPlanner'
import AddWorkoutModal from './components/AddWorkoutModal'
import WeightPanel from './components/WeightPanel'

const defaultMuscleGroups = [
  { id: 'chest', labels: { en: 'Chest', tr: 'Göğüs' } },
  { id: 'back', labels: { en: 'Back', tr: 'Sırt' } },
  { id: 'legs', labels: { en: 'Legs', tr: 'Bacak' } },
  { id: 'arms', labels: { en: 'Arms', tr: 'Kollar' } },
  { id: 'shoulders', labels: { en: 'Shoulders', tr: 'Omuzlar' } },
  { id: 'cardio', labels: { en: 'Cardio', tr: 'Kardiyo' } },
]

const defaultLocations = [
  { id: 'home', labels: { en: 'Home', tr: 'Ev' } },
  { id: 'gym', labels: { en: 'Gym', tr: 'Gym' } },
]

const i18n = {
  en: {
    appTitle: 'Workout Planner',
    addWorkout: 'Add Workout',
    copyDay: 'Copy Day',
    pasteDay: 'Paste Day',
    today: 'Today',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    language: 'Language',
    english: 'English',
    turkish: 'Turkish',
    workoutSelection: 'Workout Selection',
    chooseExisting: 'Choose existing',
    or: 'or',
    createNew: 'Create new workout',
    workoutName: 'Workout Name',
    workoutIcon: 'Workout Icon',
    muscleGroup: 'Muscle Group',
    workoutType: 'Workout Type',
    timeBased: 'Time-based',
    repBased: 'Rep-based',
    durationMin: 'Duration (min)',
    sets: 'Sets',
    reps: 'Reps',
    restTime: 'Rest time (sec)',
    location: 'Location',
    cancel: 'Cancel',
    add: 'Add',
    save: 'Save',
    where: 'Where?',
    select: 'Select',
    newMuscleGroup: 'Add new muscle group',
    newLocation: 'Add new location',
    currentWeight: 'Current Weight',
    enterWeight: "Enter today's weight",
    saveWeight: 'Save Weight',
    range: 'Range',
    weekly: 'Weekly',
    monthly: 'Monthly',
    yearly: 'Yearly',
    mon: 'Monday',
    tue: 'Tuesday',
    wed: 'Wednesday',
    thu: 'Thursday',
    fri: 'Friday',
    sat: 'Saturday',
    sun: 'Sunday',
  },
  tr: {
    appTitle: 'Antrenman Planlayıcı',
    addWorkout: 'Antrenman Ekle',
    copyDay: 'Günü Kopyala',
    pasteDay: 'Günü Yapıştır',
    today: 'Bugün',
    theme: 'Tema',
    light: 'Açık',
    dark: 'Koyu',
    language: 'Dil',
    english: 'İngilizce',
    turkish: 'Türkçe',
    workoutSelection: 'Antrenman Seçimi',
    chooseExisting: 'Mevcut seç',
    or: 'veya',
    createNew: 'Yeni antrenman oluştur',
    workoutName: 'Antrenman Adı',
    workoutIcon: 'Antrenman İkonu',
    muscleGroup: 'Kas Grubu',
    workoutType: 'Antrenman Tipi',
    timeBased: 'Süreye bağlı',
    repBased: 'Tekrar bazlı',
    durationMin: 'Süre (dk)',
    sets: 'Set',
    reps: 'Tekrar',
    restTime: 'Dinlenme (sn)',
    location: 'Konum',
    cancel: 'İptal',
    add: 'Ekle',
    save: 'Kaydet',
    where: 'Nerede?',
    select: 'Seç',
    newMuscleGroup: 'Yeni kas grubu ekle',
    newLocation: 'Yeni konum ekle',
    currentWeight: 'Güncel Kilo',
    enterWeight: 'Bugünkü kiloyu girin',
    saveWeight: 'Kiloyu Kaydet',
    range: 'Aralık',
    weekly: 'Haftalık',
    monthly: 'Aylık',
    yearly: 'Yıllık',
    mon: 'Pazartesi',
    tue: 'Salı',
    wed: 'Çarşamba',
    thu: 'Perşembe',
    fri: 'Cuma',
    sat: 'Cumartesi',
    sun: 'Pazar',
  },
}

function getMonday(date) {
  const d = new Date(date)
  const day = d.getDay() || 7 // Sunday=0 -> 7
  if (day !== 1) d.setDate(d.getDate() - (day - 1))
  d.setHours(0, 0, 0, 0)
  return d
}

function formatDate(date, lang) {
  const locales = lang === 'tr' ? 'tr-TR' : 'en-US'
  return new Intl.DateTimeFormat(locales, { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

export default function App() {
  const [theme, setTheme] = useState('light')
  const [lang, setLang] = useState('en')
  const t = i18n[lang]

  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()))
  const [planner, setPlanner] = useState({}) // {weekISO: [ {workouts: []} * 7 ]}
  const [templates, setTemplates] = useState([]) // saved workouts library
  const [muscleGroups, setMuscleGroups] = useState(defaultMuscleGroups)
  const [locations, setLocations] = useState(defaultLocations)
  const [copiedDay, setCopiedDay] = useState(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [modalTargetDayIndex, setModalTargetDayIndex] = useState(0)

  const [weightHistory, setWeightHistory] = useState([]) // [{dateISO, weight}]

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
  }, [theme])

  const weekKey = useMemo(() => weekStart.toISOString().slice(0, 10), [weekStart])

  // Ensure current week exists
  useEffect(() => {
    setPlanner((prev) => {
      if (prev[weekKey]) return prev
      const newWeek = Array.from({ length: 7 }, () => ({ workouts: [] }))
      return { ...prev, [weekKey]: newWeek }
    })
  }, [weekKey])

  const dayNames = useMemo(() => [t.mon, t.tue, t.wed, t.thu, t.fri, t.sat, t.sun], [t])

  function changeWeek(direction) {
    const currentWeekKey = weekKey
    const newMonday = new Date(weekStart)
    newMonday.setDate(newMonday.getDate() + (direction === 'next' ? 7 : -7))
    const targetKey = newMonday.toISOString().slice(0, 10)
    setPlanner((prev) => {
      if (prev[targetKey]) return prev
      if (direction === 'next') {
        // copy from current visible week
        const copy = (prev[currentWeekKey] || Array.from({ length: 7 }, () => ({ workouts: [] }))).map((d) => ({
          workouts: d.workouts.map((w) => ({ ...w }))
        }))
        return { ...prev, [targetKey]: copy }
      } else {
        return { ...prev, [targetKey]: Array.from({ length: 7 }, () => ({ workouts: [] })) }
      }
    })
    setWeekStart(newMonday)
  }

  function openAddWorkout(dayIndex) {
    setModalTargetDayIndex(dayIndex)
    setModalOpen(true)
  }

  function addWorkoutToDay(dayIndex, workout) {
    setPlanner((prev) => {
      const week = prev[weekKey].map((d) => ({ workouts: [...d.workouts] }))
      week[dayIndex].workouts.push({ id: crypto.randomUUID(), ...workout })
      return { ...prev, [weekKey]: week }
    })
  }

  function updateDayWorkouts(dayIndex, newList) {
    setPlanner((prev) => {
      const week = prev[weekKey].map((d) => ({ workouts: [...d.workouts] }))
      week[dayIndex].workouts = newList
      return { ...prev, [weekKey]: week }
    })
  }

  function moveWorkout(sourceDay, sourceIndex, targetDay, targetIndex) {
    if (sourceDay === undefined || sourceIndex === undefined || targetDay === undefined) return
    setPlanner((prev) => {
      const week = prev[weekKey].map((d) => ({ workouts: [...d.workouts] }))
      const [item] = week[sourceDay].workouts.splice(sourceIndex, 1)
      if (!item) return prev
      if (targetIndex === undefined || targetIndex < 0 || targetIndex > week[targetDay].workouts.length) {
        week[targetDay].workouts.push(item)
      } else {
        week[targetDay].workouts.splice(targetIndex, 0, item)
      }
      return { ...prev, [weekKey]: week }
    })
  }

  function copyDay(dayIndex) {
    const week = planner[weekKey]
    if (!week) return
    setCopiedDay(week[dayIndex].workouts.map((w) => ({ ...w })))
  }

  function pasteDay(dayIndex) {
    if (!copiedDay) return
    updateDayWorkouts(dayIndex, copiedDay.map((w) => ({ ...w, id: crypto.randomUUID() })))
  }

  function labelFor(list, id) {
    const item = list.find((x) => x.id === id)
    if (!item) return id
    return item.labels[lang] || item.labels.en
  }

  // Weight logic
  function saveTodayWeight(value) {
    if (!value || isNaN(value)) return
    const todayISO = new Date().toISOString().slice(0, 10)
    setWeightHistory((prev) => {
      const idx = prev.findIndex((w) => w.dateISO === todayISO)
      if (idx >= 0) {
        const copy = [...prev]
        copy[idx] = { dateISO: todayISO, weight: Number(value) }
        return copy
      }
      return [...prev, { dateISO: todayISO, weight: Number(value) }]
    })
  }

  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart)
      d.setDate(d.getDate() + i)
      return d
    })
  }, [weekStart])

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
      <HeaderBar
        title={t.appTitle}
        theme={theme}
        setTheme={setTheme}
        lang={lang}
        setLang={setLang}
        t={t}
      />

      <div className="max-w-[1400px] mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <div>
          <WeekPlanner
            t={t}
            lang={lang}
            dayNames={dayNames}
            weekDates={weekDates}
            week={planner[weekKey] || Array.from({ length: 7 }, () => ({ workouts: [] }))}
            onPrevWeek={() => changeWeek('prev')}
            onNextWeek={() => changeWeek('next')}
            onOpenAdd={openAddWorkout}
            onCopyDay={copyDay}
            onPasteDay={pasteDay}
            moveWorkout={moveWorkout}
            updateDayWorkouts={updateDayWorkouts}
            muscleGroups={muscleGroups}
            locations={locations}
            labelFor={labelFor}
          />
        </div>

        <div>
          <WeightPanel
            t={t}
            lang={lang}
            weightHistory={weightHistory}
            onSave={saveTodayWeight}
          />
        </div>
      </div>

      <AddWorkoutModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        t={t}
        lang={lang}
        muscleGroups={muscleGroups}
        setMuscleGroups={setMuscleGroups}
        locations={locations}
        setLocations={setLocations}
        templates={templates}
        setTemplates={setTemplates}
        onAdd={(workout) => {
          addWorkoutToDay(modalTargetDayIndex, workout)
          setModalOpen(false)
        }}
      />
    </div>
  )
}
