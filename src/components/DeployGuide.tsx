import { useState } from 'react';
import {
  Globe, Server, Cloud, Terminal, FolderOpen, Upload,
  ChevronDown, ChevronUp, Copy, CheckCircle, X,
  Shield, Zap, Package, HelpCircle
} from 'lucide-react';

interface DeployGuideProps {
  onClose: () => void;
}

type DeployMethod = 'static' | 'vercel' | 'netlify' | 'github' | 'hosting';

export default function DeployGuide({ onClose }: DeployGuideProps) {
  const [activeMethod, setActiveMethod] = useState<DeployMethod>('static');
  const [expandedSection, setExpandedSection] = useState<number | null>(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const methods: { key: DeployMethod; label: string; icon: React.ReactNode; color: string }[] = [
    { key: 'static', label: 'هاست', icon: <Server size={16} />, color: 'from-blue-500 to-cyan-500' },
    { key: 'vercel', label: 'Vercel', icon: <Cloud size={16} />, color: 'from-gray-500 to-gray-700' },
    { key: 'netlify', label: 'Netlify', icon: <Globe size={16} />, color: 'from-teal-500 to-green-500' },
    { key: 'github', label: 'GitHub', icon: <Package size={16} />, color: 'from-purple-500 to-pink-500' },
    { key: 'hosting', label: 'cPanel', icon: <FolderOpen size={16} />, color: 'from-orange-500 to-red-500' },
  ];

  const CodeBlock = ({ code, index }: { code: string; index: number }) => (
    <div className="relative group mt-2">
      <pre className="bg-gray-900/90 border border-gray-700 rounded-lg sm:rounded-xl p-3 sm:p-4 text-[11px] sm:text-sm text-green-300 overflow-x-auto code-editor" dir="ltr">
        {code}
      </pre>
      <button
        onClick={() => copyToClipboard(code, index)}
        className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 p-1.5 sm:p-2 bg-gray-700/80 rounded-md sm:rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-600 active:opacity-100"
      >
        {copiedIndex === index ? <CheckCircle size={12} className="text-green-400" /> : <Copy size={12} className="text-gray-300" />}
      </button>
    </div>
  );

  const AccordionItem = ({ title, children, index }: { title: string; children: React.ReactNode; index: number }) => (
    <div className="border border-gray-700/50 rounded-lg sm:rounded-xl overflow-hidden">
      <button
        onClick={() => setExpandedSection(expandedSection === index ? null : index)}
        className="w-full flex items-center justify-between p-3 sm:p-4 bg-gray-800/30 hover:bg-gray-800/50 transition text-right"
      >
        <span className="font-medium text-xs sm:text-sm">{title}</span>
        {expandedSection === index ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {expandedSection === index && (
        <div className="p-3 sm:p-4 border-t border-gray-700/50 text-xs sm:text-sm text-gray-300 space-y-2 sm:space-y-3">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-3xl max-h-[92vh] sm:max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700/50">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg sm:rounded-xl shrink-0">
              <HelpCircle size={18} className="sm:hidden" />
              <HelpCircle size={24} className="hidden sm:block" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-xl font-bold truncate">راهنمای استقرار</h2>
              <p className="text-[10px] sm:text-xs text-gray-400 truncate">نحوه قرار دادن برنامه روی وب‌سایت شما</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition shrink-0 active:scale-90"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(92vh-80px)] sm:max-h-[calc(90vh-140px)] p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Quick Start */}
          <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl sm:rounded-2xl p-3 sm:p-5">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <Zap className="text-yellow-400 shrink-0" size={16} />
              <h3 className="font-bold text-sm sm:text-base text-indigo-300">شروع سریع</h3>
            </div>
            <p className="text-xs sm:text-sm text-gray-300 mb-2 sm:mb-3">
              بعد از بیلد گرفتن از پروژه، فایل‌های پوشه <code className="bg-gray-700 px-1.5 py-0.5 rounded text-indigo-300 text-[10px] sm:text-xs" dir="ltr">dist/</code> آماده استفاده هستند. 
              کافیست محتویات این پوشه را روی هاست خود آپلود کنید.
            </p>
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-400">
              <Shield className="text-green-400 shrink-0" size={12} />
              <span>این برنامه کاملاً سمت کلاینت اجرا می‌شود و نیازی به سرور بک‌اند ندارد</span>
            </div>
          </div>

          {/* Method Tabs */}
          <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
            {methods.map((method) => (
              <button
                key={method.key}
                onClick={() => setActiveMethod(method.key)}
                className={`flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
                  activeMethod === method.key
                    ? `bg-gradient-to-r ${method.color} text-white shadow-lg`
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
                }`}
              >
                {method.icon}
                {method.label}
              </button>
            ))}
          </div>

          {/* Method Content */}
          <div className="space-y-3 sm:space-y-4">
            {/* Static Hosting */}
            {activeMethod === 'static' && (
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2 text-blue-300">
                  <Server size={18} />
                  <h3 className="font-bold text-sm sm:text-lg">استقرار روی هاست معمولی</h3>
                </div>

                <AccordionItem title="مرحله ۱: بیلد گرفتن از پروژه" index={0}>
                  <p>ابتدا باید پروژه را بیلد بگیرید:</p>
                  <CodeBlock code={`# در ترمینال، داخل پوشه پروژه:
npm run build

# فایل‌های خروجی در پوشه dist/ قرار می‌گیرند`} index={0} />
                </AccordionItem>

                <AccordionItem title="مرحله ۲: آپلود فایل‌ها روی هاست" index={1}>
                  <p>تمام محتویات پوشه <code className="bg-gray-700 px-1.5 py-0.5 rounded" dir="ltr">dist/</code> را آپلود کنید:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-400">
                    <li>از طریق File Manager هاستینگ</li>
                    <li>یا با FTP (FileZilla)</li>
                    <li>فایل‌ها را در public_html قرار دهید</li>
                  </ul>
                  <CodeBlock code={`public_html/
├── index.html
├── assets/
│   ├── index-xxxxx.js
│   └── index-xxxxx.css`} index={1} />
                </AccordionItem>

                <AccordionItem title="مرحله ۳: تنظیمات Apache" index={2}>
                  <p>فایل <code className="bg-gray-700 px-1.5 py-0.5 rounded" dir="ltr">.htaccess</code> زیر را بسازید:</p>
                  <CodeBlock code={`# .htaccess
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>

<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css application/javascript
</IfModule>`} index={2} />
                </AccordionItem>
              </div>
            )}

            {/* Vercel */}
            {activeMethod === 'vercel' && (
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2 text-gray-300">
                  <Cloud size={18} />
                  <h3 className="font-bold text-sm sm:text-lg">استقرار روی Vercel</h3>
                </div>

                <AccordionItem title="مرحله ۱: نصب Vercel CLI" index={3}>
                  <CodeBlock code={`npm install -g vercel`} index={3} />
                </AccordionItem>

                <AccordionItem title="مرحله ۲: استقرار" index={4}>
                  <CodeBlock code={`# داخل پوشه پروژه:
vercel

# برای انتشار نهایی:
vercel --prod`} index={4} />
                </AccordionItem>

                <AccordionItem title="روش جایگزین: از طریق Git" index={5}>
                  <p>کد را روی GitHub پوش کنید، سپس:</p>
                  <ol className="list-decimal list-inside space-y-1 text-gray-400">
                    <li>به vercel.com بروید</li>
                    <li>با GitHub وارد شوید</li>
                    <li>"New Project" را بزنید</li>
                    <li>ریپازیتوری خود را انتخاب کنید</li>
                    <li>Framework Preset: Vite</li>
                    <li>Deploy را بزنید</li>
                  </ol>
                </AccordionItem>
              </div>
            )}

            {/* Netlify */}
            {activeMethod === 'netlify' && (
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2 text-teal-300">
                  <Globe size={18} />
                  <h3 className="font-bold text-sm sm:text-lg">استقرار روی Netlify</h3>
                </div>

                <AccordionItem title="مرحله ۱: نصب Netlify CLI" index={6}>
                  <CodeBlock code={`npm install -g netlify-cli`} index={6} />
                </AccordionItem>

                <AccordionItem title="مرحله ۲: بیلد و استقرار" index={7}>
                  <CodeBlock code={`# بیلد پروژه
npm run build

# استقرار
netlify deploy --prod --dir=dist`} index={7} />
                </AccordionItem>

                <AccordionItem title="روش Drag & Drop (ساده‌ترین)" index={8}>
                  <ol className="list-decimal list-inside space-y-1 text-gray-400">
                    <li>به app.netlify.com/drop بروید</li>
                    <li>پوشه <code className="bg-gray-700 px-1.5 py-0.5 rounded" dir="ltr">dist/</code> را بکشید و رها کنید</li>
                    <li>تمام! سایت شما آنلاین است</li>
                  </ol>
                </AccordionItem>
              </div>
            )}

            {/* GitHub Pages */}
            {activeMethod === 'github' && (
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2 text-purple-300">
                  <Package size={18} />
                  <h3 className="font-bold text-sm sm:text-lg">استقرار روی GitHub Pages</h3>
                </div>

                <AccordionItem title="مرحله ۱: نصب پکیج" index={9}>
                  <CodeBlock code={`npm install -D gh-pages`} index={9} />
                </AccordionItem>

                <AccordionItem title="مرحله ۲: اضافه کردن اسکریپت" index={10}>
                  <p>در <code className="bg-gray-700 px-1.5 py-0.5 rounded" dir="ltr">package.json</code>:</p>
                  <CodeBlock code={`"scripts": {
  "deploy": "npm run build && gh-pages -d dist"
}`} index={10} />
                </AccordionItem>

                <AccordionItem title="مرحله ۳: استقرار" index={11}>
                  <CodeBlock code={`npm run deploy`} index={11} />
                  <p className="mt-2 text-gray-400">آدرس سایت:</p>
                  <code className="block bg-gray-900 p-2 rounded text-indigo-300 text-[10px] sm:text-xs overflow-x-auto" dir="ltr">
                    https://username.github.io/repo-name/
                  </code>
                </AccordionItem>
              </div>
            )}

            {/* cPanel */}
            {activeMethod === 'hosting' && (
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2 text-orange-300">
                  <FolderOpen size={18} />
                  <h3 className="font-bold text-sm sm:text-lg">استقرار روی cPanel</h3>
                </div>

                <AccordionItem title="مرحله ۱: بیلد و زیپ" index={12}>
                  <CodeBlock code={`# بیلد
npm run build

# زیپ کردن (لینوکس/مک)
cd dist && zip -r ../site.zip .`} index={12} />
                </AccordionItem>

                <AccordionItem title="مرحله ۲: آپلود از cPanel" index={13}>
                  <ol className="list-decimal list-inside space-y-1.5 text-gray-400">
                    <li>وارد cPanel شوید</li>
                    <li>File Manager را باز کنید</li>
                    <li>وارد public_html شوید</li>
                    <li>Upload → فایل ZIP</li>
                    <li>Extract کنید</li>
                  </ol>
                </AccordionItem>

                <AccordionItem title="مرحله ۳: آپلود از FTP" index={14}>
                  <CodeBlock code={`Host: your-domain.com
User: FTP username
Pass: FTP password
Port: 21
Path: /public_html/`} index={14} />
                </AccordionItem>
              </div>
            )}
          </div>

          {/* Important Notes */}
          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl sm:rounded-2xl p-3 sm:p-5 space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2 text-yellow-300">
              <Shield size={16} />
              <h3 className="font-bold text-sm sm:text-base">نکات مهم</h3>
            </div>
            <ul className="space-y-1.5 sm:space-y-2 text-[11px] sm:text-sm text-gray-300">
              <li className="flex items-start gap-1.5 sm:gap-2">
                <span className="text-yellow-400 mt-0.5 shrink-0">•</span>
                <span>نیازی به سرور بک‌اند ندارد - کاملاً سمت مرورگر اجرا می‌شود</span>
              </li>
              <li className="flex items-start gap-1.5 sm:gap-2">
                <span className="text-yellow-400 mt-0.5 shrink-0">•</span>
                <span>برای عملکرد بهتر، از HTTPS استفاده کنید</span>
              </li>
              <li className="flex items-start gap-1.5 sm:gap-2">
                <span className="text-yellow-400 mt-0.5 shrink-0">•</span>
                <span>حجم کل: ~۳۰۰ کیلوبایت (فشرده: ~۹۰ کیلوبایت)</span>
              </li>
              <li className="flex items-start gap-1.5 sm:gap-2">
                <span className="text-yellow-400 mt-0.5 shrink-0">•</span>
                <span>فایل APK/AAB روی مرورگر کاربر ساخته می‌شود</span>
              </li>
            </ul>
          </div>

          {/* Embed Code */}
          <div className="bg-gray-800/30 rounded-xl sm:rounded-2xl p-3 sm:p-5 space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2 text-indigo-300">
              <Terminal size={16} />
              <h3 className="font-bold text-sm sm:text-base">قرار دادن در سایت (iframe)</h3>
            </div>
            <p className="text-[11px] sm:text-sm text-gray-400">
              برای قرار دادن در بخشی از سایت فعلی:
            </p>
            <CodeBlock code={`<iframe 
  src="https://your-domain.com/" 
  width="100%" 
  height="800px" 
  frameborder="0"
  style="border-radius: 16px;"
  allow="clipboard-write"
></iframe>`} index={16} />
          </div>
        </div>
      </div>
    </div>
  );
}
