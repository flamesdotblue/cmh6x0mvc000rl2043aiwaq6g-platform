import { useEffect, useMemo, useRef, useState } from 'react'

export default function WeightPanel({ t, lang, weightHistory, onSave }) {
  const [input, setInput] = useState('')
  const [range, setRange] = useState('weekly')
  const canvasRef = useRef(null)

  useEffect(() => {
    draw()
  }, [weightHistory, range, lang])

  function draw() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    ctx.clearRect(0, 0, width, height)

    const { points, min, max, labels } = getSeries()

    // Axes
    ctx.strokeStyle = getComputedStyle(document.documentElement).classList.contains('dark') ? '#333' : '#e5e7eb'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(40, 10)
    ctx.lineTo(40, height - 30)
    ctx.lineTo(width - 10, height - 30)
    ctx.stroke()

    // Y labels
    ctx.fillStyle = getComputedStyle(document.body).color
    ctx.font = '12px Inter, system-ui, sans-serif'
    const steps = 4
    for (let i = 0; i <= steps; i++) {
      const yVal = min + ((max - min) * i) / steps
      const y = mapY(yVal, min, max, height)
      ctx.fillText(yVal.toFixed(0), 5, y + 4)
      ctx.strokeStyle = 'rgba(0,0,0,0.05)'
      ctx.beginPath()
      ctx.moveTo(40, y)
      ctx.lineTo(width - 10, y)
      ctx.stroke()
    }

    // X labels
    labels.forEach((lb, i) => {
      const x = mapX(i, labels.length, width)
      ctx.fillText(lb, x - 10, height - 10)
    })

    if (points.length === 0) return

    // Line
    ctx.strokeStyle = '#10b981'
    ctx.lineWidth = 2
    ctx.beginPath()
    points.forEach((p, i) => {
      const x = mapX(i, points.length, width)
      const y = mapY(p, min, max, height)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()

    // Points
    ctx.fillStyle = '#10b981'
    points.forEach((p, i) => {
      const x = mapX(i, points.length, width)
      const y = mapY(p, min, max, height)
      ctx.beginPath()
      ctx.arc(x, y, 3, 0, Math.PI * 2)
      ctx.fill()
    })
  }

  function mapX(i, total, width) {
    const left = 40
    const right = width - 20
    if (total <= 1) return left
    const step = (right - left) / (total - 1)
    return left + i * step
  }
  function mapY(val, min, max, height) {
    const top = 10
    const bottom = height - 30
    if (max === min) return bottom
    return bottom - ((val - min) / (max - min)) * (bottom - top)
  }

  function getSeries() {
    const today = new Date()
    let days = 7
    if (range === 'monthly') days = 30
    if (range === 'yearly') days = 365

    const labels = []
    const map = new Map(weightHistory.map((w) => [w.dateISO, w.weight]))
    const points = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const iso = d.toISOString().slice(0, 10)
      const val = map.get(iso)
      labels.push(formatLabel(d))
      points.push(val == null ? (points.length ? points[points.length - 1] : 0) : val)
    }
    const available = weightHistory.map((w) => w.weight)
    const min = Math.min(...available, ...points.filter((p)=>p>0), 50)
    const max = Math.max(...available, ...points, 100)
    return { points, min, max, labels }
  }

  function formatLabel(d) {
    if (range === 'yearly') return new Intl.DateTimeFormat(lang==='tr'?'tr-TR':'en-US', { month: 'short' }).format(d)
    return new Intl.DateTimeFormat(lang==='tr'?'tr-TR':'en-US', { day: '2-digit' }).format(d)
  }

  const latestWeight = useMemo(() => {
    if (weightHistory.length === 0) return '—'
    return weightHistory[weightHistory.length - 1].weight
  }, [weightHistory])

  function save() {
    const val = Number(input)
    if (!val) return
    onSave(val)
    setInput('')
  }

  return (
    <div className="sticky top-20 space-y-4">
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold">{t.currentWeight}</div>
          <div className="text-emerald-600 dark:text-emerald-400 font-medium">{latestWeight}</div>
        </div>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder={t.enterWeight}
            value={input}
            onChange={(e)=>setInput(e.target.value)}
            className="flex-1 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2"
          />
          <button onClick={save} className="px-4 py-2 rounded-lg bg-emerald-600 text-white">{t.saveWeight}</button>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold">{t.range}</div>
          <div className="flex gap-1">
            <button className={`px-3 py-1.5 rounded-lg text-sm ${range==='weekly'?'bg-emerald-600 text-white':'bg-neutral-100 dark:bg-neutral-800'}`} onClick={()=>setRange('weekly')}>{t.weekly}</button>
            <button className={`px-3 py-1.5 rounded-lg text-sm ${range==='monthly'?'bg-emerald-600 text-white':'bg-neutral-100 dark:bg-neutral-800'}`} onClick={()=>setRange('monthly')}>{t.monthly}</button>
            <button className={`px-3 py-1.5 rounded-lg text-sm ${range==='yearly'?'bg-emerald-600 text-white':'bg-neutral-100 dark:bg-neutral-800'}`} onClick={()=>setRange('yearly')}>{t.yearly}</button>
          </div>
        </div>
        <div className="h-48">
          <canvas ref={canvasRef} className="h-full w-full"/>
        </div>
      </div>
    </div>
  )
}
