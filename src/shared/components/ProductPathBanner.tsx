/** Package 1 — extracted from App for modular UX */
export default function ProductPathBanner({ isFa }: { isFa: boolean }) {
  return (
    <div className="ai-block" style={{ marginBottom: 16 }}>
      <h3 className="ai-block-title">{isFa ? 'مسیر محصول راه‌ساز' : 'Rahsaz product path'}</h3>
      <p className="ai-hint" style={{ margin: 0 }}>
        {isFa
          ? 'ایده → نیازسنجی → نیازمندی → معماری → برنامه → ساخت فایل → پیش‌نمایش → تست/کیفیت → انتشار'
          : 'Idea → Discovery → Requirements → Architecture → Plan → Files → Preview → Test/QA → Publish'}
      </p>
    </div>
  )
}
