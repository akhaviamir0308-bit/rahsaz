/**
 * Rahsaz Academy — "from 0 to 100" learning content (bilingual).
 * Based on the "Step-by-step: build a website with AI" guide + a tour of Rahsaz tools.
 */

export type L = { fa: string; en: string }
const L = (fa: string, en: string): L => ({ fa, en })

export type ActionId =
  | 'newProject' | 'demo'
  | 'goto:overview' | 'goto:discovery' | 'goto:requirements' | 'goto:architecture' | 'goto:ai' | 'goto:files' | 'goto:preview'
  | 'goto:versions' | 'goto:publish' | 'goto:tasks' | 'goto:settings'

export type Block =
  | { k: 'p'; t: L }
  | { k: 'h'; t: L }
  | { k: 'ul'; items: L[] }
  | { k: 'ol'; items: L[] }
  | { k: 'tip'; t: L }
  | { k: 'warn'; t: L }
  | { k: 'prompt'; title: L; t: L }
  | { k: 'action'; id: ActionId; label: L }
  | { k: 'table'; head: L[]; rows: L[][] }
  | { k: 'check'; items: L[] }

export interface Lesson {
  id: string
  module: string
  title: L
  summary: L
  minutes: number
  blocks: Block[]
}

export interface ModuleInfo { id: string; title: L; desc: L }

export const MODULES: ModuleInfo[] = [
  { id: 'm0', title: L('۰. شروع از صفر', '0. Start from zero'), desc: L('راه‌ساز چیست، چطور فکر کنیم، چه چیزی لازم داریم', 'What Rahsaz is, the mindset, what you need') },
  { id: 'm1', title: L('۱. آشنایی با ابزارهای راه‌ساز', '1. Tour of Rahsaz tools'), desc: L('هر تب چه کاری می‌کند و کِی سراغش بروید', 'What every tab does and when to use it') },
  { id: 'm2', title: L('۲. پروژه عملی: سایت رزومه', '2. Hands-on: a résumé site'), desc: L('پنج مرحله از ایده تا لینک آنلاین', 'Five steps from idea to a live link') },
  { id: 'm3', title: L('۳. وقتی مشکل پیش آمد', '3. When things break'), desc: L('تشخیص، جمع‌آوری اطلاعات و اصلاح با AI', 'Diagnose, collect info, fix with AI') },
  { id: 'm4', title: L('۴. حرفه‌ای‌تر شوید', '4. Level up'), desc: L('امنیت، پروژه بعدی و مسیر یادگیری', 'Privacy, next projects, growth path') },
]

