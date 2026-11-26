# معماری راه‌ساز v0.14.0 (بسته A — فاز ۲ اولیه)

## ساختار
```
src/
  app/                 # (آینده) پوسته و providers
  core/
    storage/           # localStorage + migration
    zip/               # export ZIP
    uid.ts
  modules/
    academy/
    architecture/
    file-manager/
    planning/
    preview/
    projects/
    requirements/
    workspace/
  shared/
    types/
    hooks/useProjects.ts
  data/
  App.tsx              # هنوز orchestrator؛ در حال کاهش مسئولیت
```

## اصول
- منطق تجاری engines بدون وابستگی به React
- دسترسی persistence از طریق storage / hooks
- سازگاری عقب‌رو با shimهای `src/storage.ts` و مشابه

## باقی‌مانده فاز ۲
- استخراج کامل ProjectWorkspace از App.tsx
- providers و مدیریت خطای مشترک
