/**
 * Demo project (résumé site) + project control-log generator.
 */
import { uid } from '../uid'
import type { Project, ProjectFile, Task, DiscoveryAnswer } from '../types'

type Lang = 'fa' | 'en'

export function buildDemo(lang: Lang) {
  const fa = lang === 'fa'
  const now = new Date().toISOString()
  const mk = (path: string, content: string): ProjectFile =>
    ({ id: uid(), path, kind: 'file', content, updatedAt: now })

  const name = fa ? 'سایت رزومه نمونه (کاربر)' : 'Sample résumé site (Kaarbar)'
  const description = fa
    ? 'پروژه نمونه آموزشی: سایت رزومه یک طراح گرافیک فریلنس'
    : 'Tutorial sample: résumé site of a freelance graphic designer'

  const answers: DiscoveryAnswer[] = fa ? [
    { questionId: 'q_goal', value: 'نمایش نمونه‌کارهای یک طراح گرافیک فریلنس و جذب مشتری پروژه‌ای' },
    { questionId: 'q_audience', value: 'صاحبان کسب‌وکارهای کوچک که لوگو، بسته‌بندی یا پوستر می‌خواهند' },
    { questionId: 'q_features', value: 'دکمه تماس (ایمیل)، کارت‌های نمونه‌کار، لینک شبکه‌های اجتماعی' },
    { questionId: 'q_pages', value: 'یک صفحه با پنج بخش: Hero، درباره من، نمونه‌کارها، مهارت‌ها، تماس' },
    { questionId: 'q_content', value: 'متن‌ها را خودم می‌نویسم؛ تصاویر در نسخه اول جایگزین هستند' },
    { questionId: 'q_design', value: 'مینیمال گرم؛ پس‌زمینه #FAF6F0، متن #3B2F2F، تأکید #E8743B' },
    { questionId: 'q_constraints', value: 'رایگان، موبایل‌فرست، فارسی و راست‌به‌چپ، بدون فریم‌ورک' },
    { questionId: 'q_success', value: 'حداقل ۵ تماس معتبر در ماه' },
  ] : [
    { questionId: 'q_goal', value: 'Show a freelance graphic designer\'s portfolio and win project clients' },
    { questionId: 'q_audience', value: 'Small business owners who need logos, packaging or posters' },
    { questionId: 'q_features', value: 'Contact button (email), portfolio cards, social links' },
    { questionId: 'q_pages', value: 'One page with five sections: Hero, About, Portfolio, Skills, Contact' },
    { questionId: 'q_content', value: 'I write the copy; images are placeholders in version 1' },
    { questionId: 'q_design', value: 'Warm minimal; background #FAF6F0, text #3B2F2F, accent #E8743B' },
    { questionId: 'q_constraints', value: 'Free, mobile-first, Persian and RTL, no framework' },
    { questionId: 'q_success', value: 'At least 5 qualified enquiries a month' },
  ]

  const notes = fa
    ? 'تصمیم سبک: مینیمال گرم — فونت Vazirmatn — کارت‌های گرد با سایه ملایم.'
    : 'Style decision: warm minimal — Vazirmatn font — rounded cards with soft shadow.'

  const html = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>کاربر | طراح گرافیک</title>
  <meta name="description" content="سایت رزومه و نمونه‌کار کاربر، طراح گرافیک فریلنس" />
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <header class="top">
    <a class="logo" href="#hero">کاربر</a>
    <nav>
      <a href="#about">درباره من</a>
      <a href="#work">نمونه‌کارها</a>
      <a href="#skills">مهارت‌ها</a>
      <a href="#contact">تماس</a>
    </nav>
  </header>

  <main>
    <section id="hero" class="hero">
      <p class="eyebrow">طراح گرافیک فریلنس</p>
      <h1>هویت بصری که برند شما را <span>به یاد ماندنی</span> می‌کند</h1>
      <p class="lead">لوگو، بسته‌بندی و پوستر برای کسب‌وکارهای کوچک — ساده، دقیق و به‌موقع.</p>
      <a class="btn" href="#contact">تماس با من</a>
    </section>

    <section id="about" class="section">
      <h2>درباره من</h2>
      <p>من کاربر هستم؛ طراح گرافیک با تمرکز بر هویت بصری. با صاحبان کسب‌وکار کوچک کار می‌کنم تا ایده‌شان به طرحی روشن و کاربردی تبدیل شود.</p>
    </section>

    <section id="work" class="section">
      <h2>نمونه‌کارها</h2>
      <div class="grid">
        <article class="card c1"><h3>لوگوی کافه</h3><p>هویت بصری کامل</p></article>
        <article class="card c2"><h3>بسته‌بندی چای</h3><p>طراحی جعبه و برچسب</p></article>
        <article class="card c3"><h3>پوستر همایش</h3><p>چاپی و دیجیتال</p></article>
        <article class="card c4"><h3>منوی رستوران</h3><p>طراحی و صفحه‌آرایی</p></article>
        <article class="card c5"><h3>کارت ویزیت</h3><p>مینیمال و گرم</p></article>
        <article class="card c6"><h3>بنر شبکه‌های اجتماعی</h3><p>مجموعه ۱۲ طرح</p></article>
      </div>
    </section>

    <section id="skills" class="section">
      <h2>مهارت‌ها</h2>
      <ul class="tags">
        <li>طراحی لوگو</li><li>هویت بصری</li><li>تایپوگرافی</li><li>Illustrator</li><li>Photoshop</li><li>Figma</li>
      </ul>
    </section>

    <section id="contact" class="section contact">
      <h2>تماس</h2>
      <p>برای همکاری یک ایمیل بفرستید؛ معمولاً ظرف یک روز پاسخ می‌دهم.</p>
      <a class="btn" href="mailto:hello@example.com">hello@example.com</a>
      <p class="links"><a href="https://instagram.com/" rel="noopener">Instagram</a> · <a href="https://behance.net/" rel="noopener">Behance</a></p>
    </section>
  </main>

  <footer>© <span id="year"></span> کاربر</footer>
  <script src="main.js"></script>
</body>
</html>
`

  const css = `:root { --bg:#FAF6F0; --text:#3B2F2F; --accent:#E8743B; --card:#fff; }
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { margin:0; background:var(--bg); color:var(--text); font-family:Vazirmatn, Tahoma, system-ui, sans-serif; line-height:1.9; }
.top { display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:12px; padding:16px 5vw; position:sticky; top:0; background:var(--bg); border-bottom:1px solid #e9dfd3; }
.logo { font-weight:800; font-size:20px; color:var(--accent); text-decoration:none; }
nav a { margin-inline-start:16px; color:var(--text); text-decoration:none; font-size:14px; }
nav a:hover { color:var(--accent); }
.hero { padding:12vh 5vw 9vh; max-width:900px; margin:auto; }
.eyebrow { color:var(--accent); font-weight:700; margin:0; }
h1 { font-size:clamp(28px,6vw,48px); line-height:1.5; margin:8px 0 14px; }
h1 span { color:var(--accent); }
.lead { font-size:18px; opacity:.85; max-width:560px; }
.btn { display:inline-block; background:var(--accent); color:#fff; padding:12px 26px; border-radius:12px; text-decoration:none; font-weight:700; margin-top:10px; }
.btn:hover { filter:brightness(.93); }
.section { padding:7vh 5vw; max-width:900px; margin:auto; }
h2 { font-size:26px; margin:0 0 14px; }
.grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:16px; }
.card { background:var(--card); border-radius:16px; padding:20px; min-height:150px; box-shadow:0 6px 20px #3b2f2f14; border-top:6px solid var(--accent); }
.card h3 { margin:0; font-size:17px; }
.card p { margin:6px 0 0; opacity:.7; font-size:14px; }
.c2 { border-top-color:#c9a24a; } .c3 { border-top-color:#7a9a6d; } .c4 { border-top-color:#b5655a; } .c5 { border-top-color:#6c8aa6; } .c6 { border-top-color:#9c7bb0; }
.tags { list-style:none; display:flex; flex-wrap:wrap; gap:10px; padding:0; margin:0; }
.tags li { background:#f1e6d8; padding:6px 14px; border-radius:999px; font-size:14px; }
.contact { text-align:center; }
.links a { color:var(--accent); }
footer { text-align:center; padding:30px; font-size:13px; opacity:.6; }
@media (max-width:600px){ nav a { margin-inline-start:10px; font-size:13px; } }
`

  const js = `document.getElementById('year').textContent = new Date().getFullYear();
`

  const tasks: Task[] = (fa
    ? ['نوشتن متن «درباره من» با نام و تخصص خودم', 'جایگزینی کارت‌های نمونه‌کار با کارهای واقعی', 'تغییر ایمیل و لینک شبکه‌های اجتماعی', 'تست روی موبایل', 'آنلاین‌کردن و فرستادن لینک برای یک دوست']
    : ['Write my own About text', 'Replace portfolio cards with real work', 'Change the email and social links', 'Test on mobile', 'Go online and send the link to a friend']
  ).map(title => ({ id: uid(), title, done: false, createdAt: now }))

  const files: ProjectFile[] = [
    mk('index.html', html), mk('styles.css', css), mk('main.js', js),
    mk('README.md', `# ${name}\n\n${fa ? 'پروژه نمونه آموزشی راه‌ساز. متن‌ها را با اطلاعات خودتان عوض کنید.' : 'Rahsaz tutorial sample. Replace the text with your own information.'}\n`),
  ]
  return { name, description, answers, notes, files, tasks }
}

/** Build the three "control log" files from a project (spec / decisions / status). */
export function buildControlDocs(project: Project, labels: (key: string) => string, fa: boolean): { path: string; content: string }[] {
  const answers = project.discovery?.answers || []
  const spec = [
    `${fa ? 'مشخصات نهایی' : 'Final specification'} — ${project.name}`,
    '='.repeat(40),
    project.description ? `${fa ? 'توضیح' : 'Description'}: ${project.description}` : '',
    '',
    ...answers.flatMap(a => [`• ${labels(a.questionId)}`, `  → ${a.value}`]),
  ].filter((x, i, arr) => !(x === '' && arr[i - 1] === '')).join('\n') + '\n'

  const decisions = [
    fa ? 'تصمیم‌های تأییدشده (رنگ، فونت، چیدمان)' : 'Approved decisions (colour, font, layout)',
    '='.repeat(40),
    project.discovery?.notes || (fa ? '(هنوز تصمیمی ثبت نشده — بعد از مرحله ۲ آموزش اینجا بنویسید)' : '(nothing recorded yet — write here after academy step 2)'),
  ].join('\n') + '\n'

  const snaps = project.versions?.snapshots || []
  const openTasks = (project.tasks || []).filter(t => !t.done)
  const status = [
    fa ? 'دفتر کنترل پروژه' : 'Project control log',
    '='.repeat(40),
    `${fa ? 'مشخصات نهایی' : 'Final spec'}: ${answers[0]?.value || '-'}`,
    `${fa ? 'تصمیم‌های تأییدشده' : 'Approved decisions'}: ${project.discovery?.notes || '-'}`,
    `${fa ? 'وضعیت فعلی' : 'Current state'}: ${labels(project.stage)}${project.discovery?.confirmed ? '' : (fa ? ' (نیازمندی‌ها هنوز تأیید نشده)' : ' (requirements not yet confirmed)')}`,
    `${fa ? 'نسخه سالم' : 'Good version'}: ${snaps[0]?.label || '-'}`,
    `${fa ? 'کار بعدی' : 'Next task'}: ${openTasks[0]?.title || '-'}`,
    `${fa ? 'مشکلات باز' : 'Open issues'}: -`,
    '',
    `${fa ? 'به‌روزرسانی' : 'Updated'}: ${new Date().toLocaleString(fa ? 'fa-IR' : 'en-US')}`,
  ].join('\n') + '\n'

  return [
    { path: 'docs/spec.txt', content: spec },
    { path: 'docs/decisions.txt', content: decisions },
    { path: 'docs/status.txt', content: status },
  ]
}
