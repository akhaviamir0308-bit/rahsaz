import { useEffect, useMemo, useState } from 'react'
import { Compass, FolderKanban, BookOpen, Settings, Plus, Sun, Moon, Languages, Sparkles, ArrowUpLeft, Trash2, X, Layers3, WandSparkles, Code2, Rocket, PanelLeftClose } from 'lucide-react'
import type { Language, Project, ProjectType, Theme } from './types'
import { getTranslations } from './data/translations'

const projectTypes: ProjectType[] = ['portfolio', 'business', 'store', 'education', 'blog', 'booking', 'community', 'webapp']
const STORAGE_KEY = 'rahsaz.projects.v020'

function readProjects(): Project[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as Project[] }
  catch { return [] }
}

export default function App() {
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('rahsaz.language') as Language) || 'fa')
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('rahsaz.theme') as Theme) || 'dark')
  const [projects, setProjects] = useState<Project[]>(readProjects)
  const [showCreate, setShowCreate] = useState(false)
  const [activePage, setActivePage] = useState<'overview' | 'projects' | 'guide' | 'settings'>('overview')
  const [name, setName] = useState('')
  const [type, setType] = useState<ProjectType>('portfolio')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const t = useMemo(() => getTranslations(language), [language])
  const isFa = language === 'fa'

  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = isFa ? 'rtl' : 'ltr'
    localStorage.setItem('rahsaz.language', language)
  }, [language, isFa])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('rahsaz.theme', theme)
  }, [theme])

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(projects)) }, [projects])

  function createProject() {
    if (!name.trim()) { setError(t.emptyName); return }
    const project: Project = {
      id: crypto.randomUUID(),
      name: name.trim(),
      type,
      description: description.trim(),
      createdAt: new Date().toISOString(),
      stage: 'discovery',
    }
    setProjects(current => [project, ...current])
    setName(''); setDescription(''); setType('portfolio'); setError(''); setShowCreate(false); setActivePage('projects')
  }

  const nav = [
    { id: 'overview' as const, label: t.overview, icon: Compass },
    { id: 'projects' as const, label: t.projects, icon: FolderKanban },
    { id: 'guide' as const, label: t.guide, icon: BookOpen },
    { id: 'settings' as const, label: t.settings, icon: Settings },
  ]

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-row">
          <div className="brand-mark"><WandSparkles size={21} /></div>
          <div><div className="brand-name">{t.brand}</div><div className="brand-caption">WEBSITE CREATION STUDIO</div></div>
        </div>
        <button className="new-project-button" onClick={() => setShowCreate(true)}><Plus size={18} />{t.newProject}</button>
        <div className="nav-label">{isFa ? 'فضای کاری' : 'WORKSPACE'}</div>
        <nav className="nav-list">
          {nav.map(item => {
            const Icon = item.icon
            return <button key={item.id} className={`nav-item ${activePage === item.id ? 'active' : ''}`} onClick={() => setActivePage(item.id)}><Icon size={18}/><span>{item.label}</span></button>
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card"><Sparkles size={18}/><strong>{isFa ? 'همراه ساخت وب‌سایتت' : 'Your website co-pilot'}</strong><p>{isFa ? 'ایده‌هایت را به قدم‌های روشن و قابل اجرا تبدیل کن.' : 'Turn your ideas into clear, actionable steps.'}</p></div>
          <div className="user-chip"><div className="avatar">R</div><div><strong>{isFa ? 'فضای شخصی' : 'Personal workspace'}</strong><small>{isFa ? 'نسخه آزمایشی' : 'Early preview'}</small></div><PanelLeftClose size={17} className="muted-icon"/></div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">{t.brand}<span>/</span><strong>{nav.find(n => n.id === activePage)?.label}</strong></div>
          <div className="top-actions">
            <button className="icon-button" title={t.language} onClick={() => setLanguage(language === 'fa' ? 'en' : 'fa')}><Languages size={18}/><span>{language === 'fa' ? 'EN' : 'فا'}</span></button>
            <button className="icon-button" title={t.theme} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? <Sun size={18}/> : <Moon size={18}/>}</button>
            <div className="status-pill"><span className="status-dot"/>{isFa ? 'ذخیره محلی فعال' : 'Local save active'}</div>
          </div>
        </header>

        <div className="content">
          {activePage === 'overview' && <>
            <section className="hero">
              <div className="hero-copy">
                <div className="eyebrow"><Sparkles size={15}/>{isFa ? 'فضای ساخت وب‌سایت با هوش مصنوعی' : 'AI-ASSISTED WEBSITE WORKSPACE'}</div>
                <h1>{t.welcome}</h1><p>{t.welcomeText}</p>
                <button className="primary-button" onClick={() => setShowCreate(true)}>{t.startHere}<ArrowUpLeft size={17}/></button>
              </div>
              <div className="hero-art"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="art-core"><WandSparkles size={38}/></div><div className="float-card float-top"><Layers3 size={17}/><span>{isFa ? 'معماری پروژه' : 'Project architecture'}</span></div><div className="float-card float-bottom"><Code2 size={17}/><span>{isFa ? 'توسعه گام‌به‌گام' : 'Step-by-step build'}</span></div></div>
            </section>
            <section className="stats-grid">
              <div className="stat-card"><span>{t.projectCount}</span><strong>{projects.length.toLocaleString(isFa ? 'fa-IR' : 'en-US')}</strong><small>{isFa ? 'در فضای کاری فعلی' : 'In this workspace'}</small></div>
              <div className="stat-card"><span>{isFa ? 'روش کار' : 'Workflow'}</span><strong>{isFa ? 'ترکیبی' : 'Hybrid'}</strong><small>{isFa ? 'راهنمایی + کنترل حرفه‌ای' : 'Guidance + advanced control'}</small></div>
              <div className="stat-card"><span>{isFa ? 'حریم خصوصی' : 'Privacy'}</span><strong>{isFa ? 'محلی' : 'Local'}</strong><small>{isFa ? 'بدون حساب کاربری اجباری' : 'No account required'}</small></div>
            </section>
            <section className="section-block">
              <div className="section-heading"><div><h2>{t.howItWorks}</h2><p>{isFa ? 'مسیر کلی که هر پروژه طی خواهد کرد' : 'The high-level path every project follows'}</p></div></div>
              <div className="steps-grid">
                {[{n:'01',title:t.step1,icon:Compass},{n:'02',title:t.step2,icon:Layers3},{n:'03',title:t.step3,icon:Code2},{n:'04',title:t.step4,icon:Rocket}].map(s => {const Icon=s.icon;return <div className="step-card" key={s.n}><div className="step-top"><span>{s.n}</span><Icon size={19}/></div><strong>{s.title}</strong></div>})}
              </div>
            </section>
            <section className="section-block">
              <div className="section-heading"><div><h2>{t.activeProjects}</h2><p>{isFa ? 'به پروژه‌های در حال ساختت دسترسی داشته باش' : 'Pick up where you left off'}</p></div><button className="text-button" onClick={() => setActivePage('projects')}>{isFa ? 'مشاهده همه' : 'View all'} <ArrowUpLeft size={15}/></button></div>
              {projects.length === 0 ? <div className="empty-state"><div className="empty-icon"><FolderKanban size={25}/></div><strong>{t.noProjects}</strong><button className="secondary-button" onClick={() => setShowCreate(true)}>{t.createFirst}</button></div> : <div className="project-grid">{projects.slice(0,3).map(p => <ProjectCard key={p.id} project={p} t={t} onDelete={() => setProjects(items => items.filter(x => x.id !== p.id))}/>)}</div>}
            </section>
          </>}

          {activePage === 'projects' && <section className="page-section"><div className="page-title-row"><div><div className="eyebrow">{isFa ? 'مدیریت فضای کاری' : 'WORKSPACE MANAGEMENT'}</div><h1>{t.projects}</h1><p>{isFa ? 'پروژه‌هایت را در یک مکان سازمان‌دهی کن.' : 'Organize all your website projects in one place.'}</p></div><button className="primary-button" onClick={() => setShowCreate(true)}><Plus size={17}/>{t.newProject}</button></div>{projects.length ? <div className="project-grid">{projects.map(p => <ProjectCard key={p.id} project={p} t={t} onDelete={() => setProjects(items => items.filter(x => x.id !== p.id))}/>)}</div> : <div className="empty-state"><div className="empty-icon"><FolderKanban size={25}/></div><strong>{t.noProjects}</strong><button className="secondary-button" onClick={() => setShowCreate(true)}>{t.createFirst}</button></div>}</section>}

          {activePage === 'guide' && <section className="page-section"><div className="eyebrow">{isFa ? 'شروع سریع' : 'QUICK START'}</div><h1>{t.guide}</h1><p>{t.modeText}</p><div className="guide-list">{[t.step1,t.step2,t.step3,t.step4].map((s,i)=><div className="guide-row" key={s}><span>0{i+1}</span><strong>{s}</strong><small>{isFa ? 'در فازهای بعدی فعال می‌شود' : 'Will be enabled in upcoming phases'}</small></div>)}</div></section>}

          {activePage === 'settings' && <section className="page-section"><div className="eyebrow">{isFa ? 'شخصی‌سازی' : 'PERSONALIZATION'}</div><h1>{t.settings}</h1><div className="settings-panel"><div><strong>{t.language}</strong><p>{isFa ? 'زبان و جهت نمایش محیط' : 'Interface language and direction'}</p></div><div className="segmented"><button className={language==='fa'?'selected':''} onClick={()=>setLanguage('fa')}>فارسی</button><button className={language==='en'?'selected':''} onClick={()=>setLanguage('en')}>English</button></div></div><div className="settings-panel"><div><strong>{t.theme}</strong><p>{isFa ? 'حالت نمایش دلخواهت را انتخاب کن' : 'Choose your preferred appearance'}</p></div><div className="segmented"><button className={theme==='light'?'selected':''} onClick={()=>setTheme('light')}>{t.light}</button><button className={theme==='dark'?'selected':''} onClick={()=>setTheme('dark')}>{t.dark}</button></div></div><div className="settings-panel"><div><strong>{isFa ? 'حالت تجربه کاربری' : 'Experience mode'}</strong><p>{t.modeText}</p></div><span className="mode-badge">{isFa ? 'ترکیبی' : 'Hybrid'}</span></div><p className="privacy-note">{t.localNotice}</p></section>}
        </div>
      </main>

      {showCreate && <div className="modal-backdrop" onMouseDown={e => {if(e.target===e.currentTarget)setShowCreate(false)}}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-head"><div><div className="eyebrow">{isFa ? 'فضای پروژه جدید' : 'NEW WORKSPACE PROJECT'}</div><h2 id="modal-title">{t.newProject}</h2></div><button className="icon-button" onClick={()=>setShowCreate(false)}><X size={19}/></button></div><label>{t.projectName}<input value={name} onChange={e=>{setName(e.target.value);setError('')}} placeholder={isFa ? 'مثلاً وب‌سایت شخصی من' : 'e.g. My personal website'}/></label><label>{t.projectType}<select value={type} onChange={e=>setType(e.target.value as ProjectType)}>{projectTypes.map(v=><option key={v} value={v}>{t[v]}</option>)}</select></label><label>{t.description}<textarea value={description} onChange={e=>setDescription(e.target.value)} rows={3} placeholder={isFa ? 'چه وب‌سایتی در ذهن داری؟' : 'What do you have in mind?'}/></label>{error && <p className="form-error">{error}</p>}<div className="modal-actions"><button className="secondary-button" onClick={()=>setShowCreate(false)}>{t.cancel}</button><button className="primary-button" onClick={createProject}>{t.create}<ArrowUpLeft size={16}/></button></div></section></div>}
    </div>
  )
}

function ProjectCard({project,t,onDelete}:{project:Project,t:ReturnType<typeof getTranslations>,onDelete:()=>void}) {
  const isFa = 'discovery' in t && t.discovery === 'نیازسنجی'
  return <article className="project-card"><div className="project-card-top"><div className="project-icon"><FolderKanban size={19}/></div><button className="delete-button" title={t.delete} onClick={onDelete}><Trash2 size={16}/></button></div><h3>{project.name}</h3><p>{project.description || t[project.type]}</p><div className="project-card-footer"><span className="stage-tag">{t.discovery}</span><small>{new Date(project.createdAt).toLocaleDateString(isFa?'fa-IR':'en-US')}</small></div></article>
}
