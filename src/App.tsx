import { useEffect, useMemo, useState, useCallback } from 'react'
import {
  Compass, FolderKanban, BookOpen, Settings, Plus, Sun, Moon,
  Languages, Sparkles, ArrowUpLeft, Trash2, X, Layers3,
  WandSparkles, Code2, Rocket, PanelLeftClose, AlertTriangle
} from 'lucide-react'
import type { Language, Project, ProjectType, Theme } from './types'
import { getTranslations, type TranslationKeys } from './data/translations'
import {
  loadProjects,
  createProject as storageCreate,
  deleteProject as storageDelete,
  storageInfo,
} from './storage'

const projectTypes: ProjectType[] = [
  'portfolio', 'business', 'store', 'education',
  'blog', 'booking', 'community', 'webapp'
]

type PageId = 'overview' | 'projects' | 'guide' | 'settings'

export default function App() {
  const [language, setLanguage] = useState<Language>(
    () => (localStorage.getItem('rahsaz.language') as Language) || 'fa'
  )
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem('rahsaz.theme') as Theme) || 'dark'
  )
  const [projects, setProjects] = useState<Project[]>([])
  const [storageReady, setStorageReady] = useState(false)
  const [storageError, setStorageError] = useState<string | null>(null)

  const [showCreate, setShowCreate] = useState(false)
  const [activePage, setActivePage] = useState<PageId>('overview')
  const [name, setName] = useState('')
  const [type, setType] = useState<ProjectType>('portfolio')
  const [description, setDescription] = useState('')
  const [formError, setFormError] = useState('')

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)

  const t = useMemo(() => getTranslations(language), [language])
  const isFa = language === 'fa'

  // Initial load
  useEffect(() => {
    const result = loadProjects()
    if (result.ok) {
      setProjects(result.data)
      setStorageError(null)
    } else {
      setStorageError(result.error)
      setProjects([])
    }
    setStorageReady(true)
  }, [])

  // Language & direction
  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = isFa ? 'rtl' : 'ltr'
    localStorage.setItem('rahsaz.language', language)
  }, [language, isFa])

  // Theme
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('rahsaz.theme', theme)
  }, [theme])

  const handleCreate = useCallback(() => {
    setFormError('')
    const result = storageCreate(
      { name, type, description },
      projects
    )
    if (!result.ok) {
      if (result.error === 'EMPTY_NAME') {
        setFormError(t.emptyName)
      } else {
        setFormError(t.storageError)
        setStorageError(result.error)
      }
      return
    }
    setProjects(result.data)
    setName('')
    setDescription('')
    setType('portfolio')
    setShowCreate(false)
    setActivePage('projects')
  }, [name, type, description, projects, t])

  const requestDelete = useCallback((project: Project) => {
    setDeleteTarget(project)
  }, [])

  const confirmDelete = useCallback(() => {
    if (!deleteTarget) return
    const result = storageDelete(deleteTarget.id, projects)
    if (result.ok) {
      setProjects(result.data)
      setDeleteTarget(null)
    } else {
      setStorageError(result.error)
      setDeleteTarget(null)
    }
  }, [deleteTarget, projects])

  const nav = [
    { id: 'overview' as const, label: t.overview, icon: Compass },
    { id: 'projects' as const, label: t.projects, icon: FolderKanban },
    { id: 'guide' as const, label: t.guide, icon: BookOpen },
    { id: 'settings' as const, label: t.settings, icon: Settings },
  ]

  if (!storageReady) {
    return (
      <div className="app-shell" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
        <p style={{ color: 'var(--muted)' }}>{isFa ? 'در حال بارگذاری...' : 'Loading...'}</p>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-row">
          <div className="brand-mark"><WandSparkles size={21} /></div>
          <div>
            <div className="brand-name">{t.brand}</div>
            <div className="brand-caption">WEBSITE CREATION STUDIO</div>
          </div>
        </div>

        <button className="new-project-button" onClick={() => setShowCreate(true)}>
          <Plus size={18} />{t.newProject}
        </button>

        <div className="nav-label">{isFa ? 'فضای کاری' : 'WORKSPACE'}</div>
        <nav className="nav-list">
          {nav.map(item => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                onClick={() => setActivePage(item.id)}
              >
                <Icon size={18} /><span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <Sparkles size={18} />
            <strong>{isFa ? 'همراه ساخت وب‌سایتت' : 'Your website co-pilot'}</strong>
            <p>{isFa ? 'ایده‌هایت را به قدم‌های روشن و قابل اجرا تبدیل کن.' : 'Turn your ideas into clear, actionable steps.'}</p>
          </div>
          <div className="user-chip">
            <div className="avatar">R</div>
            <div>
              <strong>{isFa ? 'فضای شخصی' : 'Personal workspace'}</strong>
              <small>{t.versionLabel}</small>
            </div>
            <PanelLeftClose size={17} className="muted-icon" />
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            {t.brand}<span>/</span>
            <strong>{nav.find(n => n.id === activePage)?.label}</strong>
          </div>
          <div className="top-actions">
            <button
              className="icon-button"
              title={t.language}
              onClick={() => setLanguage(language === 'fa' ? 'en' : 'fa')}
            >
              <Languages size={18} />
              <span>{language === 'fa' ? 'EN' : 'فا'}</span>
            </button>
            <button
              className="icon-button"
              title={t.theme}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="status-pill">
              <span className="status-dot" />
              {isFa ? 'ذخیره محلی فعال' : 'Local save active'}
            </div>
          </div>
        </header>

        {storageError && (
          <div className="storage-error-banner" role="alert">
            <AlertTriangle size={16} />
            <span>{t.storageError}</span>
            <button onClick={() => setStorageError(null)} aria-label="Dismiss">×</button>
          </div>
        )}

        <div className="content">
          {activePage === 'overview' && (
            <>
              <section className="hero">
                <div className="hero-copy">
                  <div className="eyebrow">
                    <Sparkles size={15} />
                    {isFa ? 'فضای ساخت وب‌سایت با هوش مصنوعی' : 'AI-ASSISTED WEBSITE WORKSPACE'}
                  </div>
                  <h1>{t.welcome}</h1>
                  <p>{t.welcomeText}</p>
                  <button className="primary-button" onClick={() => setShowCreate(true)}>
                    {t.startHere}<ArrowUpLeft size={17} />
                  </button>
                </div>
                <div className="hero-art">
                  <div className="orbit orbit-one" />
                  <div className="orbit orbit-two" />
                  <div className="art-core"><WandSparkles size={38} /></div>
                  <div className="float-card float-top">
                    <Layers3 size={17} />
                    <span>{isFa ? 'معماری پروژه' : 'Project architecture'}</span>
                  </div>
                  <div className="float-card float-bottom">
                    <Code2 size={17} />
                    <span>{isFa ? 'توسعه گام‌به‌گام' : 'Step-by-step build'}</span>
                  </div>
                </div>
              </section>

              <section className="stats-grid">
                <div className="stat-card">
                  <span>{t.projectCount}</span>
                  <strong>{projects.length.toLocaleString(isFa ? 'fa-IR' : 'en-US')}</strong>
                  <small>{isFa ? 'در فضای کاری فعلی' : 'In this workspace'}</small>
                </div>
                <div className="stat-card">
                  <span>{isFa ? 'روش کار' : 'Workflow'}</span>
                  <strong>{isFa ? 'ترکیبی' : 'Hybrid'}</strong>
                  <small>{isFa ? 'راهنمایی + کنترل حرفه‌ای' : 'Guidance + advanced control'}</small>
                </div>
                <div className="stat-card">
                  <span>{isFa ? 'حریم خصوصی' : 'Privacy'}</span>
                  <strong>{isFa ? 'محلی' : 'Local'}</strong>
                  <small>{isFa ? 'بدون حساب کاربری اجباری' : 'No account required'}</small>
                </div>
              </section>

              <section className="section-block">
                <div className="section-heading">
                  <div>
                    <h2>{t.howItWorks}</h2>
                    <p>{isFa ? 'مسیر کلی که هر پروژه طی خواهد کرد' : 'The high-level path every project follows'}</p>
                  </div>
                </div>
                <div className="steps-grid">
                  {[
                    { n: '01', title: t.step1, icon: Compass },
                    { n: '02', title: t.step2, icon: Layers3 },
                    { n: '03', title: t.step3, icon: Code2 },
                    { n: '04', title: t.step4, icon: Rocket },
                  ].map(s => {
                    const Icon = s.icon
                    return (
                      <div className="step-card" key={s.n}>
                        <div className="step-top">
                          <span>{s.n}</span>
                          <Icon size={19} />
                        </div>
                        <strong>{s.title}</strong>
                      </div>
                    )
                  })}
                </div>
              </section>

              <section className="section-block">
                <div className="section-heading">
                  <div>
                    <h2>{t.activeProjects}</h2>
                    <p>{isFa ? 'به پروژه‌های در حال ساختت دسترسی داشته باش' : 'Pick up where you left off'}</p>
                  </div>
                  <button className="text-button" onClick={() => setActivePage('projects')}>
                    {isFa ? 'مشاهده همه' : 'View all'} <ArrowUpLeft size={15} />
                  </button>
                </div>
                {projects.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon"><FolderKanban size={25} /></div>
                    <strong>{t.noProjects}</strong>
                    <button className="secondary-button" onClick={() => setShowCreate(true)}>
                      {t.createFirst}
                    </button>
                  </div>
                ) : (
                  <div className="project-grid">
                    {projects.slice(0, 3).map(p => (
                      <ProjectCard
                        key={p.id}
                        project={p}
                        t={t}
                        isFa={isFa}
                        onDelete={() => requestDelete(p)}
                      />
                    ))}
                  </div>
                )}
              </section>
            </>
          )}

          {activePage === 'projects' && (
            <section className="page-section">
              <div className="page-title-row">
                <div>
                  <div className="eyebrow">{isFa ? 'مدیریت فضای کاری' : 'WORKSPACE MANAGEMENT'}</div>
                  <h1>{t.projects}</h1>
                  <p>{isFa ? 'پروژه‌هایت را در یک مکان سازمان‌دهی کن.' : 'Organize all your website projects in one place.'}</p>
                </div>
                <button className="primary-button" onClick={() => setShowCreate(true)}>
                  <Plus size={17} />{t.newProject}
                </button>
              </div>
              {projects.length ? (
                <div className="project-grid">
                  {projects.map(p => (
                    <ProjectCard
                      key={p.id}
                      project={p}
                      t={t}
                      isFa={isFa}
                      onDelete={() => requestDelete(p)}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon"><FolderKanban size={25} /></div>
                  <strong>{t.noProjects}</strong>
                  <button className="secondary-button" onClick={() => setShowCreate(true)}>
                    {t.createFirst}
                  </button>
                </div>
              )}
            </section>
          )}

          {activePage === 'guide' && (
            <section className="page-section">
              <div className="eyebrow">{isFa ? 'شروع سریع' : 'QUICK START'}</div>
              <h1>{t.guide}</h1>
              <p>{t.modeText}</p>
              <div className="guide-list">
                {[t.step1, t.step2, t.step3, t.step4].map((s, i) => (
                  <div className="guide-row" key={s}>
                    <span>0{i + 1}</span>
                    <strong>{s}</strong>
                    <small>{isFa ? 'در فازهای بعدی فعال می‌شود' : 'Will be enabled in upcoming phases'}</small>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activePage === 'settings' && (
            <section className="page-section">
              <div className="eyebrow">{isFa ? 'شخصی‌سازی' : 'PERSONALIZATION'}</div>
              <h1>{t.settings}</h1>

              <div className="settings-panel">
                <div>
                  <strong>{t.language}</strong>
                  <p>{isFa ? 'زبان و جهت نمایش محیط' : 'Interface language and direction'}</p>
                </div>
                <div className="segmented">
                  <button className={language === 'fa' ? 'selected' : ''} onClick={() => setLanguage('fa')}>فارسی</button>
                  <button className={language === 'en' ? 'selected' : ''} onClick={() => setLanguage('en')}>English</button>
                </div>
              </div>

              <div className="settings-panel">
                <div>
                  <strong>{t.theme}</strong>
                  <p>{isFa ? 'حالت نمایش دلخواهت را انتخاب کن' : 'Choose your preferred appearance'}</p>
                </div>
                <div className="segmented">
                  <button className={theme === 'light' ? 'selected' : ''} onClick={() => setTheme('light')}>{t.light}</button>
                  <button className={theme === 'dark' ? 'selected' : ''} onClick={() => setTheme('dark')}>{t.dark}</button>
                </div>
              </div>

              <div className="settings-panel">
                <div>
                  <strong>{isFa ? 'حالت تجربه کاربری' : 'Experience mode'}</strong>
                  <p>{t.modeText}</p>
                </div>
                <span className="mode-badge">{isFa ? 'ترکیبی' : 'Hybrid'}</span>
              </div>

              <div className="settings-panel">
                <div>
                  <strong>{isFa ? 'ذخیره‌سازی' : 'Storage'}</strong>
                  <p>{isFa ? 'وضعیت فعلی لایه persistence' : 'Current persistence backend'}</p>
                </div>
                <span className="mode-badge">{storageInfo.backend}</span>
              </div>

              <p className="privacy-note">{t.localNotice}</p>
            </section>
          )}
        </div>
      </main>

      {/* Create Project Modal */}
      {showCreate && (
        <div
          className="modal-backdrop"
          onMouseDown={e => { if (e.target === e.currentTarget) setShowCreate(false) }}
        >
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="modal-head">
              <div>
                <div className="eyebrow">{isFa ? 'فضای پروژه جدید' : 'NEW WORKSPACE PROJECT'}</div>
                <h2 id="modal-title">{t.newProject}</h2>
              </div>
              <button className="icon-button" onClick={() => setShowCreate(false)} aria-label="Close">
                <X size={19} />
              </button>
            </div>

            <label>
              {t.projectName}
              <input
                value={name}
                onChange={e => { setName(e.target.value); setFormError('') }}
                placeholder={isFa ? 'مثلاً وب‌سایت شخصی من' : 'e.g. My personal website'}
                autoFocus
              />
            </label>

            <label>
              {t.projectType}
              <select value={type} onChange={e => setType(e.target.value as ProjectType)}>
                {projectTypes.map(v => (
                  <option key={v} value={v}>{t[v]}</option>
                ))}
              </select>
            </label>

            <label>
              {t.description}
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                placeholder={isFa ? 'چه وب‌سایتی در ذهن داری؟' : 'What do you have in mind?'}
              />
            </label>

            {formError && <p className="form-error">{formError}</p>}

            <div className="modal-actions">
              <button className="secondary-button" onClick={() => setShowCreate(false)}>{t.cancel}</button>
              <button className="primary-button" onClick={handleCreate}>
                {t.create}<ArrowUpLeft size={16} />
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          className="modal-backdrop"
          onMouseDown={e => { if (e.target === e.currentTarget) setDeleteTarget(null) }}
        >
          <section className="modal modal-danger" role="dialog" aria-modal="true" aria-labelledby="delete-title">
            <div className="modal-head">
              <div>
                <div className="eyebrow" style={{ color: '#ef4444' }}>
                  <AlertTriangle size={14} style={{ display: 'inline', marginInlineEnd: 4 }} />
                  {isFa ? 'عملیات غیرقابل بازگشت' : 'IRREVERSIBLE ACTION'}
                </div>
                <h2 id="delete-title">{t.confirmDeleteTitle}</h2>
              </div>
              <button className="icon-button" onClick={() => setDeleteTarget(null)} aria-label="Close">
                <X size={19} />
              </button>
            </div>

            <p style={{ margin: '12px 0 20px', lineHeight: 1.6, color: 'var(--muted)' }}>
              {t.confirmDeleteMessage}
            </p>
            <p style={{ marginBottom: 20, fontWeight: 600 }}>
              «{deleteTarget.name}»
            </p>

            <div className="modal-actions">
              <button className="secondary-button" onClick={() => setDeleteTarget(null)}>
                {t.cancel}
              </button>
              <button className="danger-button" onClick={confirmDelete}>
                <Trash2 size={16} />
                {t.confirmDeleteButton}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

/* ---------- Project Card ---------- */
function ProjectCard({
  project,
  t,
  isFa,
  onDelete,
}: {
  project: Project
  t: TranslationKeys
  isFa: boolean
  onDelete: () => void
}) {
  const stageLabel = t[project.stage] || t.discovery

  return (
    <article className="project-card">
      <div className="project-card-top">
        <div className="project-icon"><FolderKanban size={19} /></div>
        <button className="delete-button" title={t.delete} onClick={onDelete} aria-label={t.delete}>
          <Trash2 size={16} />
        </button>
      </div>
      <h3>{project.name}</h3>
      <p>{project.description || t[project.type]}</p>
      <div className="project-card-footer">
        <span className="stage-tag">{stageLabel}</span>
        <small>
          {new Date(project.updatedAt || project.createdAt).toLocaleDateString(isFa ? 'fa-IR' : 'en-US')}
        </small>
      </div>
    </article>
  )
}
