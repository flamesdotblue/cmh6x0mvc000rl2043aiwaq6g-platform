import { ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react'
import { useMemo, useState } from 'react'

function classNames(...c){return c.filter(Boolean).join(' ')}

function WorkoutCard({ workout, index, dayIndex, onDragStart }) {
  const isTime = workout.type === 'time'
  const detail = isTime
    ? `${workout.duration} min`
    : `${workout.sets}x${workout.reps}, rest ${workout.rest}s`

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, dayIndex, index)}
      data-index={index}
      className="group cursor-grab active:cursor-grabbing select-none rounded-xl border border-emerald-200/60 dark:border-emerald-900/40 bg-white dark:bg-neutral-800 shadow-sm hover:shadow-md transition-shadow p-3 flex items-center gap-3"
    >
      <div className="h-10 w-10 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
        <span className="text-lg">{workout.icon || '🏋️'}</span>
      </div>
      <div className="min-w-0">
        <div className="font-medium truncate">{workout.name}</div>
        <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{workout.muscleLabel} • {detail} • {workout.locationLabel}</div>
      </div>
    </div>
  )
}

export default function WeekPlanner({ t, lang, dayNames, weekDates, week, onPrevWeek, onNextWeek, onOpenAdd, onCopyDay, onPasteDay, moveWorkout, updateDayWorkouts, muscleGroups, locations, labelFor }) {
  const [dragState, setDragState] = useState(null) // {sourceDay, sourceIndex}
  const [overIndex, setOverIndex] = useState({}) // dayIndex -> index
  const [menuOpen, setMenuOpen] = useState(null) // dayIndex

  const formatDate = (d) => {
    const locales = lang === 'tr' ? 'tr-TR' : 'en-US'
    return new Intl.DateTimeFormat(locales, { month: 'short', day: 'numeric' }).format(d)
  }

  const summaries = useMemo(() => {
    return week.map((d) => {
      const counts = {}
      d.workouts.forEach((w) => {
        counts[w.muscleGroup] = (counts[w.muscleGroup] || 0) + 1
      })
      return counts
    })
  }, [week])

  function handleDragStart(e, dayIndex, index) {
    setDragState({ sourceDay: dayIndex, sourceIndex: index })
    e.dataTransfer.setData('text/plain', JSON.stringify({ sourceDay: dayIndex, sourceIndex: index }))
    e.dataTransfer.effectAllowed = 'move'
  }
  function handleDragOver(e, dayIndex, index) {
    e.preventDefault()
    setOverIndex((prev) => ({ ...prev, [dayIndex]: index }))
    e.dataTransfer.dropEffect = 'move'
  }
  function handleDrop(e, dayIndex) {
    e.preventDefault()
    const data = e.dataTransfer.getData('text/plain')
    let payload = null
    try { payload = JSON.parse(data) } catch {}
    const targetIndex = overIndex[dayIndex]
    if (payload) {
      moveWorkout(payload.sourceDay, payload.sourceIndex, dayIndex, targetIndex)
    } else if (dragState) {
      moveWorkout(dragState.sourceDay, dragState.sourceIndex, dayIndex, targetIndex)
    }
    setDragState(null)
    setOverIndex((prev) => ({ ...prev, [dayIndex]: undefined }))
  }

  function handleReorderWithin(dayIndex, from, to){
    if (from === to || from == null || to == null) return
    const list = week[dayIndex].workouts.slice()
    const [it] = list.splice(from,1)
    list.splice(to,0,it)
    updateDayWorkouts(dayIndex, list)
  }

  return (
    <div className="bg-gradient-to-b from-emerald-50/50 to-transparent dark:from-emerald-900/10 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-3 lg:p-4">
      <div className="relative">
        <button onClick={onPrevWeek} className="absolute -left-2 -top-2 lg:-left-3 lg:-top-3 h-9 w-9 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow flex items-center justify-center hover:bg-neutral-50 dark:hover:bg-neutral-700"><ChevronLeft /></button>
        <button onClick={onNextWeek} className="absolute -right-2 -top-2 lg:-right-3 lg:-top-3 h-9 w-9 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow flex items-center justify-center hover:bg-neutral-50 dark:hover:bg-neutral-700"><ChevronRight /></button>
      </div>
      <div className="grid grid-cols-7 gap-3">
        {week.map((day, di) => (
          <div key={di} className="flex flex-col">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">{dayNames[di]}</div>
                <div className="text-xs text-neutral-500">{formatDate(weekDates[di])}</div>
              </div>
              <div className="relative">
                <button
                  className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  onClick={() => setMenuOpen(menuOpen === di ? null : di)}
                >
                  <MoreVertical size={18} />
                </button>
                {menuOpen === di && (
                  <div className="absolute right-0 mt-1 w-36 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow z-10">
                    <button className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-700" onClick={() => {onCopyDay(di); setMenuOpen(null)}}>{t.copyDay}</button>
                    <button className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-700" onClick={() => {onPasteDay(di); setMenuOpen(null)}}>{t.pasteDay}</button>
                  </div>
                )}
              </div>
            </div>
            <div
              className={classNames(
                'flex-1 min-h-[220px] rounded-2xl p-2 bg-white dark:bg-neutral-850/50 border border-neutral-200 dark:border-neutral-800 shadow-inner',
              )}
              onDragOver={(e) => handleDragOver(e, di, week[di].workouts.length)}
              onDrop={(e) => handleDrop(e, di)}
            >
              <div className="flex flex-col gap-2">
                {day.workouts.map((w, wi) => (
                  <div
                    key={w.id}
                    onDragOver={(e)=> handleDragOver(e, di, wi)}
                    onDrop={(e)=>{ e.preventDefault(); const payload = dragState; if (payload) { handleReorderWithin(di, payload.sourceIndex, wi) } handleDrop(e, di) }}
                  >
                    <WorkoutCard
                      workout={{...w, muscleLabel: labelFor(muscleGroups, w.muscleGroup), locationLabel: labelFor(locations, w.location)}}
                      index={wi}
                      dayIndex={di}
                      onDragStart={handleDragStart}
                    />
                  </div>
                ))}
              </div>
              <button
                className="mt-3 w-full text-sm font-medium inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-emerald-300/60 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20"
                onClick={() => onOpenAdd(di)}
              >
                + {t.addWorkout}
              </button>
              <div className="mt-3 text-xs text-neutral-600 dark:text-neutral-400">
                {Object.entries(summaries[di]).filter(([,c])=>c>0).map(([mg, c], idx) => (
                  <span key={mg}>
                    {c} {labelFor(muscleGroups, mg)}{idx < Object.keys(summaries[di]).filter((k)=>summaries[di][k]>0).length-1 ? ' • ' : ''}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
