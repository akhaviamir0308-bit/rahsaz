import type { Project } from '../../shared/types'
import { detectProjectKind } from '../preview/projectKind'

export interface PublishGuide {
  projectKind: string
  platforms: { id: string; titleFa: string; titleEn: string; stepsFa: string[]; stepsEn: string[] }[]
  notesFa: string[]
  notesEn: string[]
}

export function buildPublishGuide(project: Project): PublishGuide {
  const files = project.files?.files || []
  const kind = detectProjectKind(files)
  const needsBackend = Boolean(project.architecture?.needsBackend)

  if (kind.kind === 'react_vite' || needsBackend) {
    return {
      projectKind: kind.kind === 'react_vite' ? 'react_vite' : 'backendish',
      platforms: [
        {
          id: 'vercel',
          titleFa: 'Vercel',
          titleEn: 'Vercel',
          stepsFa: [
            'روی سیستم: npm install && npm run build',
            'ریپو را به Vercel وصل کنید یا خروجی را Deploy کنید',
            'Framework را Vite/React انتخاب کنید',
            'اگر API دارید، آدرس و env را جدا تنظیم کنید',
          ],
          stepsEn: [
            'Locally: npm install && npm run build',
            'Connect the repo to Vercel or deploy the output',
            'Select Vite/React framework',
            'If you have an API, configure URL and env separately',
          ],
        },
        {
          id: 'netlify',
          titleFa: 'Netlify',
          titleEn: 'Netlify',
          stepsFa: [
            'Build command: npm run build',
            'Publish directory: معمولاً dist',
            'برای فرم/توابع از Netlify Functions استفاده کنید',
          ],
          stepsEn: [
            'Build command: npm run build',
            'Publish directory: usually dist',
            'Use Netlify Functions for forms/server bits',
          ],
        },
      ],
      notesFa: needsBackend
        ? ['این پروژه احتمالاً به Backend نیاز دارد؛ میزبانی فقط Frontend کافی نیست.', 'کلیدها را در env بگذارید نه در کد.']
        : ['پیش‌نمایش داخل راه‌ساز جایگزین build واقعی نیست.'],
      notesEn: needsBackend
        ? ['This project likely needs a backend; frontend-only hosting is not enough.', 'Put secrets in env, not in code.']
        : ['In-app preview is not a substitute for a real production build.'],
    }
  }

  return {
    projectKind: 'static',
    platforms: [
      {
        id: 'github-pages',
        titleFa: 'GitHub Pages',
        titleEn: 'GitHub Pages',
        stepsFa: [
          'از راه‌ساز ZIP بگیرید و در ریپو قرار دهید',
          'Settings → Pages → Deploy from branch',
          'شاخه main و پوشه / (root) را انتخاب کنید',
        ],
        stepsEn: [
          'Export ZIP from Rahsaz into a repo',
          'Settings → Pages → Deploy from branch',
          'Select main branch and / (root)',
        ],
      },
      {
        id: 'netlify-static',
        titleFa: 'Netlify (استاتیک)',
        titleEn: 'Netlify (static)',
        stepsFa: [
          'ZIP یا پوشه را Drag & Drop کنید',
          'یا ریپو را وصل کنید بدون build command',
        ],
        stepsEn: [
          'Drag & drop the ZIP/folder',
          'Or connect a repo with empty build command',
        ],
      },
    ],
    notesFa: ['برای سایت HTML/CSS/JS استاتیک، GitHub Pages معمولاً ساده‌ترین گزینه است.'],
    notesEn: ['For static HTML/CSS/JS, GitHub Pages is usually the simplest option.'],
  }
}
