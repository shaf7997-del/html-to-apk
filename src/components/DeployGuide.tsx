import { useState } from 'react';
import {
  Globe, Server, Cloud, Terminal, FolderOpen, Upload,
  ChevronDown, ChevronUp, Copy, CheckCircle, X,
  ExternalLink, Shield, Zap, Package, HelpCircle
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
    { key: 'static', label: 'هاست معمولی', icon: <Server size={18} />, color: 'from-blue-500 to-cyan-500' },
    { key: 'vercel', label: 'Vercel', icon: <Cloud size={18} />, color: 'from-gray-500 to-gray-700' },
    { key: 'netlify', label: 'Netlify', icon: <Globe size={18} />, color: 'from-teal-500 to-green-500' },
    { key: 'github', label: 'GitHub Pages', icon: <Package size={18} />, color: 'from-purple-500 to-pink-500' },
    { key: 'hosting', label: 'cPanel / DirectAdmin', icon: <FolderOpen size={18} />, color: 'from-orange-500 to-red-500' },
  ];

  const CodeBlock = ({ code, index }: { code: string; index: number }) => (
    <div className="relative group mt-2">
      <pre className="bg-gray-900/90 border border-gray-700 rounded-xl p-4 text-sm text-green-300 overflow-x-auto code-editor" dir="ltr">
        {code}
      </pre>
      <button
        onClick={() => copyToClipboard(code, index)}
        className="absolute top-2 left-2 p-2 bg-gray-700/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-600"
      >
        {copiedIndex === index ? <CheckCircle size={14} className="text-green-400" /> : <Copy size={14} className="text-gray-300" />}
      </button>
    </div>
  );

  const AccordionItem = ({ title, children, index }: { title: string; children: React.ReactNode; index: number }) => (
    <div className="border border-gray-700/50 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpandedSection(expandedSection === index ? null : index)}
        className="w-full flex items-center justify-between p-4 bg-gray-800/30 hover:bg-gray-800/50 transition text-right"
      >
        <span className="font-medium text-sm">{title}</span>
        {expandedSection === index ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {expandedSection === index && (
        <div className="p-4 border-t border-gray-700/50 text-sm text-gray-300 space-y-3">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
              <HelpCircle size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">راهنمای استقرار روی سایت</h2>
              <p className="text-xs text-gray-400 mt-1">نحوه قرار دادن برنامه روی وب‌سایت شما</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6 space-y-6">
          {/* Quick Start */}
          <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="text-yellow-400" size={20} />
              <h3 className="font-bold text-indigo-300">شروع سریع</h3>
            </div>
            <p className="text-sm text-gray-300 mb-3">
              بعد از بیلد گرفتن از پروژه، فایل‌های پوشه <code className="bg-gray-700 px-2 py-0.5 rounded text-indigo-300" dir="ltr">dist/</code> آماده استفاده هستند. 
              کافیست محتویات این پوشه را روی هاست خود آپلود کنید.
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Shield className="text-green-400" size={14} />
              <span>این برنامه کاملاً سمت کلاینت اجرا می‌شود و نیازی به سرور بک‌اند ندارد</span>
            </div>
          </div>

          {/* Method Tabs */}
          <div className="flex flex-wrap gap-2">
            {methods.map((method) => (
              <button
                key={method.key}
                onClick={() => setActiveMethod(method.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
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
          <div className="space-y-4">
            {/* Static Hosting */}
            {activeMethod === 'static' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-blue-300">
                  <Server size={20} />
                  <h3 className="font-bold text-lg">استقرار روی هاست معمولی (Static)</h3>
                </div>

                <AccordionItem title="مرحله ۱: بیلد گرفتن از پروژه" index={0}>
                  <p>ابتدا باید پروژه را بیلد بگیرید تا فایل‌های نهایی تولید شوند:</p>
                  <CodeBlock code={`# در ترمینال، داخل پوشه پروژه:
npm run build

# فایل‌های خروجی در پوشه dist/ قرار می‌گیرند`} index={0} />
                </AccordionItem>

                <AccordionItem title="مرحله ۲: آپلود فایل‌ها روی هاست" index={1}>
                  <p>تمام محتویات پوشه <code className="bg-gray-700 px-1.5 py-0.5 rounded" dir="ltr">dist/</code> را روی هاست آپلود کنید:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-400">
                    <li>از طریق File Manager هاستینگ</li>
                    <li>یا با FTP (FileZilla یا ...)</li>
                    <li>فایل‌ها را در ریشه سایت (public_html یا www) قرار دهید</li>
                  </ul>
                  <CodeBlock code={`# ساختار فایل‌ها روی هاست:
public_html/
├── index.html
├── assets/
│   ├── index-xxxxx.js
│   └── index-xxxxx.css
└── (سایر فایل‌ها)`} index={1} />
                </AccordionItem>

                <AccordionItem title="مرحله ۳: تنظیمات نهایی" index={2}>
                  <p>معمولاً نیاز به تنظیم خاصی نیست. اگر از Apache استفاده می‌کنید، فایل <code className="bg-gray-700 px-1.5 py-0.5 rounded" dir="ltr">.htaccess</code> زیر را بسازید:</p>
                  <CodeBlock code={`# .htaccess
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>

# فشرده‌سازی Gzip
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css application/javascript
</IfModule>

# کش مرورگر
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
</IfModule>`} index={2} />
                </AccordionItem>
              </div>
            )}

            {/* Vercel */}
            {activeMethod === 'vercel' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-300">
                  <Cloud size={20} />
                  <h3 className="font-bold text-lg">استقرار روی Vercel</h3>
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
                    <li>به <a href="https://vercel.com" target="_blank" className="text-indigo-400 hover:underline">vercel.com</a> بروید</li>
                    <li>با GitHub وارد شوید</li>
                    <li>دکمه "New Project" را بزنید</li>
                    <li>ریپازیتوری خود را انتخاب کنید</li>
                    <li>Framework Preset را روی "Vite" بگذارید</li>
                    <li>Deploy را بزنید</li>
                  </ol>
                </AccordionItem>
              </div>
            )}

            {/* Netlify */}
            {activeMethod === 'netlify' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-teal-300">
                  <Globe size={20} />
                  <h3 className="font-bold text-lg">استقرار روی Netlify</h3>
                </div>

                <AccordionItem title="مرحله ۱: نصب Netlify CLI" index={6}>
                  <CodeBlock code={`npm install -g netlify-cli`} index={6} />
                </AccordionItem>

                <AccordionItem title="مرحله ۲: بیلد و استقرار" index={7}>
                  <CodeBlock code={`# بیلد پروژه
npm run build

# استقرار روی Netlify
netlify deploy --prod --dir=dist`} index={7} />
                </AccordionItem>

                <AccordionItem title="روش جایگزین: Drag & Drop" index={8}>
                  <p>ساده‌ترین روش:</p>
                  <ol className="list-decimal list-inside space-y-1 text-gray-400">
                    <li>به <a href="https://app.netlify.com/drop" target="_blank" className="text-indigo-400 hover:underline">app.netlify.com/drop</a> بروید</li>
                    <li>پوشه <code className="bg-gray-700 px-1.5 py-0.5 rounded" dir="ltr">dist/</code> را بکشید و رها کنید</li>
                    <li>تمام! سایت شما آنلاین است</li>
                  </ol>
                </AccordionItem>
              </div>
            )}

            {/* GitHub Pages */}
            {activeMethod === 'github' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-purple-300">
                  <Package size={20} />
                  <h3 className="font-bold text-lg">استقرار روی GitHub Pages</h3>
                </div>

                <AccordionItem title="مرحله ۱: نصب پکیج" index={9}>
                  <CodeBlock code={`npm install -D gh-pages`} index={9} />
                </AccordionItem>

                <AccordionItem title="مرحله ۲: اضافه کردن اسکریپت" index={10}>
                  <p>در فایل <code className="bg-gray-700 px-1.5 py-0.5 rounded" dir="ltr">package.json</code> این اسکریپت را اضافه کنید:</p>
                  <CodeBlock code={`"scripts": {
  "deploy": "npm run build && gh-pages -d dist"
}`} index={10} />
                </AccordionItem>

                <AccordionItem title="مرحله ۳: استقرار" index={11}>
                  <CodeBlock code={`npm run deploy`} index={11} />
                  <p className="mt-2 text-gray-400">سایت شما در آدرس زیر قابل دسترسی خواهد بود:</p>
                  <code className="block bg-gray-900 p-2 rounded text-indigo-300 text-xs" dir="ltr">
                    https://username.github.io/repo-name/
                  </code>
                </AccordionItem>
              </div>
            )}

            {/* cPanel */}
            {activeMethod === 'hosting' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-orange-300">
                  <FolderOpen size={20} />
                  <h3 className="font-bold text-lg">استقرار روی cPanel / DirectAdmin</h3>
                </div>

                <AccordionItem title="مرحله ۱: بیلد گرفتن" index={12}>
                  <CodeBlock code={`npm run build`} index={12} />
                  <p className="mt-2">پوشه <code className="bg-gray-700 px-1.5 py-0.5 rounded" dir="ltr">dist/</code> ساخته می‌شود.</p>
                </AccordionItem>

                <AccordionItem title="مرحله ۲: زیپ کردن فایل‌ها" index={13}>
                  <CodeBlock code={`# در لینوکس/مک:
cd dist && zip -r ../site.zip .

# یا در ویندوز:
# محتویات پوشه dist را زیپ کنید`} index={13} />
                </AccordionItem>

                <AccordionItem title="مرحله ۳: آپلود از طریق cPanel" index={14}>
                  <ol className="list-decimal list-inside space-y-2 text-gray-400">
                    <li>وارد cPanel شوید</li>
                    <li>به File Manager بروید</li>
                    <li>وارد پوشه <code className="bg-gray-700 px-1.5 py-0.5 rounded" dir="ltr">public_html</code> شوید</li>
                    <li>دکمه Upload را بزنید و فایل ZIP را آپلود کنید</li>
                    <li>روی فایل ZIP راست‌کلیک و Extract را بزنید</li>
                    <li>فایل‌ها باید مستقیماً در public_html باشند</li>
                  </ol>
                </AccordionItem>

                <AccordionItem title="مرحله ۴: آپلود از طریق FTP" index={15}>
                  <p>با استفاده از FileZilla یا هر کلاینت FTP دیگر:</p>
                  <CodeBlock code={`# اطلاعات اتصال:
Host: your-domain.com
Username: FTP username شما
Password: FTP password شما
Port: 21

# مسیر مقصد:
/public_html/

# تمام محتویات dist/ را اینجا آپلود کنید`} index={15} />
                </AccordionItem>
              </div>
            )}
          </div>

          {/* Important Notes */}
          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-yellow-300">
              <Shield size={18} />
              <h3 className="font-bold">نکات مهم</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-1">•</span>
                <span>این برنامه نیازی به سرور بک‌اند ندارد و کاملاً سمت مرورگر اجرا می‌شود</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-1">•</span>
                <span>برای عملکرد بهتر، از HTTPS استفاده کنید</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-1">•</span>
                <span>حجم کل فایل‌ها حدود ۳۰۰ کیلوبایت (فشرده: ۹۰ کیلوبایت) است</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-1">•</span>
                <span>فایل خروجی APK/AAB روی مرورگر کاربر ساخته می‌شود و به سرور ارسال نمی‌شود</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-1">•</span>
                <span>برای تبدیل نهایی به APK/AAB، کاربر باید Android Studio داشته باشد</span>
              </li>
            </ul>
          </div>

          {/* Embed Code */}
          <div className="bg-gray-800/30 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-indigo-300">
              <Terminal size={18} />
              <h3 className="font-bold">قرار دادن در صفحه موجود (iframe)</h3>
            </div>
            <p className="text-sm text-gray-400">
              اگر می‌خواهید این برنامه را در بخشی از سایت فعلی خود قرار دهید، از کد زیر استفاده کنید:
            </p>
            <CodeBlock code={`<!-- قرار دادن در سایت شما -->
<iframe 
  src="https://your-domain.com/" 
  width="100%" 
  height="800px" 
  frameborder="0"
  style="border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);"
  allow="clipboard-write"
></iframe>`} index={16} />
          </div>
        </div>
      </div>
    </div>
  );
}