export const LESSONS: Lesson[] = [
  // ───────────── M0 ─────────────
  {
    id: 'what', module: 'm0', minutes: 5,
    title: L('راه‌ساز چیست و چطور کار می‌کند؟', 'What is Rahsaz and how does it work?'),
    summary: L('نقشه کلی: شما مدیر پروژه‌اید، هوش مصنوعی همکار فنی.', 'The big picture: you are the project manager, AI is the technical partner.'),
    blocks: [
      { k: 'p', t: L('راه‌ساز یک «میز کار» برای ساخت وب‌سایت با کمک هوش مصنوعی است. شما بدون برنامه‌نویسی، ایده را به نیازمندی، نیازمندی را به کد، و کد را به یک لینک آنلاین تبدیل می‌کنید.', 'Rahsaz is a workbench for building websites with AI. Without coding, you turn an idea into requirements, requirements into code, and code into a live link.') },
      { k: 'h', t: L('مسیر کلی هر پروژه', 'The path every project follows') },
      { k: 'ol', items: [
        L('نیازسنجی: به ۸ سؤال کلیدی جواب می‌دهید.', 'Discovery: answer 8 key questions.'),
        L('نیازمندی‌ها و معماری: راه‌ساز از پاسخ‌ها سند نیازمندی و پیشنهاد فنی می‌سازد؛ شما ویرایش و تأیید می‌کنید و برنامه وظایف می‌گیرید.', 'Requirements & architecture: Rahsaz builds a requirements document and a tech suggestion from your answers; you edit and confirm them and get a task plan.'),
        L('دستیار هوش مصنوعی: راه‌ساز یک پرامپت آماده می‌سازد، شما در ChatGPT یا Claude می‌چسبانید و پاسخ را برمی‌گردانید.', 'AI assistant: Rahsaz builds a ready prompt, you paste it in ChatGPT or Claude and bring the answer back.'),
        L('فایل‌ها: کد دریافتی را در ویرایشگر داخلی ذخیره می‌کنید.', 'Files: save the code you received in the built-in editor.'),
        L('پیش‌نمایش و کنترل کیفیت: سایت را در اندازه دسکتاپ، تبلت و موبایل می‌بینید.', 'Preview & QA: see the site at desktop, tablet and mobile sizes.'),
        L('نسخه‌ها و تست: قبل از هر تغییر مهم یک «نسخه سالم» می‌گیرید.', 'Versions & tests: take a "known good version" before every big change.'),
        L('انتشار: خروجی ZIP می‌گیرید و روی Netlify یا Cloudflare آنلاین می‌کنید.', 'Publish: export a ZIP and put it online via Netlify or Cloudflare.'),
      ] },
      { k: 'warn', t: L('نکته صادقانه: راه‌ساز فعلاً مستقیم به هوش مصنوعی وصل نیست. هوش مصنوعی را بیرون از راه‌ساز (ChatGPT، Claude، Gemini…) صدا می‌زنید و راه‌ساز مسیر، حافظه و نظم کار را نگه می‌دارد.', 'Honest note: Rahsaz is not directly connected to an AI yet. You call the AI outside (ChatGPT, Claude, Gemini…) while Rahsaz keeps the path, memory and order of the work.') },
      { k: 'p', t: L('همه چیز فقط در مرورگر خودتان ذخیره می‌شود؛ حساب کاربری ندارد و چیزی به سرور فرستاده نمی‌شود.', 'Everything is stored only in your browser; there is no account and nothing is sent to a server.') },
      { k: 'action', id: 'demo', label: L('یک پروژه نمونه آماده بساز و بگرد', 'Create a ready sample project and explore') },
    ],
  },
  {
    id: 'mindset', module: 'm0', minutes: 4,
    title: L('اصل بنیادین: سه مهارت', 'The core principle: three skills'),
    summary: L('لازم نیست برنامه‌نویس باشید؛ این سه مهارت کافی است.', 'You do not need to be a programmer; these three skills are enough.'),
    blocks: [
      { k: 'p', t: L('موفقیت در ساخت سایت با AI به این سه مهارت بستگی دارد:', 'Success with AI site-building depends on these three skills:') },
      { k: 'ol', items: [
        L('خواسته‌تان را دقیق و واضح بیان کنید. («یک سایت خوب» دقیق نیست؛ «سایت رزومه برای طراح گرافیک با پنج بخش و رنگ گرم» دقیق است.)', 'State what you want precisely. ("A nice site" is vague; "a résumé site for a graphic designer with five sections and warm colours" is precise.)'),
        L('خروجی را خودتان آزمایش کنید، مثل یک بازدیدکننده واقعی: روی موبایل، با کلیک روی همه دکمه‌ها.', 'Test the output yourself like a real visitor: on mobile, clicking every button.'),
        L('وقتی مشکل پیش آمد، اطلاعات را جمع کنید (پیام خطا، اسکرین‌شات، کد فعلی) و به AI بدهید تا اصلاح کند.', 'When something breaks, collect information (error message, screenshot, current code) and hand it to the AI to fix.'),
      ] },
      { k: 'tip', t: L('هدف این نیست که هیچ‌وقت با مشکل روبه‌رو نشوید؛ هدف این است که بدانید هنگام مشکل دقیقاً چه کنید. هر جا گیر کردید، به همین سه مهارت برگردید.', 'The goal is not to never hit problems; it is to know exactly what to do when you do. Whenever you are stuck, return to these three skills.') },
      { k: 'h', t: L('نقش شما', 'Your role') },
      { k: 'ul', items: [
        L('توصیف کنید: بگویید چه می‌خواهید.', 'Describe: say what you want.'),
        L('نگاه کنید: نتیجه را مثل بازدیدکننده ببینید.', 'Look: view the result like a visitor.'),
        L('اصلاح بخواهید: مشکل را با زبان ساده بگویید.', 'Ask for fixes: describe the problem in plain words.'),
      ] },
      { k: 'p', t: L('تصمیم نهایی همیشه با شماست. هوش مصنوعی پیشنهاد می‌دهد، شما تأیید می‌کنید.', 'The final decision is always yours. The AI proposes, you approve.') },
    ],
  },
  {
    id: 'prep', module: 'm0', minutes: 8,
    title: L('پیش‌نیازها و دفتر کنترل پروژه', 'Prerequisites and the project control log'),
    summary: L('حساب‌های لازم و چهار فایل ساده که پروژه را منظم نگه می‌دارند.', 'Accounts you need and four simple files that keep the project organised.'),
    blocks: [
      { k: 'h', t: L('حساب‌های ضروری (۱۰–۱۵ دقیقه)', 'Essential accounts (10–15 minutes)') },
      { k: 'table', head: [L('حساب', 'Account'), L('کاربرد', 'Use'), L('آدرس', 'URL')], rows: [
        [L('Claude یا ChatGPT', 'Claude or ChatGPT'), L('نوشتن مشخصات و تولید کد HTML', 'Writing specs and generating HTML'), L('claude.ai / chatgpt.com', 'claude.ai / chatgpt.com')],
        [L('Cloudflare یا Netlify', 'Cloudflare or Netlify'), L('آنلاین کردن سایت', 'Putting the site online'), L('dash.cloudflare.com / app.netlify.com', 'dash.cloudflare.com / app.netlify.com')],
      ] },
      { k: 'tip', t: L('ابزارهایی مثل v0.dev اختیاری و پیشرفته‌ترند. برای اولین پروژه لازم نیستند.', 'Tools like v0.dev are optional and more advanced. You do not need them for your first project.') },
      { k: 'h', t: L('دفتر کنترل پروژه', 'The project control log') },
      { k: 'p', t: L('پروژه‌های AI وقتی خراب می‌شوند که حافظه ندارند. چهار فایل ساده این مشکل را حل می‌کنند:', 'AI projects fall apart when they lack memory. Four simple files solve that:') },
      { k: 'ul', items: [
        L('spec.txt — مشخصات نهایی', 'spec.txt — final specification'),
        L('decisions.txt — تصمیم‌های تأییدشده (رنگ، فونت، چیدمان)', 'decisions.txt — approved decisions (colour, font, layout)'),
        L('status.txt — دفتر کنترل: وضعیت فعلی، نسخه سالم، کار بعدی، مشکلات باز', 'status.txt — control log: current state, good version, next task, open issues'),
        L('نسخه‌های سالم (version-1, version-2, …)', 'Known-good versions (version-1, version-2, …)'),
      ] },
      { k: 'prompt', title: L('قالب status.txt', 'status.txt template'), t: L('مشخصات نهایی: [خلاصه یک خطی]\nتصمیم‌های تأییدشده: [سبک + کد رنگ + فونت]\nوضعیت فعلی: [مثلاً مرحله ۳ — ساخت بخش نمونه‌کارها]\nنسخه سالم: [مثلاً version-2]\nکار بعدی: [دقیقاً چه کاری]\nمشکلات باز: [ایرادهای حل‌نشده]', 'Final spec: [one-line summary]\nApproved decisions: [style + colour codes + font]\nCurrent state: [e.g. step 3 — building the portfolio section]\nGood version: [e.g. version-2]\nNext task: [exactly what]\nOpen issues: [unresolved problems]') },
      { k: 'tip', t: L('در راه‌ساز نیازی نیست این‌ها را دستی بسازید: در تب «فایل‌ها» دکمه «دفتر کنترل پروژه» این سه فایل را از پاسخ‌های نیازسنجی می‌سازد و «نسخه‌ها» جای version-N را می‌گیرد.', 'In Rahsaz you do not need to create them by hand: in the Files tab, the "Project control log" button builds these files from your discovery answers, and Versions replaces version-N.') },
    ],
  },

  // ───────────── M1: tools ─────────────
  {
    id: 't-dashboard', module: 'm1', minutes: 4,
    title: L('داشبورد و مدیریت پروژه‌ها', 'Dashboard and project management'),
    summary: L('ساخت، باز کردن و حذف پروژه؛ زبان و تم.', 'Create, open and delete projects; language and theme.'),
    blocks: [
      { k: 'ol', items: [
        L('روی «پروژه جدید» بزنید؛ نام، نوع وب‌سایت و یک توضیح کوتاه بدهید.', 'Click "New project"; give a name, website type and a short description.'),
        L('پروژه به‌صورت کارت نمایش داده می‌شود. روی کارت بزنید تا وارد «محیط اختصاصی پروژه» شوید.', 'The project appears as a card. Click it to enter the project workspace.'),
        L('سطل زباله حذف می‌کند؛ قبل از حذف تأیید می‌گیرد و برگشت‌پذیر نیست.', 'The trash icon deletes; it asks for confirmation and cannot be undone.'),
        L('دکمه‌های بالای صفحه: تغییر زبان (فارسی/English) و تم (روشن/تاریک).', 'Top-bar buttons: language (Persian/English) and theme (light/dark).'),
      ] },
      { k: 'warn', t: L('همه داده‌ها در مرورگر شما ذخیره می‌شود. اگر اطلاعات مرورگر را پاک کنید یا مرورگر عوض کنید، پروژه‌ها از بین می‌روند. از تب «انتشار» به‌طور منظم «پشتیبان JSON» بگیرید.', 'All data lives in your browser. If you clear browsing data or switch browsers, projects are lost. Take a JSON backup from the Publish tab regularly.') },
      { k: 'action', id: 'newProject', label: L('همین حالا یک پروژه بساز', 'Create a project now') },
    ],
  },
  {
    id: 't-discovery', module: 'm1', minutes: 6,
    title: L('نیازسنجی: تبدیل ایده به مشخصات', 'Discovery: turning an idea into a spec'),
    summary: L('۸ سؤال کلیدی، تأیید نیازمندی‌ها و ورود به مرحله برنامه‌ریزی.', '8 key questions, confirming requirements and moving to planning.'),
    blocks: [
      { k: 'p', t: L('نیازسنجی مهم‌ترین مرحله است. پاسخ‌های شما بعداً خودکار داخل پرامپت‌ها قرار می‌گیرد؛ پس هر چه دقیق‌تر، خروجی AI بهتر.', 'Discovery is the most important step. Your answers are automatically inserted into prompts later, so the more precise they are, the better the AI output.') },
      { k: 'ul', items: [
        L('هدف سایت، مخاطبان، قابلیت‌های ضروری، صفحات، منبع محتوا، سبک ظاهری، محدودیت‌ها و معیار موفقیت.', 'Goal, audience, essential features, pages, content source, visual style, constraints and success measure.'),
        L('نیازی نیست همه را پر کنید؛ ولی برای «تأیید نیازمندی‌ها» حداقل ۳ پاسخ لازم است.', 'You need not fill all of them, but confirming requires at least 3 answers.'),
        L('«ذخیره» فقط ذخیره می‌کند. «تأیید» سند نیازمندی‌ها را می‌سازد و مرحله پروژه را از «نیازسنجی» به «برنامه‌ریزی» می‌برد.', '"Save" only saves. "Confirm" builds the requirements document and moves the project from Discovery to Planning.'),
      ] },
      { k: 'h', t: L('نمونه پاسخ خوب', 'A good answer example') },
      { k: 'table', head: [L('سؤال', 'Question'), L('پاسخ ضعیف', 'Weak answer'), L('پاسخ خوب', 'Good answer')], rows: [
        [L('هدف', 'Goal'), L('یک سایت خوب', 'A good site'), L('نمایش نمونه‌کارها و جذب مشتری پروژه‌ای برای طراح گرافیک', 'Show portfolio and attract project clients for a graphic designer')],
        [L('مخاطب', 'Audience'), L('همه', 'Everyone'), L('صاحبان کسب‌وکار کوچک که لوگو و بسته‌بندی می‌خواهند', 'Small business owners needing logos and packaging')],
        [L('موفقیت', 'Success'), L('معروف شدن', 'Become famous'), L('حداقل ۵ تماس معتبر در ماه', 'At least 5 qualified enquiries a month')],
      ] },
      { k: 'tip', t: L('جواب را نمی‌دانید؟ از تب «دستیار AI» کارت «بررسی نیازسنجی» را بزنید؛ AI نقاط ضعف را پیدا می‌کند و سؤال تکمیلی می‌دهد.', 'Not sure what to answer? In the AI tab use the "Review discovery" card; the AI finds gaps and suggests follow-up questions.') },
      { k: 'action', id: 'goto:discovery', label: L('برو به نیازسنجی', 'Go to Discovery') },
    ],
  },
  {
    id: 't-reqarch', module: 'm1', minutes: 7,
    title: L('نیازمندی‌ها، معماری و برنامه وظایف', 'Requirements, architecture and the task plan'),
    summary: L('از پاسخ‌های نیازسنجی تا یک برنامه اجرایی قابل پیگیری.', 'From discovery answers to a trackable execution plan.'),
    blocks: [
      { k: 'p', t: L('بعد از تأیید نیازسنجی، راه‌ساز یک «سند نیازمندی» می‌سازد. این سند پل بین ایده شما و کدی است که ساخته می‌شود.', 'After you confirm discovery, Rahsaz builds a requirements document. It is the bridge between your idea and the code that gets built.') },
      { k: 'h', t: L('تب نیازمندی‌ها', 'The Requirements tab') },
      { k: 'ul', items: [
        L('هر مورد یک نوع دارد: عملکردی، غیرعملکردی، محدودیت یا سؤال باز، و یک اولویت (P1 بالا تا P3 پایین).', 'Every item has a kind (functional, non-functional, constraint, open question) and a priority (P1 high to P3 low).'),
        L('می‌توانید توضیح هر مورد را ویرایش، نوع و اولویت را عوض، مورد را حذف و نیازمندی دستی اضافه کنید. هر ویرایش «تأیید» را برمی‌دارد تا دوباره مرور کنید.', 'You can edit the text, change kind and priority, delete items and add manual ones. Any edit clears the confirmation so you review again.'),
        L('اگر بعد از ساخت سند، پاسخ‌های نیازسنجی را عوض کنید، هشدار «قدیمی‌شدن» می‌بینید. بازسازی سند، ویرایش‌های دستی را جایگزین می‌کند و قبلش می‌پرسد.', 'If you change discovery answers after the document was built, you get an "outdated" warning. Regenerating replaces manual edits and asks first.'),
        L('«سؤال باز» یعنی اطلاعات ناقص است؛ قبل از ساخت صفحه‌ها آن را روشن کنید.', 'An "open question" means information is missing; resolve it before building pages.'),
        L('دکمه ذخیره در فایل‌ها، docs/requirements.md را می‌سازد تا همراه ZIP برود یا به AI داده شود.', 'The save-to-files button creates docs/requirements.md so it travels with the ZIP or can be given to an AI.'),
      ] },
      { k: 'h', t: L('تب معماری', 'The Architecture tab') },
      { k: 'ul', items: [
        L('راه‌ساز با توجه به نوع پروژه و کلمات کلیدی پاسخ‌ها (مثلاً «رزرو»، «سبد خرید»، «ورود کاربر») یک رویکرد پیشنهاد می‌دهد: استاتیک، محتوایی، فروشگاهی، رزرو، پویا یا وب‌اپ.', 'Based on the project type and keywords in your answers (e.g. booking, cart, user login) Rahsaz suggests an approach: static, content, store, booking, dynamic or web app.'),
        L('عبارت‌هایی مثل «بدون پرداخت» نادیده گرفته می‌شوند.', 'Negated phrases such as "no payment" are ignored.'),
        L('این فقط پیشنهاد است؛ برای نسخه اول تقریباً همیشه HTML/CSS/JS ساده بهترین مسیر است.', 'It is only a suggestion; for a first version plain HTML/CSS/JS is almost always the best path.'),
      ] },
      { k: 'h', t: L('ساخت برنامه وظایف', 'Generating the task plan') },
      { k: 'ul', items: [
        L('دکمه «ساخت برنامه وظایف» از روی صفحات معماری و قابلیت‌های سند، وظیفه‌های اولویت‌دار می‌سازد (فقط قابلیت‌ها؛ نه هدف و مخاطب).', 'The "generate task plan" button creates prioritised tasks from the architecture pages and the document\'s features (features only, not goal or audience).'),
        L('اگر دوباره بسازید، وظیفه‌های انجام‌شده تیکشان را نگه می‌دارند و وظیفه‌های دستی شما دست‌نخورده می‌مانند.', 'If you regenerate, completed tasks stay ticked and your manual tasks are untouched.'),
      ] },
      { k: 'tip', t: L('اگر پروژه شما قبلاً فایل دارد، «قدم بعدی پیشنهادی» دیگر شما را به ساخت سند نیازمندی مجبور نمی‌کند.', 'If your project already has files, the "suggested next step" no longer forces you through the requirements document.') },
      { k: 'action', id: 'goto:requirements', label: L('برو به نیازمندی‌ها', 'Go to Requirements') },
      { k: 'action', id: 'goto:architecture', label: L('برو به معماری', 'Go to Architecture') },
    ],
  },
  {
    id: 't-ai', module: 'm1', minutes: 7,
    title: L('دستیار هوش مصنوعی: پرامپت آماده و تاریخچه', 'AI assistant: ready prompts and history'),
    summary: L('سه قدم: انتخاب کمک، کپی پرامپت، چسباندن پاسخ.', 'Three steps: pick help, copy prompt, paste the answer.'),
    blocks: [
      { k: 'ol', items: [
        L('یکی از شش کارت را انتخاب کنید: ساختار صفحات، قابلیت‌ها، متن صفحه اصلی، پیشنهاد فنی، لیست وظایف، بررسی نیازسنجی. یا درخواست دلخواه خودتان را بنویسید.', 'Pick one of six cards: page structure, features, homepage copy, tech suggestion, task list, discovery review. Or write your own request.'),
        L('راه‌ساز اطلاعات پروژه و پاسخ‌های نیازسنجی را به آن اضافه می‌کند و یک پرامپت کامل می‌سازد. «کپی» را بزنید.', 'Rahsaz adds your project info and discovery answers and builds a complete prompt. Click "Copy".'),
        L('متن را در ChatGPT، Claude، Gemini یا هر ابزار دیگر بچسبانید.', 'Paste the text into ChatGPT, Claude, Gemini or any other tool.'),
        L('پاسخ را برگردانید و در کادر «چسباندن پاسخ» ذخیره کنید تا در تاریخچه پروژه بماند.', 'Bring the answer back and save it in the "Paste response" box so it stays in the project history.'),
      ] },
      { k: 'tip', t: L('اگر یک AI دو بار نتوانست مشکلی را حل کند، همان پرسش را به AI دیگر بدهید.', 'If one AI fails twice to solve a problem, give the same question to a different AI.') },
      { k: 'warn', t: L('رمز، کلید API و اطلاعات حساس را هرگز در پرامپت نگذارید.', 'Never put passwords, API keys or sensitive data in a prompt.') },
      { k: 'p', t: L('برای ساخت کد کامل HTML از «بانک پرامپت» همین آموزش استفاده کنید (پرامپت مرحله ۳).', 'To generate full HTML code use the Prompt Bank in this academy (step-3 prompt).') },
      { k: 'action', id: 'goto:ai', label: L('برو به دستیار AI', 'Go to the AI assistant') },
    ],
  },
  {
    id: 't-files', module: 'm1', minutes: 6,
    title: L('فایل‌ها و ویرایشگر کد', 'Files and the code editor'),
    summary: L('ساخت فایل، چسباندن کد AI، ذخیره با Ctrl+S.', 'Create files, paste AI code, save with Ctrl+S.'),
    blocks: [
      { k: 'ul', items: [
        L('«ایجاد ساختار اولیه» چهار فایل شروع می‌سازد: index.html، styles.css، main.js و README.md.', '"Create starter structure" makes four starter files: index.html, styles.css, main.js and README.md.'),
        L('برای فایل جدید مسیر را بنویسید، مثل about.html یا css/theme.css، و «ایجاد فایل» را بزنید. پوشه‌ها هم با همین روش ساخته می‌شوند.', 'For a new file type a path such as about.html or css/theme.css and click "Create file". Folders work the same way.'),
        L('روی نام فایل بزنید تا در ویرایشگر باز شود. کد AI را بچسبانید و Ctrl+S (در مک Cmd+S) یا «ذخیره» را بزنید.', 'Click a file to open it in the editor. Paste the AI code and press Ctrl+S (Cmd+S on Mac) or click "Save".'),
        L('قبل از رفتن به فایل دیگر، اگر تغییر ذخیره‌نشده باشد هشدار می‌گیرید.', 'You get a warning before switching files if there are unsaved changes.'),
        L('«دفتر کنترل پروژه» فایل‌های docs/spec.txt، docs/decisions.txt و docs/status.txt را از اطلاعات پروژه می‌سازد.', '"Project control log" creates docs/spec.txt, docs/decisions.txt and docs/status.txt from your project data.'),
      ] },
      { k: 'warn', t: L('فایل‌ها در راه‌ساز فقط متنی‌اند (HTML، CSS، JS، متن). تصویر را به‌صورت لینک اینترنتی یا گرادیانت CSS در سایت بیاورید و اگر فایل تصویر واقعی دارید، بعد از دریافت ZIP کنار index.html بگذارید.', 'Files in Rahsaz are text only (HTML, CSS, JS, text). Use image links or CSS gradients, and if you have real image files, put them next to index.html after downloading the ZIP.') },
      { k: 'tip', t: L('نام فایل اصلی دقیقاً index.html باشد؛ سرویس‌های میزبانی همین را به‌عنوان صفحه اول می‌شناسند.', 'The main file must be named exactly index.html; hosting services treat it as the home page.') },
      { k: 'action', id: 'goto:files', label: L('برو به فایل‌ها', 'Go to Files') },
    ],
  },
  {
    id: 't-preview', module: 'm1', minutes: 5,
    title: L('پیش‌نمایش و چک‌لیست کیفیت', 'Preview and the QA checklist'),
    summary: L('دیدن سایت در دسکتاپ/تبلت/موبایل و بازبینی دستی.', 'See the site on desktop/tablet/mobile and review manually.'),
    blocks: [
      { k: 'ul', items: [
        L('پیش‌نمایش، index.html را اجرا می‌کند و CSS و JS محلی را که با نام در تگ‌های link و script آمده‌اند داخل آن می‌گذارد.', 'The preview runs index.html and inlines local CSS and JS referenced by name in link and script tags.'),
        L('سه اندازه دارد: دسکتاپ، تبلت (۷۶۸) و موبایل (۳۷۵). بعد از هر ویرایش «تازه‌سازی» را بزنید.', 'Three sizes: desktop, tablet (768) and mobile (375). Click "Refresh" after each edit.'),
        L('پیش‌نمایش در محیط ایزوله (sandbox) اجرا می‌شود: اسکریپت کار می‌کند، اما باز کردن لینک‌ها در تب جدید و ارسال فرم بسته است. این‌ها را بعد از انتشار روی لینک واقعی بررسی کنید.', 'The preview runs in a sandbox: scripts work, but opening links in new tabs and form submission are blocked. Check them on the real link after publishing.'),
      ] },
      { k: 'h', t: L('چک‌لیست کیفیت (دستی)', 'QA checklist (manual)') },
      { k: 'check', items: [
        L('روی موبایل خوانا است؟', 'Readable on mobile?'),
        L('محتوا کامل و درست است؟', 'Is the content complete and correct?'),
        L('لینک‌ها کار می‌کنند؟', 'Do links work?'),
        L('تصاویر نمایش داده می‌شوند؟', 'Do images display?'),
        L('زبان و جهت متن درست است؟', 'Are language and text direction correct?'),
      ] },
      { k: 'p', t: L('این پنج مورد را در راه‌ساز تیک بزنید؛ حداقل نصف آن‌ها برای «آمادگی انتشار» لازم است.', 'Tick these five in Rahsaz; at least half are needed for "publish readiness".') },
      { k: 'action', id: 'goto:preview', label: L('برو به پیش‌نمایش', 'Go to Preview') },
    ],
  },
  {
    id: 't-versions', module: 'm1', minutes: 5,
    title: L('نسخه‌ها و تست خودکار', 'Versions and automatic tests'),
    summary: L('نسخه سالم بگیرید، تست اجرا کنید، در صورت خرابی برگردید.', 'Take known-good snapshots, run tests, roll back if something breaks.'),
    blocks: [
      { k: 'h', t: L('نسخه (Snapshot)', 'Snapshots') },
      { k: 'ul', items: [
        L('یک نسخه، عکسی از همه فایل‌ها و مرحله پروژه است. معادل version-N در دفتر کنترل.', 'A snapshot is a picture of all files and the project stage. It is the equivalent of version-N in the control log.'),
        L('قبل از هر درخواست بزرگ به AI یک نسخه بگیرید. اگر نتیجه بد شد، «بازیابی» همه فایل‌ها را به همان لحظه برمی‌گرداند.', 'Take one before every big AI request. If the result is bad, "Restore" returns all files to that moment.'),
        L('حداکثر ۲۰ نسخه نگه داشته می‌شود؛ قدیمی‌ترها خودکار حذف می‌شوند.', 'Up to 20 snapshots are kept; the oldest are dropped automatically.'),
      ] },
      { k: 'h', t: L('تست فایل‌ها', 'File tests') },
      { k: 'ul', items: [
        L('وجود index.html', 'index.html exists'),
        L('نبودن فایل خالی', 'No empty files'),
        L('وجود حداقل یک CSS', 'At least one CSS file'),
        L('معتبر بودن لینک‌های محلی index.html (مثلاً styles.css واقعاً وجود دارد)', 'Local links in index.html are valid (e.g. styles.css really exists)'),
        L('تعداد فایل‌ها', 'File count'),
      ] },
      { k: 'tip', t: L('تست‌ها فقط ساختار را می‌سنجند. «کار می‌کند» بودن سایت را فقط چشم و دست خودتان تأیید می‌کند.', 'Tests only check structure. Only your eyes and hands can confirm that the site "works".') },
      { k: 'action', id: 'goto:versions', label: L('برو به نسخه‌ها', 'Go to Versions') },
    ],
  },
  {
    id: 't-publish', module: 'm1', minutes: 6,
    title: L('انتشار: آمادگی، ZIP و پشتیبان', 'Publish: readiness, ZIP and backup'),
    summary: L('چه چیزی باید سبز باشد و بعد چه کنیم.', 'What must be green and what to do next.'),
    blocks: [
      { k: 'p', t: L('«آمادگی انتشار» پنج شرط دارد: نیازمندی‌ها تأیید شده، index.html هست، فایل وجود دارد، آخرین تست (بعد از آخرین تغییر فایل‌ها) موفق است، و حداقل نصف چک‌لیست کیفیت تیک خورده.', '"Publish readiness" has five conditions: requirements confirmed, index.html exists, files exist, the latest test (after the last file change) passed, and at least half the QA list is ticked.') },
      { k: 'ul', items: [
        L('«دریافت ZIP»: همه فایل‌های پروژه را در یک فایل ZIP می‌دهد.', '"Export ZIP": all project files in one ZIP.'),
        L('«پشتیبان JSON»: کل پروژه (نیازسنجی، تاریخچه AI، نسخه‌ها و…) برای نگهداری.', '"JSON backup": the whole project (discovery, AI history, versions…) for safekeeping.'),
        L('«علامت‌گذاری منتشرشده»: فقط وضعیت پروژه را عوض می‌کند. خودش سایت را آنلاین نمی‌کند!', '"Mark as published": only changes the project status. It does NOT put the site online!'),
      ] },
      { k: 'h', t: L('آنلاین کردن واقعی', 'Actually going online') },
      { k: 'ol', items: [
        L('ZIP را دریافت و از حالت فشرده خارج کنید تا پوشه‌ای شامل index.html بسازد.', 'Export the ZIP and unzip it so you get a folder containing index.html.'),
        L('Netlify: به app.netlify.com/drop بروید و پوشه را روی کادر بکشید.', 'Netlify: go to app.netlify.com/drop and drag the folder onto the box.'),
        L('Cloudflare: Workers & Pages > Create > Upload assets (Drag and drop).', 'Cloudflare: Workers & Pages > Create > Upload assets (Drag and drop).'),
        L('لینک را روی موبایل باز کنید و برای یک دوست بفرستید.', 'Open the link on mobile and send it to a friend.'),
      ] },
      { k: 'tip', t: L('اگر نام دکمه‌ها در این سرویس‌ها فرق کرد، اسکرین‌شات بگیرید و از AI بپرسید «دکمه معادل این مرحله الان کجاست؟».', 'If button names differ in these services, take a screenshot and ask the AI "where is the equivalent button for this step now?".') },
      { k: 'action', id: 'goto:publish', label: L('برو به انتشار', 'Go to Publish') },
    ],
  },
  {
    id: 't-tasks', module: 'm1', minutes: 3,
    title: L('وظایف و تنظیمات پروژه', 'Tasks and project settings'),
    summary: L('فهرست کارها و تغییر مشخصات پروژه.', 'A to-do list and editing project details.'),
    blocks: [
      { k: 'ul', items: [
        L('تب «وظایف»: کارهای کوچک را اضافه و تیک بزنید؛ درصد پیشرفت در نمای کلی نشان داده می‌شود.', 'Tasks tab: add and tick small jobs; progress is shown in the overview.'),
        L('پاسخ کارت «لیست وظایف» دستیار AI را می‌توانید اینجا وارد کنید.', 'You can enter the result of the AI assistant "task list" card here.'),
        L('تنظیمات پروژه: نام، توضیح، نوع، مرحله و وضعیت (فعال، بایگانی، تکمیل‌شده).', 'Project settings: name, description, type, stage and status (active, archived, completed).'),
      ] },
      { k: 'tip', t: L('در «نمای کلی» کارت «قدم بعدی پیشنهادی» همیشه می‌گوید الان چه کاری منطقی است.', 'In the Overview, the "Suggested next step" card always tells you what makes sense now.') },
    ],
  },

  // ───────────── M2: practice ─────────────
  {
    id: 'p-intro', module: 'm2', minutes: 5,
    title: L('معرفی پروژه نمونه: سایت رزومه', 'Meet the sample project: a résumé site'),
    summary: L('«کاربر»، طراح گرافیک فریلنس، یک صفحه آنلاین می‌خواهد.', '"Kaarbar", a freelance graphic designer, wants an online page.'),
    blocks: [
      { k: 'p', t: L('در این بخش یک پروژه واقعی و کوچک را از ابتدا تا انتها می‌سازید. زمان تقریبی: ۲ تا ۴ ساعت. عجله نکنید.', 'Here you build a small real project end to end. Approximate time: 2–4 hours. Do not rush.') },
      { k: 'h', t: L('پنج بخش سایت', 'The five sections') },
      { k: 'ul', items: [
        L('بالای صفحه (Hero): نام، تخصص و دکمه «تماس با من»', 'Hero: name, specialty and a "Contact me" button'),
        L('درباره من: معرفی کوتاه', 'About me: short intro'),
        L('نمونه‌کارها: چند کارت تصویری', 'Portfolio: a few image cards'),
        L('مهارت‌ها: برچسب‌های کوتاه', 'Skills: short tags'),
        L('تماس: ایمیل و لینک شبکه‌های اجتماعی', 'Contact: email and social links'),
      ] },
      { k: 'h', t: L('مواد خام قبل از شروع', 'Raw material before you start') },
      { k: 'ul', items: [
        L('نام، تخصص و معرفی ۲–۳ جمله‌ای (اگر ندارید AI پیشنهاد می‌دهد)', 'Name, specialty and a 2–3 sentence intro (the AI can suggest one)'),
        L('چند تصویر (یا تصاویر جایگزین رایگان در نسخه اول)', 'A few images (or free placeholders in the first version)'),
        L('ایمیل و لینک یک یا دو شبکه اجتماعی', 'Email and one or two social links'),
      ] },
      { k: 'h', t: L('معیار موفقیت واقعی', 'Real success criteria') },
      { k: 'check', items: [
        L('لینک روی گوشی باز می‌شود و هر ۵ بخش دیده می‌شود', 'The link opens on a phone and all 5 sections show'),
        L('متن‌ها خوانا هستند و چیزی بیرون نزده', 'Text is readable and nothing overflows'),
        L('دکمه تماس کار می‌کند', 'The contact button works'),
        L('تصاویر نمایش داده می‌شوند', 'Images display'),
        L('لینک شبکه‌های اجتماعی باز می‌شوند', 'Social links open'),
        L('لینک را به یک دوست فرستاده‌اید و باز کرده است', 'You sent the link to a friend and they opened it'),
      ] },
      { k: 'action', id: 'demo', label: L('پروژه نمونه آماده را باز کن و کنار آموزش جلو برو', 'Open the ready sample and follow along') },
    ],
  },
  {
    id: 'p1', module: 'm2', minutes: 20,
    title: L('مرحله ۱ — تعریف نیاز', 'Step 1 — Define the need'),
    summary: L('با AI گفت‌وگو کنید تا ایده به سند مشخصات تبدیل شود.', 'Talk with the AI until the idea becomes a spec document.'),
    blocks: [
      { k: 'ol', items: [
        L('پروژه را در راه‌ساز بسازید و در تب «نیازسنجی» به سؤال‌ها جواب دهید.', 'Create the project in Rahsaz and answer the questions in the Discovery tab.'),
        L('پرامپت زیر را در Claude یا ChatGPT بفرستید و به سؤال‌هایش جواب دهید.', 'Send the prompt below to Claude or ChatGPT and answer its questions.'),
        L('وقتی سند مشخصات آمد و گفتید «بله، همین است»، آن را در spec.txt (یا در یادداشت نیازسنجی) ذخیره کنید.', 'When the spec arrives and you say "yes, that is it", save it to spec.txt (or in the discovery notes).'),
      ] },
      { k: 'prompt', title: L('پرامپت مرحله ۱', 'Step 1 prompt'), t: L('نقش تو: مشاور ارشد محصول دیجیتال.\n\nوظیفه: می‌خواهم یک سایت رزومه شخصی بسازم. ایده: «من طراح گرافیک فریلنس هستم و می‌خواهم نمونه‌کار نشان بدهم و مشتری جذب کنم.»\n\nقدم‌به‌قدم سؤال بپرس و منتظر جوابم بمان. در نهایت سند مشخصات بده شامل: هدف، مخاطب، بخش‌های صفحه، حس و حال، ویژگی‌ها، محدودیت‌ها.', 'Your role: senior digital product consultant.\n\nTask: I want to build a personal résumé site. Idea: "I am a freelance graphic designer and I want to show my portfolio and attract clients."\n\nAsk me questions step by step and wait for my answers. At the end give a spec document containing: goal, audience, page sections, look and feel, features, constraints.') },
      { k: 'tip', t: L('اگر نمی‌دانید دقیقاً چه می‌خواهید، هنوز در مرحله ۱ هستید؛ جلوتر نروید.', 'If you do not know exactly what you want, you are still in step 1; do not move on.') },
      { k: 'action', id: 'goto:discovery', label: L('برو به نیازسنجی', 'Go to Discovery') },
    ],
  },
  {
    id: 'p2', module: 'm2', minutes: 20,
    title: L('مرحله ۲ — طراحی ظاهر', 'Step 2 — Visual design'),
    summary: L('سه سبک بگیرید، یکی را انتخاب و ثبت کنید.', 'Get three styles, pick one and record it.'),
    blocks: [
      { k: 'p', t: L('سند مشخصات را بدهید و ۳ پیشنهاد سبک بگیرید. یکی را انتخاب کنید و در decisions.txt (یا یادداشت‌های نیازسنجی) بنویسید تا فراموش نشود.', 'Give the spec and get 3 style proposals. Pick one and write it in decisions.txt (or the discovery notes) so it is not forgotten.') },
      { k: 'prompt', title: L('پرامپت مرحله ۲', 'Step 2 prompt'), t: L('نقش تو: طراح UI/UX ارشد.\n\nبر اساس این مشخصات: [متن spec.txt]\n\n۳ پیشنهاد سبک بصری بده. هر کدام شامل نام سبک، پالت رنگی با کد (مثل #FAF6F0)، فونت، حس کلی و مخاطب مناسب. در پایان بگو کدام را توصیه می‌کنی و چرا.', 'Your role: senior UI/UX designer.\n\nBased on this spec: [spec.txt text]\n\nGive 3 visual style proposals. Each with style name, colour palette with codes (e.g. #FAF6F0), font, overall feel and suitable audience. At the end say which you recommend and why.') },
      { k: 'p', t: L('نمونه سبک‌ها: مینیمال گرم (#FAF6F0 / #3B2F2F / #E8743B) — تیره و مدرن — رنگی و خلاق.', 'Style examples: warm minimal (#FAF6F0 / #3B2F2F / #E8743B) — dark and modern — colourful and creative.') },
      { k: 'tip', t: L('کد رنگ و نام فونت را حتماً ثبت کنید؛ بعداً باید همان را عیناً به AI برگردانید.', 'Always record the colour codes and font name; you will need to feed them back to the AI exactly.') },
    ],
  },
  {
    id: 'p3', module: 'm2', minutes: 50,
    title: L('مرحله ۳ — ساخت صفحه', 'Step 3 — Build the page'),
    summary: L('یک فایل HTML مستقل، بخش‌به‌بخش.', 'One standalone HTML file, section by section.'),
    blocks: [
      { k: 'warn', t: L('قانون مهم: از AI بخواهید «فقط یک فایل HTML مستقل» بدهد، نه پروژه React یا Next.js. برای مبتدی، ساده‌تر و مطمئن‌تر است.', 'Key rule: ask the AI for "a single standalone HTML file", not a React or Next.js project. It is simpler and safer for beginners.') },
      { k: 'prompt', title: L('پرامپت مرحله ۳', 'Step 3 prompt'), t: L('نقش تو: توسعه‌دهنده فرانت‌اند که کد تمیز و ساده می‌نویسد.\n\nیک صفحه کامل سایت رزومه برای «کاربر» طراح گرافیک بساز.\n\nبخش‌ها: Hero (نام، تخصص، دکمه تماس)، درباره من، نمونه‌کارها (۶ کارت)، مهارت‌ها، تماس.\n\nسبک: مینیمال گرم. پس‌زمینه #FAF6F0، متن #3B2F2F، تأکید #E8743B.\n\nالزامات بسیار مهم: خروجی فقط یک فایل HTML کامل و مستقل باشد. از React، Next.js، Vue یا هیچ فریم‌ورک دیگری استفاده نکن. CSS را داخل همان فایل یا با Tailwind از CDN بنویس. صفحه راست‌به‌چپ (RTL) و فارسی و موبایل‌فرست باشد. فقط کد فایل را بده، بدون توضیح اضافه.', 'Your role: front-end developer who writes clean, simple code.\n\nBuild a complete résumé page for "Kaarbar", a graphic designer.\n\nSections: Hero (name, specialty, contact button), About me, Portfolio (6 cards), Skills, Contact.\n\nStyle: warm minimal. Background #FAF6F0, text #3B2F2F, accent #E8743B.\n\nVery important requirements: output only ONE complete, standalone HTML file. Do not use React, Next.js, Vue or any framework. Write CSS inside the same file or use Tailwind from a CDN. The page must be RTL, Persian and mobile-first. Give only the file code, no extra explanation.') },
      { k: 'h', t: L('اضافه کردن بخش بعدی', 'Adding the next section') },
      { k: 'prompt', title: L('پرامپت افزودن بخش', 'Add-a-section prompt'), t: L('این کد HTML را پایه قرار بده. فقط بخش [نام بخش] را اضافه/اصلاح کن و بقیه را دقیقاً حفظ کن. دوباره کل فایل HTML کامل را برگردان.', 'Use this HTML code as the base. Only add/fix the [section name] section and keep everything else exactly. Return the complete HTML file again.') },
      { k: 'ol', items: [
        L('اول Hero، بعد «درباره من» و «مهارت‌ها»، بعد «نمونه‌کارها»، آخر «تماس».', 'First Hero, then About and Skills, then Portfolio, finally Contact.'),
        L('هر بار کد کامل جدید را در index.html (تب فایل‌ها) جایگزین کنید و ذخیره کنید.', 'Each time replace index.html (Files tab) with the new complete code and save.'),
        L('در «پیش‌نمایش» ببینید درست کار می‌کند. اگر خوب بود، یک نسخه بگیرید.', 'Check it in "Preview". If good, take a snapshot.'),
      ] },
      { k: 'action', id: 'goto:files', label: L('برو به فایل‌ها', 'Go to Files') },
    ],
  },
  {
    id: 'p4', module: 'm2', minutes: 30,
    title: L('مرحله ۴ — بازبینی و اصلاح', 'Step 4 — Review and fix'),
    summary: L('مثل بازدیدکننده تست کنید؛ هر بار یک اصلاح.', 'Test like a visitor; one fix at a time.'),
    blocks: [
      { k: 'check', items: [
        L('روی موبایل (یا پنجره کوچک) خوانا است؟', 'Readable on mobile (or a small window)?'),
        L('دکمه تماس کار می‌کند؟', 'Does the contact button work?'),
        L('تصاویر نمایش داده می‌شوند؟', 'Do images display?'),
        L('لینک‌ها باز می‌شوند؟', 'Do links open?'),
        L('رنگ‌ها و فونت مطابق تصمیم شماست؟', 'Do colours and font match your decisions?'),
      ] },
      { k: 'ol', items: [
        L('قبل از هر اصلاح مهم: در تب «نسخه‌ها» یک نسخه بگیرید.', 'Before every important fix: take a snapshot in the Versions tab.'),
        L('فقط یک مشکل را در هر نوبت به AI بدهید.', 'Give the AI only one problem per turn.'),
        L('بعد از دریافت کد: ذخیره، پیش‌نمایش، و دوباره همه موارد بالا.', 'After receiving code: save, preview and re-check everything above.'),
      ] },
      { k: 'prompt', title: L('پرامپت مرحله ۴', 'Step 4 prompt'), t: L('این نسخه HTML را پایه قرار بده و فقط این تغییر را اعمال کن: [مشکل را بنویس]. بقیه را حفظ کن و کل فایل اصلاح‌شده را برگردان.', 'Use this HTML version as the base and apply only this change: [describe the problem]. Keep everything else and return the whole corrected file.') },
      { k: 'action', id: 'goto:preview', label: L('برو به پیش‌نمایش', 'Go to Preview') },
    ],
  },
  {
    id: 'p5', module: 'm2', minutes: 20,
    title: L('مرحله ۵ — آنلاین‌سازی', 'Step 5 — Go online'),
    summary: L('ZIP، Netlify یا Cloudflare، و تست روی موبایل.', 'ZIP, Netlify or Cloudflare, and a mobile test.'),
    blocks: [
      { k: 'ol', items: [
        L('در تب «انتشار» همه موارد آمادگی را سبز کنید.', 'Make every readiness item green in the Publish tab.'),
        L('«دریافت ZIP» را بزنید و فایل را از حالت فشرده خارج کنید.', 'Click "Export ZIP" and unzip the file.'),
        L('اگر تصویر واقعی دارید، کنار index.html در همان پوشه بگذارید.', 'If you have real images, put them next to index.html in that folder.'),
        L('پوشه را در Netlify Drop یا Cloudflare Pages آپلود کنید.', 'Upload the folder to Netlify Drop or Cloudflare Pages.'),
        L('لینک را روی موبایل باز کنید، همه چیز را دوباره چک کنید و برای یک دوست بفرستید.', 'Open the link on mobile, re-check everything and send it to a friend.'),
      ] },
      { k: 'prompt', title: L('پرامپت مرحله ۵ (راهنمای انتشار)', 'Step 5 prompt (publishing guide)'), t: L('نقش تو: راهنمای صبور برای مبتدی مطلق.\n\nیک فایل index.html دارم و می‌خواهم رایگان روی Cloudflare Pages (یا Netlify) آنلاین کنم. فرض کن تا حالا این کار را نکرده‌ام. قدم‌به‌قدم با نام دقیق دکمه‌ها راهنمایی کن.', 'Your role: patient guide for an absolute beginner.\n\nI have an index.html file and want to put it online for free on Cloudflare Pages (or Netlify). Assume I have never done this. Guide me step by step with the exact button names.') },
      { k: 'warn', t: L('اگر ZIP را از حالت فشرده خارج نکنید یا فایل index.html داخل یک پوشه تو در تو باشد، سرویس‌ها خطای ۴۰۴ می‌دهند.', 'If you do not unzip, or index.html is inside a nested folder, the services will give a 404.') },
      { k: 'table', head: [L('نشانه', 'Symptom'), L('برگردید به', 'Go back to')], rows: [
        [L('نمی‌دانم دقیقاً چه می‌خواهم', 'I do not know exactly what I want'), L('مرحله ۱', 'Step 1')],
        [L('ظاهر سایت ناجور است', 'The look is off'), L('مرحله ۲', 'Step 2')],
        [L('یک بخش اشتباه ساخته شده', 'A section was built wrong'), L('مرحله ۳', 'Step 3')],
        [L('بعد از آنلاین شدن ایراد دیدم', 'I found a bug after going online'), L('مرحله ۴ و دوباره ۵', 'Step 4 then 5 again')],
      ] },
      { k: 'action', id: 'goto:publish', label: L('برو به انتشار', 'Go to Publish') },
    ],
  },

  // ───────────── M3 ─────────────
  {
    id: 'f-diagnose', module: 'm3', minutes: 6,
    title: L('تشخیص اولیه: چه شد و از کجا شروع کنم؟', 'First diagnosis: what happened and where do I start?'),
    summary: L('جدول علائم، علت‌های محتمل و اولین اقدام.', 'Symptoms, likely causes and the first action.'),
    blocks: [
      { k: 'table', head: [L('چیزی که می‌بینید', 'What you see'), L('علت محتمل', 'Likely cause'), L('اولین اقدام', 'First action')], rows: [
        [L('صفحه سفید', 'Blank page'), L('خطای کد، مسیر اشتباه، شبکه', 'Code error, wrong path, network'), L('Console را باز کنید', 'Open the Console')],
        [L('تصویر نمی‌آید', 'Image missing'), L('نام فایل غلط یا فایل موجود نیست', 'Wrong file name or file missing'), L('نام فایل و پوشه را چک کنید', 'Check file and folder names')],
        [L('در موبایل به‌هم‌ریخته', 'Broken on mobile'), L('مشکل ریسپانسیو', 'Responsive problem'), L('اسکرین‌شات به AI بدهید', 'Give the AI a screenshot')],
        [L('404 / Not Found', '404 / Not Found'), L('نام فایل، ساختار پوشه، تنظیمات سرویس', 'File name, folder structure, service settings'), L('نام و محل index.html', 'Name and location of index.html')],
        [L('نسخه قدیمی', 'Old version showing'), L('کش مرورگر یا آپلود نشدن', 'Browser cache or failed upload'), L('Ctrl+Shift+R و بررسی deployment', 'Ctrl+Shift+R and check the deployment')],
        [L('فایل index.html.txt شده', 'File became index.html.txt'), L('پسوند مخفی ویندوز', 'Hidden Windows extension'), L('نمایش پسوند فایل‌ها و تغییر نام', 'Show file extensions and rename')],
        [L('دکمه تماس کار نمی‌کند', 'Contact button does nothing'), L('لینک mailto: ناقص یا بسته‌بودن sandbox', 'Broken mailto: link or sandbox limits'), L('روی لینک آنلاین واقعی تست کنید', 'Test on the real online link')],
        [L('فونت فارسی عوض شده', 'Persian font changed'), L('فونت از اینترنت لود نشده', 'Font not loaded from the internet'), L('اتصال و نام فونت را بررسی کنید', 'Check connection and font name')],
      ] },
      { k: 'tip', t: L('همیشه از «ساده‌ترین علت» شروع کنید: نام فایل، ذخیره‌نشدن، کش.', 'Always start with the simplest cause: file name, unsaved change, cache.') },
    ],
  },
  {
    id: 'f-console', module: 'm3', minutes: 5,
    title: L('گرفتن پیام خطا (Console)', 'Capturing the error message (Console)'),
    summary: L('چطور خطای مرورگر را ببینید و به AI بدهید.', 'How to see the browser error and hand it to the AI.'),
    blocks: [
      { k: 'ol', items: [
        L('در Chrome کلید F12 (مک: Cmd+Option+I) را بزنید.', 'In Chrome press F12 (Mac: Cmd+Option+I).'),
        L('تب Console را باز کنید.', 'Open the Console tab.'),
        L('خطوط قرمز را کپی یا اسکرین‌شات کنید.', 'Copy or screenshot the red lines.'),
        L('برای اسکرین‌شات موبایل: در همان پنل، آیکون گوشی (Device Toolbar) را بزنید.', 'For a mobile screenshot: in the same panel click the phone icon (Device Toolbar).'),
      ] },
      { k: 'tip', t: L('نبود خطای قرمز به معنی سالم بودن کامل نیست. لینک خراب یا متن اشتباه ممکن است بدون خطای فنی ظاهر شوند.', 'No red errors does not mean everything is fine. Broken links or wrong content may appear without a technical error.') },
    ],
  },
  {
    id: 'f-fix', module: 'm3', minutes: 6,
    title: L('تحویل مشکل به AI و قوانین طلایی', 'Handing the problem to AI and the golden rules'),
    summary: L('قالب دیباگ و چهار قانون که هر بار نجاتتان می‌دهد.', 'The debugging template and four rules that save you every time.'),
    blocks: [
      { k: 'ol', items: [
        L('نسخه فعلی را به‌عنوان یک «نسخه» ذخیره کنید.', 'Save the current state as a snapshot.'),
        L('فقط یک مشکل را در هر نوبت بدهید.', 'Give only one problem per turn.'),
        L('کد جدید را اول در پیش‌نمایش تست کنید، بعد منتشر کنید.', 'Test new code in Preview first, then publish.'),
      ] },
      { k: 'prompt', title: L('پرامپت دیباگ', 'Debug prompt'), t: L('نقش تو: متخصص دیباگ رابط کاربری.\n\nمن برنامه‌نویس نیستم. مشکل: [چه می‌خواستم / چه اتفاقی افتاد].\n\nپیام Console: [متن یا توضیح اسکرین‌شات].\n\nکد فعلی index.html: [کد کامل].\n\nلطفاً: ۱) مشکل را ساده توضیح بده. ۲) کل فایل HTML اصلاح‌شده را بده. ۳) فقط همان بخش را عوض کن.', 'Your role: UI debugging specialist.\n\nI am not a programmer. Problem: [what I wanted / what happened].\n\nConsole message: [text or screenshot description].\n\nCurrent index.html code: [full code].\n\nPlease: 1) explain the problem simply. 2) give the whole corrected HTML file. 3) change only that part.') },
      { k: 'h', t: L('قوانین طلایی', 'Golden rules') },
      { k: 'ul', items: [
        L('هر بار فقط یک مشکل.', 'One problem at a time.'),
        L('همیشه نسخه سالم را نگه دارید.', 'Always keep a good version.'),
        L('اگر دو بار حل نشد، AI را عوض کنید.', 'If it fails twice, switch AI.'),
        L('کد را کامل بدهید و کامل بگیرید.', 'Give the code in full and get it back in full.'),
      ] },
    ],
  },

  // ───────────── M4 ─────────────
  {
    id: 'l-privacy', module: 'm4', minutes: 4,
    title: L('حریم خصوصی و نکات مهم', 'Privacy and important notes'),
    summary: L('چه چیزی را هرگز به AI یا سایت نمی‌دهیم.', 'What we never give to an AI or put on a site.'),
    blocks: [
      { k: 'ul', items: [
        L('رمز، کلید دسترسی و اطلاعات حساس را در پرامپت نگذارید.', 'Never put passwords, access keys or sensitive data in prompts.'),
        L('خروجی AI را قبل از انتشار بخوانید و بررسی کنید.', 'Read and verify AI output before publishing.'),
        L('فقط از تصاویر دارای مجوز یا متعلق به خودتان استفاده کنید.', 'Use only images you own or are licensed to use.'),
        L('صحت ایمیل، شماره و لینک‌ها را قبل از عمومی کردن چک کنید؛ هرچه آنلاین شود دیده می‌شود.', 'Verify emails, phone numbers and links before going public; everything online is visible.'),
        L('راه‌ساز داده را فقط در مرورگر شما نگه می‌دارد؛ پشتیبان بگیرید.', 'Rahsaz stores data only in your browser; keep backups.'),
      ] },
    ],
  },
  {
    id: 'l-final', module: 'm4', minutes: 3,
    title: L('چک‌لیست نهایی', 'Final checklist'),
    summary: L('قبل از اینکه بگویید «تمام شد».', 'Before you say "done".'),
    blocks: [
      { k: 'check', items: [
        L('حساب‌های ضروری ساخته شد', 'Essential accounts created'),
        L('پوشه پروژه و دفتر کنترل آماده است', 'Project folder and control log ready'),
        L('مشخصات نوشته و تأیید شد', 'Spec written and approved'),
        L('سبک بصری انتخاب و ثبت شد', 'Visual style chosen and recorded'),
        L('فایل index.html ساخته شد و پیش‌نمایش درست است', 'index.html built and preview looks right'),
        L('دکمه تماس، تصاویر و لینک‌ها کار می‌کنند', 'Contact button, images and links work'),
        L('نمایش موبایل بررسی شد', 'Mobile view checked'),
        L('سایت آنلاین شد و لینک برای یک دوست فرستاده شد', 'Site is online and the link was sent to a friend'),
      ] },
    ],
  },
  {
    id: 'l-next', module: 'm4', minutes: 4,
    title: L('گام بعدی و تمرین مستقل', 'Next step and independent practice'),
    summary: L('پروژه دوم را بدون کپی‌کردن قدم‌به‌قدم بسازید.', 'Build the second project without copying step by step.'),
    blocks: [
      { k: 'p', t: L('پروژه دوم را با همین روش بسازید (مثلاً صفحه معرفی یک کسب‌وکار کوچک). هر بار یک قابلیت جدید اضافه کنید.', 'Build a second project with the same method (e.g. a small business landing page). Add one new feature each time.') },
      { k: 'p', t: L('تمرین مستقل: بدون کپی‌کردن قدم‌به‌قدم سایت «کاربر»، یک صفحه معرفی کوتاه برای خودتان بسازید. هدف این است که روش را برای پروژه تازه به کار ببرید.', 'Independent practice: without copying the sample step by step, build a short intro page for yourself. The goal is to apply the method to a fresh project.') },
      { k: 'h', t: L('ایده‌هایی برای هر بار یک قابلیت جدید', 'Ideas for one new feature at a time') },
      { k: 'ul', items: [
        L('فرم تماس (با سرویس رایگان فرم)', 'A contact form (via a free form service)'),
        L('گالری تصاویر با نمایش بزرگ', 'Image gallery with lightbox'),
        L('حالت تیره/روشن', 'Dark/light mode'),
        L('نسخه انگلیسی سایت', 'English version of the site'),
        L('بهینه‌سازی برای جستجو (عنوان و توضیح صفحه)', 'Search optimisation (page title and description)'),
        L('اتصال دامنه اختصاصی', 'Connecting a custom domain'),
      ] },
      { k: 'p', t: L('سخن پایانی: این مسیر تمرین مدیریت پروژه با کمک هوش مصنوعی است، حتی وقتی مشکل پیش می‌آید. شروع کنید. اولین لینک را بسازید.', 'Closing words: this path is practice in managing a project with AI, even when problems appear. Start. Build your first link.') },
      { k: 'action', id: 'newProject', label: L('پروژه جدید بسازم', 'Start a new project') },
    ],
  },
]

