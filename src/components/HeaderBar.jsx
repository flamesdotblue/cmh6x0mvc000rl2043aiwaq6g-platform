import { Sun, Moon, Languages } from 'lucide-react'

export default function HeaderBar({ title, theme, setTheme, lang, setLang, t }) {
  return (
    <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-neutral-900/60 border-b border-neutral-200 dark:border-neutral-800">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C8 2 4 4 4 8c0 4 4 7 8 14 4-7 8-10 8-14 0-4-4-6-8-6Z" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="12" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </div>
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-sm"
            onClick={() => setLang(lang === 'en' ? 'tr' : 'en')}
            aria-label={t.language}
          >
            <Languages size={16} />
            <span>{lang === 'en' ? t.turkish : t.english}</span>
          </button>
          <button
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-sm"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            aria-label={t.theme}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            <span>{theme === 'light' ? t.dark : t.light}</span>
          </button>
        </div>
      </div>
    </header>
  )
}
