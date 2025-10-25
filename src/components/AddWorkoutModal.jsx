import { useMemo, useState } from 'react'

const iconOptions = ['🏋️','🚴','🏃','🧘','🤸','🥊','🚶','⛰️']

export default function AddWorkoutModal({ open, onClose, t, lang, muscleGroups, setMuscleGroups, locations, setLocations, templates, setTemplates, onAdd }) {
  const [mode, setMode] = useState('new') // 'existing' | 'new'
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [name, setName] = useState('')
  const [icon, setIcon] = useState(iconOptions[0])
  const [muscleGroup, setMuscleGroup] = useState(muscleGroups[0]?.id || '')
  const [newMuscle, setNewMuscle] = useState('')
  const [type, setType] = useState('time')
  const [duration, setDuration] = useState(20)
  const [sets, setSets] = useState(3)
  const [reps, setReps] = useState(12)
  const [rest, setRest] = useState(60)
  const [location, setLocation] = useState(locations[0]?.id || '')
  const [newLocation, setNewLocation] = useState('')

  const canAdd = useMemo(() => {
    if (mode === 'existing') return !!selectedTemplateId
    if (!name || !muscleGroup || !location) return false
    if (type === 'time') return duration > 0
    return sets > 0 && reps > 0 && rest >= 0
  }, [mode, selectedTemplateId, name, muscleGroup, location, type, duration, sets, reps, rest])

  function resetFields(){
    setMode('new'); setSelectedTemplateId(''); setName(''); setIcon(iconOptions[0]); setMuscleGroup(muscleGroups[0]?.id||''); setNewMuscle(''); setType('time'); setDuration(20); setSets(3); setReps(12); setRest(60); setLocation(locations[0]?.id||''); setNewLocation('')
  }

  function handleAdd(){
    let payload
    if (mode === 'existing') {
      const tmpl = templates.find(t => t.id === selectedTemplateId)
      if (!tmpl) return
      payload = { ...tmpl }
    } else {
      let mg = muscleGroup
      if (newMuscle.trim()) {
        const id = newMuscle.trim().toLowerCase().replace(/\s+/g,'-')
        const entry = { id, labels: { en: newMuscle.trim(), tr: newMuscle.trim() } }
        setMuscleGroups((prev)=> prev.some(m=>m.id===id)? prev : [...prev, entry])
        mg = id
      }
      let loc = location
      if (newLocation.trim()) {
        const id = newLocation.trim().toLowerCase().replace(/\s+/g,'-')
        const entry = { id, labels: { en: newLocation.trim(), tr: newLocation.trim() } }
        setLocations((prev)=> prev.some(l=>l.id===id)? prev : [...prev, entry])
        loc = id
      }
      payload = { name, icon, muscleGroup: mg, type, ...(type==='time'?{duration:Number(duration)}:{sets:Number(sets), reps:Number(reps), rest:Number(rest)}), location: loc }
      const saveTemplate = { id: crypto.randomUUID(), ...payload }
      setTemplates((prev)=> [...prev, saveTemplate])
    }
    onAdd(payload)
    resetFields()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{t.workoutSelection}</h3>
          <button className="px-3 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800" onClick={onClose}>✕</button>
        </div>

        <div className="flex gap-2 mb-3 text-sm">
          <button className={`px-3 py-2 rounded-lg border ${mode==='existing'?'border-emerald-400 bg-emerald-50 text-emerald-700':'border-neutral-300 dark:border-neutral-700'}`} onClick={()=>setMode('existing')}>{t.chooseExisting}</button>
          <div className="px-1 py-2 text-neutral-400">{t.or}</div>
          <button className={`px-3 py-2 rounded-lg border ${mode==='new'?'border-emerald-400 bg-emerald-50 text-emerald-700':'border-neutral-300 dark:border-neutral-700'}`} onClick={()=>setMode('new')}>{t.createNew}</button>
        </div>

        {mode === 'existing' ? (
          <div className="space-y-3">
            <label className="block text-sm">
              <span className="block mb-1 text-neutral-600 dark:text-neutral-300">{t.select}</span>
              <select value={selectedTemplateId} onChange={(e)=>setSelectedTemplateId(e.target.value)} className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2">
                <option value="">—</option>
                {templates.map((tm)=> (
                  <option key={tm.id} value={tm.id}>{tm.name}</option>
                ))}
              </select>
            </label>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="text-sm">
              <div className="mb-1 text-neutral-600 dark:text-neutral-300">{t.workoutName}</div>
              <input value={name} onChange={(e)=>setName(e.target.value)} className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2" />
            </label>

            <label className="text-sm">
              <div className="mb-1 text-neutral-600 dark:text-neutral-300">{t.workoutIcon}</div>
              <div className="flex gap-2 flex-wrap">
                {iconOptions.map((ic)=> (
                  <button type="button" key={ic} onClick={()=>setIcon(ic)} className={`h-10 w-10 rounded-lg border ${icon===ic?'border-emerald-400 bg-emerald-50 text-emerald-700':'border-neutral-300 dark:border-neutral-700'}`}>{ic}</button>
                ))}
              </div>
            </label>

            <label className="text-sm">
              <div className="mb-1 text-neutral-600 dark:text-neutral-300">{t.muscleGroup}</div>
              <select value={muscleGroup} onChange={(e)=>setMuscleGroup(e.target.value)} className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2">
                {muscleGroups.map((mg)=> (
                  <option key={mg.id} value={mg.id}>{mg.labels[lang] || mg.labels.en}</option>
                ))}
              </select>
              <input placeholder={t.newMuscleGroup} value={newMuscle} onChange={(e)=>setNewMuscle(e.target.value)} className="mt-2 w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2" />
            </label>

            <label className="text-sm">
              <div className="mb-1 text-neutral-600 dark:text-neutral-300">{t.where}</div>
              <select value={location} onChange={(e)=>setLocation(e.target.value)} className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2">
                {locations.map((lc)=> (
                  <option key={lc.id} value={lc.id}>{lc.labels[lang] || lc.labels.en}</option>
                ))}
              </select>
              <input placeholder={t.newLocation} value={newLocation} onChange={(e)=>setNewLocation(e.target.value)} className="mt-2 w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2" />
            </label>

            <div className="text-sm">
              <div className="mb-2 text-neutral-600 dark:text-neutral-300">{t.workoutType}</div>
              <div className="flex items-center gap-3 mb-2">
                <label className={`px-3 py-2 rounded-lg border ${type==='time'?'border-emerald-400 bg-emerald-50 text-emerald-700':'border-neutral-300 dark:border-neutral-700'}`}><input type="radio" name="wtype" className="mr-2" checked={type==='time'} onChange={()=>setType('time')} />{t.timeBased}</label>
                <label className={`px-3 py-2 rounded-lg border ${type==='rep'?'border-emerald-400 bg-emerald-50 text-emerald-700':'border-neutral-300 dark:border-neutral-700'}`}><input type="radio" name="wtype" className="mr-2" checked={type==='rep'} onChange={()=>setType('rep')} />{t.repBased}</label>
              </div>

              {type === 'time' ? (
                <label className="block">
                  <div className="mb-1">{t.durationMin}</div>
                  <input type="number" min={1} value={duration} onChange={(e)=>setDuration(e.target.value)} className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2" />
                </label>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  <label className="block">
                    <div className="mb-1">{t.sets}</div>
                    <input type="number" min={1} value={sets} onChange={(e)=>setSets(e.target.value)} className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2" />
                  </label>
                  <label className="block">
                    <div className="mb-1">{t.reps}</div>
                    <input type="number" min={1} value={reps} onChange={(e)=>setReps(e.target.value)} className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2" />
                  </label>
                  <label className="block">
                    <div className="mb-1">{t.restTime}</div>
                    <input type="number" min={0} value={rest} onChange={(e)=>setRest(e.target.value)} className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2" />
                  </label>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700">{t.cancel}</button>
          <button disabled={!canAdd} onClick={handleAdd} className={`px-4 py-2 rounded-lg bg-emerald-600 text-white disabled:opacity-50 disabled:cursor-not-allowed`}>{t.add}</button>
        </div>
      </div>
    </div>
  )
}