// ───────────── Prompt bank ─────────────
function promptOf(lessonId: string): L {
  const b = LESSONS.find(l => l.id === lessonId)?.blocks.find(x => x.k === 'prompt')
  return b && b.k === 'prompt' ? b.t : L('', '')
}

export interface BankPrompt { id: string; group: L; title: L; when: L; text: L }

export const PROMPT_BANK: BankPrompt[] = [
  { id: 'b1', group: L('مراحل اصلی', 'Main steps'), title: L('۱. تعریف نیاز', '1. Define the need'), when: L('شروع پروژه', 'Project start'),
    text: promptOf('p1') },
  { id: 'b2', group: L('مراحل اصلی', 'Main steps'), title: L('۲. طراحی ظاهر', '2. Visual design'), when: L('بعد از تأیید مشخصات', 'After spec approval'),
    text: promptOf('p2') },
  { id: 'b3', group: L('مراحل اصلی', 'Main steps'), title: L('۳. ساخت فایل HTML', '3. Build the HTML file'), when: L('بعد از انتخاب سبک', 'After choosing a style'),
    text: promptOf('p3') },
  { id: 'b3b', group: L('مراحل اصلی', 'Main steps'), title: L('افزودن یک بخش', 'Add a section'), when: L('هر بار که بخش تازه می‌خواهید', 'Whenever you want a new section'),
    text: L('این کد HTML را پایه قرار بده. فقط بخش [نام بخش] را اضافه/اصلاح کن و بقیه را دقیقاً حفظ کن. دوباره کل فایل HTML کامل را برگردان.', 'Use this HTML code as the base. Only add/fix the [section name] section and keep everything else exactly. Return the complete HTML file again.') },
  { id: 'b4', group: L('مراحل اصلی', 'Main steps'), title: L('۴. اصلاح یک مشکل', '4. Fix one problem'), when: L('هر ایرادی در بازبینی', 'Any issue found in review'),
    text: promptOf('p4') },
  { id: 'b5', group: L('مراحل اصلی', 'Main steps'), title: L('۵. راهنمای انتشار', '5. Publishing guide'), when: L('قبل از آنلاین‌سازی', 'Before going online'),
    text: promptOf('p5') },
  { id: 'd1', group: L('عیب‌یابی', 'Debugging'), title: L('دیباگ با پیام خطا', 'Debug with an error message'), when: L('صفحه سفید یا خطای Console', 'Blank page or Console error'),
    text: promptOf('f-fix') },
  { id: 'd2', group: L('عیب‌یابی', 'Debugging'), title: L('اصلاح موبایل', 'Fix the mobile layout'), when: L('نمایش موبایل به‌هم‌ریخته است', 'Mobile layout is broken'),
    text: L('این کد HTML را پایه قرار بده. در نمایش موبایل (عرض ۳۷۵ پیکسل) این مشکل را دارم: [توضیح یا اسکرین‌شات]. فقط CSS مربوط به موبایل را اصلاح کن (با media query)، ظاهر دسکتاپ را تغییر نده و کل فایل را برگردان.', 'Use this HTML as the base. On mobile (375px wide) I have this problem: [description or screenshot]. Fix only the mobile CSS (with a media query), do not change the desktop look, and return the whole file.') },
  { id: 'd3', group: L('عیب‌یابی', 'Debugging'), title: L('تبدیل پروژه چندفایلی به یک فایل', 'Convert a multi-file project to one file'), when: L('AI پروژه React/Next داد', 'The AI gave a React/Next project'),
    text: L('این پروژه را به یک فایل index.html مستقل تبدیل کن؛ بدون React، Next.js یا ابزار build. CSS و JavaScript را داخل همان فایل بگذار و ظاهر را تا حد امکان حفظ کن. اگر چیزی قابل تبدیل نیست، فهرستش را بگو.', 'Convert this project into one standalone index.html: no React, Next.js or build tools. Put CSS and JavaScript in the same file and keep the look as close as possible. If something cannot be converted, list it.') },
  { id: 'r1', group: L('بازبینی و کیفیت', 'Review and quality'), title: L('بازبینی کلی کد', 'General code review'), when: L('قبل از انتشار', 'Before publishing'),
    text: L('نقش تو: بازبین ارشد فرانت‌اند. این index.html را بررسی کن و فهرست کن: ۱) خطاها یا لینک‌های شکسته ۲) مشکلات موبایل ۳) نکات دسترس‌پذیری (alt تصاویر، کنتراست، اندازه دکمه‌ها) ۴) مشکلات امنیتی ساده. هنوز کد را تغییر نده؛ فقط فهرست اولویت‌دار بده.\n\n[کد کامل]', 'Your role: senior front-end reviewer. Review this index.html and list: 1) errors or broken links 2) mobile issues 3) accessibility issues (image alt, contrast, button size) 4) simple security issues. Do not change the code yet; just give a prioritised list.\n\n[full code]') },
  { id: 'r2', group: L('بازبینی و کیفیت', 'Review and quality'), title: L('نظر دوم از AI دیگر', 'Second opinion from another AI'), when: L('AI اول دو بار نتوانست', 'The first AI failed twice'),
    text: L('یک AI دیگر دو بار نتوانست این مشکل را حل کند: [شرح مشکل]. راه‌حل‌های قبلی که جواب نداد: [شرح]. کد فعلی: [کد کامل]. علت را از صفر بررسی کن و اصلاح‌شده را کامل بده.', 'Another AI failed twice to solve this problem: [problem]. Earlier attempts that did not work: [description]. Current code: [full code]. Investigate the cause from scratch and give the corrected file in full.') },
  { id: 'c1', group: L('محتوا و سئو', 'Content and SEO'), title: L('نوشتن متن بخش درباره من', 'Write the About section copy'), when: L('متن ندارید', 'You have no copy'),
    text: L('من [تخصص] هستم با [سال] سال تجربه. برای بخش «درباره من» سایتم ۳ نسخه متن کوتاه (حداکثر ۴۰ کلمه) به فارسی روان، صمیمی ولی حرفه‌ای بنویس. هیچ ادعا یا عدد ساختگی نیاور.', 'I am a [specialty] with [years] years of experience. Write 3 short versions (max 40 words) of my About section copy in a friendly but professional tone. Do not invent claims or numbers.') },
  { id: 'c2', group: L('محتوا و سئو', 'Content and SEO'), title: L('عنوان و توضیح برای گوگل', 'Title and description for search'), when: L('قبل از انتشار', 'Before publishing'),
    text: L('برای این سایت یک تگ title (حداکثر ۶۰ کاراکتر) و meta description (حداکثر ۱۵۵ کاراکتر) فارسی بنویس و فقط خطوط HTML مربوط را بده تا در head قرار دهم.\n\nمشخصات: [spec]', 'Write a title tag (max 60 chars) and meta description (max 155 chars) for this site and give only the HTML lines to place in head.\n\nSpec: [spec]') },
]

// ───────────── Glossary ─────────────
export interface Term { id: string; term: string; def: L }
export const GLOSSARY: Term[] = [
  { id: 'g1', term: 'HTML', def: L('زبان ساختار صفحه: مشخص می‌کند چه بخش‌ها، متن‌ها و تصاویری وجود دارد.', 'The language of page structure: defines which sections, texts and images exist.') },
  { id: 'g2', term: 'CSS', def: L('زبان ظاهر: رنگ، فونت، فاصله و چیدمان.', 'The language of appearance: colour, font, spacing and layout.') },
  { id: 'g3', term: 'JavaScript', def: L('زبان رفتار: کلیک، منو، انیمیشن و فرم‌های هوشمند.', 'The language of behaviour: clicks, menus, animations and smart forms.') },
  { id: 'g4', term: 'RTL', def: L('راست‌به‌چپ؛ جهت متن فارسی و عربی (dir="rtl").', 'Right-to-left; the direction of Persian and Arabic (dir="rtl").') },
  { id: 'g5', term: 'Responsive / ریسپانسیو', def: L('طراحی‌ای که با اندازه صفحه (موبایل، تبلت، دسکتاپ) خودش را تنظیم می‌کند.', 'A design that adapts to screen size (mobile, tablet, desktop).') },
  { id: 'g6', term: 'Prompt / پرامپت', def: L('متنی که برای هوش مصنوعی می‌نویسید تا کاری را انجام دهد.', 'The text you write for an AI to make it do something.') },
  { id: 'g7', term: 'Spec / مشخصات', def: L('سندی که دقیقاً می‌گوید سایت چه بخش‌ها و ویژگی‌هایی دارد.', 'A document stating exactly which sections and features the site has.') },
  { id: 'g8', term: 'Snapshot / نسخه', def: L('عکسی از همه فایل‌ها در یک لحظه؛ برای بازگشت در صورت خرابی.', 'A picture of all files at one moment, used to roll back if something breaks.') },
  { id: 'g9', term: 'Console', def: L('پنل ابزار توسعه مرورگر که خطاها را نشان می‌دهد (F12).', 'The browser developer panel that shows errors (F12).') },
  { id: 'g10', term: 'Hosting / میزبانی', def: L('جایی که فایل‌های سایت قرار می‌گیرند تا دیگران بتوانند باز کنند (Netlify، Cloudflare Pages…).', 'The place where site files live so others can open them (Netlify, Cloudflare Pages…).') },
  { id: 'g11', term: 'Deploy / انتشار', def: L('فرایند آپلود نسخه جدید روی میزبانی.', 'The process of uploading a new version to hosting.') },
  { id: 'g12', term: 'Domain / دامنه', def: L('آدرس خوانا مثل example.com که به سایت شما اشاره می‌کند.', 'A readable address like example.com that points to your site.') },
  { id: 'g13', term: 'Static site / سایت ایستا', def: L('سایتی که فقط فایل‌های آماده (HTML/CSS/JS) است و به سرور پردازشگر نیاز ندارد؛ ساده‌ترین و ارزان‌ترین نوع.', 'A site made of ready files (HTML/CSS/JS) with no server-side processing; the simplest and cheapest kind.') },
  { id: 'g14', term: 'Cache / کش', def: L('نسخه ذخیره‌شده قدیمی که مرورگر نگه می‌دارد؛ با Ctrl+Shift+R پاک می‌شود.', 'An old saved copy kept by the browser; Ctrl+Shift+R refreshes it.') },
  { id: 'g15', term: '404', def: L('خطای «صفحه پیدا نشد»؛ معمولاً نام یا مسیر فایل اشتباه است.', 'A "page not found" error; usually a wrong file name or path.') },
  { id: 'g16', term: 'React / Next.js', def: L('فریم‌ورک‌هایی برای پروژه‌های بزرگ که فرایند build لازم دارند؛ برای شروع لازم نیست.', 'Frameworks for larger projects requiring a build process; not needed to start.') },
  { id: 'g17', term: 'Tailwind CSS', def: L('کتابخانه‌ای برای نوشتن CSS با کلاس‌های آماده؛ می‌تواند از CDN بارگذاری شود.', 'A library for writing CSS with ready-made classes; can be loaded from a CDN.') },
  { id: 'g18', term: 'Sandbox', def: L('محیط ایزوله که کد را بدون دسترسی به بقیه سیستم اجرا می‌کند؛ پیش‌نمایش راه‌ساز در آن اجرا می‌شود.', 'An isolated environment that runs code without access to the rest of the system; the Rahsaz preview runs in one.') },
  { id: 'g19', term: 'API key / کلید API', def: L('رمز دسترسی به یک سرویس؛ هرگز در پرامپت یا کد عمومی نگذارید.', 'An access secret for a service; never put it in a prompt or public code.') },
  { id: 'g20', term: 'mailto:', def: L('لینکی که برنامه ایمیل را باز می‌کند، مثل href="mailto:you@example.com".', 'A link that opens the mail app, like href="mailto:you@example.com".') },
]
