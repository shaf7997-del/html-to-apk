import { useState, useCallback } from 'react';
import { 
  Download, ChevronLeft, ChevronRight,
  CheckCircle, Upload, FileCode,
  Smartphone, Package, Eye, EyeOff, Sparkles, Zap, Monitor
} from 'lucide-react';
import { buildApkProject, AppSettings } from './utils/buildApk';

type Step = 'code' | 'settings' | 'build';

const defaultSettings: AppSettings = {
  appName: 'My App',
  packageName: 'com.example.myapp',
  versionName: '1.0.0',
  versionCode: 1,
  minSdk: 21,
  targetSdk: 34,
  orientation: 'unspecified',
  fullscreen: false,
  statusBarColor: '#1a1a2e',
  themeColor: '#6366f1',
  iconDataUrl: null,
  splashDataUrl: null,
};

export default function App() {
  const [currentStep, setCurrentStep] = useState<Step>('code');
  const [htmlCode, setHtmlCode] = useState<string>(`<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My App</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: Tahoma, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }
        .container {
            text-align: center;
            padding: 2rem;
        }
        h1 { font-size: 2rem; margin-bottom: 1rem; }
        p { font-size: 1.1rem; opacity: 0.9; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎉 سلام دنیا!</h1>
        <p>این یک اپلیکیشن وب است که به APK تبدیل شده</p>
    </div>
</body>
</html>`);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);
  const [buildComplete, setBuildComplete] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [iconPreview, setIconPreview] = useState<string | null>(null);

  const steps: { key: Step; label: string }[] = [
    { key: 'code', label: 'کد HTML' },
    { key: 'settings', label: 'تنظیمات' },
    { key: 'build', label: 'خروجی' },
  ];

  const stepIndex = steps.findIndex(s => s.key === currentStep);

  const handleBuild = useCallback(async () => {
    setIsBuilding(true);
    setBuildProgress(0);
    setBuildComplete(false);

    for (let i = 0; i <= 100; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setBuildProgress(i);
    }

    await buildApkProject(htmlCode, settings);

    setIsBuilding(false);
    setBuildComplete(true);
  }, [htmlCode, settings]);

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        setIconPreview(result);
        setSettings(prev => ({ ...prev, iconDataUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const goNext = () => {
    if (stepIndex < steps.length - 1) {
      setCurrentStep(steps[stepIndex + 1].key);
    }
  };

  const goPrev = () => {
    if (stepIndex > 0) {
      setCurrentStep(steps[stepIndex - 1].key);
    }
  };

  return (
    <div className="min-h-screen text-white px-3 py-4 sm:px-4 sm:py-6 md:p-8 overflow-x-hidden">
      {/* Header */}
      <header className="text-center mb-5 sm:mb-8 slide-up">
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3">
          <div className="p-2 sm:p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl sm:rounded-2xl shadow-lg">
            <Monitor size={24} className="sm:hidden" />
            <Monitor size={32} className="hidden sm:block" />
          </div>
          <h1 className="text-xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            HTML to APK Builder
          </h1>
        </div>
        <p className="text-gray-400 text-xs sm:text-sm md:text-base px-2">
          تبدیل کد HTML به اپلیکیشن اندروید - بدون نیاز به Android Studio
        </p>
      </header>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto mb-5 sm:mb-8">
        <div className="glass-card rounded-xl sm:rounded-2xl p-2.5 sm:p-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.key} className="flex items-center flex-1 min-w-0">
                <button
                  onClick={() => setCurrentStep(step.key)}
                  className={`flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2 px-1.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all duration-300 min-w-0 ${
                    currentStep === step.key
                      ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/50'
                      : index < stepIndex
                        ? 'text-green-400 hover:bg-white/5'
                        : 'text-gray-500 hover:bg-white/5'
                  }`}
                >
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shrink-0 ${
                    currentStep === step.key
                      ? 'bg-indigo-500 text-white'
                      : index < stepIndex
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-700 text-gray-400'
                  }`}>
                    {index < stepIndex ? <CheckCircle size={14} /> : index + 1}
                  </div>
                  <span className="hidden lg:inline text-xs sm:text-sm font-medium truncate">{step.label}</span>
                </button>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 sm:mx-2 min-w-[8px] ${
                    index < stepIndex ? 'bg-green-500' : 'bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="sm:hidden text-center mt-2 text-xs text-gray-400">
            مرحله {stepIndex + 1} از {steps.length}: <span className="text-indigo-300">{steps[stepIndex].label}</span>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-4xl mx-auto">
        <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 slide-up">
          {/* Step 1: HTML Code */}
          {currentStep === 'code' && (
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                <h2 className="text-base sm:text-xl font-bold flex items-center gap-2">
                  <FileCode className="text-indigo-400 shrink-0" size={20} />
                  <span>کد HTML را وارد کنید</span>
                </h2>
                <div className="flex gap-2 overflow-x-auto">
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-white/10 rounded-lg text-xs sm:text-sm hover:bg-white/20 transition whitespace-nowrap active:scale-95"
                  >
                    {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
                    {showPreview ? 'مخفی' : 'پیش‌نمایش'}
                  </button>
                  <label className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-indigo-500/20 rounded-lg text-xs sm:text-sm hover:bg-indigo-500/30 transition cursor-pointer whitespace-nowrap active:scale-95">
                    <Upload size={14} />
                    آپلود فایل
                    <input
                      type="file"
                      accept=".html,.htm"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            setHtmlCode(ev.target?.result as string);
                          };
                          reader.readAsText(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="relative">
                <textarea
                  value={htmlCode}
                  onChange={(e) => setHtmlCode(e.target.value)}
                  className="code-editor w-full h-56 sm:h-72 md:h-80 bg-gray-900/80 border border-gray-700 rounded-xl p-3 sm:p-4 text-xs sm:text-sm text-green-300 resize-none focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50"
                  placeholder="کد HTML خود را اینجا وارد کنید..."
                  spellCheck={false}
                />
                <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 text-[10px] sm:text-xs text-gray-500">
                  {htmlCode.length.toLocaleString('fa')} کاراکتر | {htmlCode.split('\n').length.toLocaleString('fa')} خط
                </div>
              </div>

              {showPreview && (
                <div className="border border-gray-700 rounded-xl overflow-hidden">
                  <div className="bg-gray-800 px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-400 flex items-center gap-2">
                    <Smartphone size={14} />
                    پیش‌نمایش
                  </div>
                  <iframe
                    srcDoc={htmlCode}
                    className="w-full h-64 sm:h-80 md:h-96 bg-white"
                    sandbox="allow-scripts"
                    title="Preview"
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 2: Settings */}
          {currentStep === 'settings' && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-base sm:text-xl font-bold flex items-center gap-2">
                <Package className="text-indigo-400 shrink-0" size={20} />
                تنظیمات اپلیکیشن
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-xs sm:text-sm text-gray-300 font-medium">نام برنامه</label>
                  <input
                    type="text"
                    value={settings.appName}
                    onChange={(e) => setSettings(prev => ({ ...prev, appName: e.target.value }))}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white focus:outline-none focus:border-indigo-500 transition"
                    placeholder="نام اپلیکیشن"
                  />
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-xs sm:text-sm text-gray-300 font-medium">شناسه پکیج</label>
                  <input
                    type="text"
                    value={settings.packageName}
                    onChange={(e) => setSettings(prev => ({ ...prev, packageName: e.target.value }))}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white focus:outline-none focus:border-indigo-500 transition"
                    placeholder="com.example.myapp"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-xs sm:text-sm text-gray-300 font-medium">نسخه (نام)</label>
                  <input
                    type="text"
                    value={settings.versionName}
                    onChange={(e) => setSettings(prev => ({ ...prev, versionName: e.target.value }))}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white focus:outline-none focus:border-indigo-500 transition"
                    placeholder="1.0.0"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-xs sm:text-sm text-gray-300 font-medium">نسخه (کد)</label>
                  <input
                    type="number"
                    value={settings.versionCode}
                    onChange={(e) => setSettings(prev => ({ ...prev, versionCode: parseInt(e.target.value) || 1 }))}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white focus:outline-none focus:border-indigo-500 transition"
                    min="1"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-xs sm:text-sm text-gray-300 font-medium">حداقل نسخه اندروید</label>
                  <select
                    value={settings.minSdk}
                    onChange={(e) => setSettings(prev => ({ ...prev, minSdk: parseInt(e.target.value) }))}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white focus:outline-none focus:border-indigo-500 transition"
                  >
                    <option value={21}>Android 5.0 (API 21)</option>
                    <option value={23}>Android 6.0 (API 23)</option>
                    <option value={26}>Android 8.0 (API 26)</option>
                    <option value={28}>Android 9.0 (API 28)</option>
                    <option value={30}>Android 11 (API 30)</option>
                  </select>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-xs sm:text-sm text-gray-300 font-medium">هدف SDK</label>
                  <select
                    value={settings.targetSdk}
                    onChange={(e) => setSettings(prev => ({ ...prev, targetSdk: parseInt(e.target.value) }))}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white focus:outline-none focus:border-indigo-500 transition"
                  >
                    <option value={33}>Android 13 (API 33)</option>
                    <option value={34}>Android 14 (API 34)</option>
                  </select>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-xs sm:text-sm text-gray-300 font-medium">جهت صفحه</label>
                  <select
                    value={settings.orientation}
                    onChange={(e) => setSettings(prev => ({ ...prev, orientation: e.target.value as AppSettings['orientation'] }))}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white focus:outline-none focus:border-indigo-500 transition"
                  >
                    <option value="unspecified">آزاد (چرخش خودکار)</option>
                    <option value="portrait">عمودی (Portrait)</option>
                    <option value="landscape">افقی (Landscape)</option>
                  </select>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-xs sm:text-sm text-gray-300 font-medium">حالت تمام‌صفحه</label>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, fullscreen: !prev.fullscreen }))}
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border transition text-sm sm:text-base active:scale-[0.98] ${
                      settings.fullscreen
                        ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                        : 'bg-gray-800/50 border-gray-700 text-gray-400'
                    }`}
                  >
                    {settings.fullscreen ? '✅ فعال' : '❌ غیرفعال'}
                  </button>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-xs sm:text-sm text-gray-300 font-medium">رنگ نوار وضعیت</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={settings.statusBarColor}
                      onChange={(e) => setSettings(prev => ({ ...prev, statusBarColor: e.target.value }))}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl cursor-pointer border-0 bg-transparent shrink-0"
                    />
                    <input
                      type="text"
                      value={settings.statusBarColor}
                      onChange={(e) => setSettings(prev => ({ ...prev, statusBarColor: e.target.value }))}
                      className="flex-1 min-w-0 bg-gray-800/50 border border-gray-700 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white focus:outline-none focus:border-indigo-500 transition"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-xs sm:text-sm text-gray-300 font-medium">رنگ تم</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={settings.themeColor}
                      onChange={(e) => setSettings(prev => ({ ...prev, themeColor: e.target.value }))}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl cursor-pointer border-0 bg-transparent shrink-0"
                    />
                    <input
                      type="text"
                      value={settings.themeColor}
                      onChange={(e) => setSettings(prev => ({ ...prev, themeColor: e.target.value }))}
                      className="flex-1 min-w-0 bg-gray-800/50 border border-gray-700 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white focus:outline-none focus:border-indigo-500 transition"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              {/* Icon Upload */}
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm text-gray-300 font-medium">آیکون برنامه (512×512 PNG)</label>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl border-2 border-dashed border-gray-600 flex items-center justify-center overflow-hidden bg-gray-800/50 shrink-0">
                    {iconPreview ? (
                      <img src={iconPreview} alt="Icon" className="w-full h-full object-cover" />
                    ) : (
                      <Package size={20} className="text-gray-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <label className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-indigo-500/20 border border-indigo-500/30 rounded-lg sm:rounded-xl text-xs sm:text-sm text-indigo-300 hover:bg-indigo-500/30 transition cursor-pointer active:scale-95">
                      <Upload size={14} />
                      انتخاب آیکون
                      <input
                        type="file"
                        accept="image/png,image/jpeg"
                        className="hidden"
                        onChange={handleIconUpload}
                      />
                    </label>
                    {iconPreview && (
                      <button
                        onClick={() => {
                          setIconPreview(null);
                          setSettings(prev => ({ ...prev, iconDataUrl: null }));
                        }}
                        className="text-red-400 text-xs sm:text-sm hover:text-red-300 active:scale-95"
                      >
                        حذف
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Build */}
          {currentStep === 'build' && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-base sm:text-xl font-bold flex items-center gap-2">
                <Download className="text-indigo-400 shrink-0" size={20} />
                ساخت اپلیکیشن
              </h2>

              {!isBuilding && !buildComplete && (
                <div className="space-y-3 sm:space-y-4">
                  <p className="text-gray-400 text-xs sm:text-sm">
                    پروژه Android Studio شامل تمام فایل‌های لازم و اسکریپت بیلد خودکار تولید و دانلود خواهد شد.
                    کافیست فایل ZIP را استخراج کرده و <code className="bg-gray-700 px-1.5 py-0.5 rounded text-indigo-300" dir="ltr">build.bat</code> را اجرا کنید.
                  </p>

                  <button
                    onClick={handleBuild}
                    className="w-full p-4 sm:p-6 bg-gradient-to-br from-indigo-500/20 to-purple-600/10 border border-indigo-500/30 rounded-xl sm:rounded-2xl hover:border-indigo-500/60 transition-all duration-300 text-right active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-indigo-500/20 rounded-xl">
                        <Zap className="text-indigo-400" size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-indigo-300 text-sm sm:text-base">ساخت پروژه و دانلود</h3>
                        <p className="text-[10px] sm:text-xs text-gray-400">پروژه Android + اسکریپت بیلد خودکار</p>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-400">
                      فایل ZIP شامل پروژه کامل + فایل build.bat برای ساخت خودکار APK
                    </p>
                  </button>

                  {/* Summary */}
                  <div className="bg-gray-800/30 rounded-lg sm:rounded-xl p-3 sm:p-4 space-y-2">
                    <h4 className="font-medium text-xs sm:text-sm text-gray-300 mb-2 sm:mb-3">خلاصه پروژه:</h4>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] sm:text-xs">
                      <div className="text-gray-500">نام:</div>
                      <div className="text-gray-300 truncate">{settings.appName}</div>
                      <div className="text-gray-500">پکیج:</div>
                      <div className="text-gray-300 truncate" dir="ltr">{settings.packageName}</div>
                      <div className="text-gray-500">نسخه:</div>
                      <div className="text-gray-300">{settings.versionName}</div>
                      <div className="text-gray-500">Min SDK:</div>
                      <div className="text-gray-300">{settings.minSdk}</div>
                      <div className="text-gray-500">Target SDK:</div>
                      <div className="text-gray-300">{settings.targetSdk}</div>
                    </div>
                  </div>
                </div>
              )}

              {isBuilding && (
                <div className="space-y-4 sm:space-y-6 py-4 sm:py-8">
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 text-indigo-300 mb-4">
                      <Zap className="animate-pulse" size={20} />
                      <span className="text-sm sm:text-lg font-medium">در حال ساخت پروژه...</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-400">پیشرفت</span>
                      <span className="text-indigo-300">{buildProgress}%</span>
                    </div>
                    <div className="h-2.5 sm:h-3 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full progress-bar"
                        style={{ width: `${buildProgress}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                    {buildProgress >= 10 && (
                      <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle size={14} />
                        <span>ایجاد ساختار پروژه...</span>
                      </div>
                    )}
                    {buildProgress >= 30 && (
                      <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle size={14} />
                        <span>تنظیم فایل‌های منبع...</span>
                      </div>
                    )}
                    {buildProgress >= 50 && (
                      <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle size={14} />
                        <span>اضافه کردن WebView...</span>
                      </div>
                    )}
                    {buildProgress >= 70 && (
                      <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle size={14} />
                        <span>ساخت اسکریپت بیلد...</span>
                      </div>
                    )}
                    {buildProgress >= 90 && (
                      <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle size={14} />
                        <span>آماده‌سازی فایل خروجی...</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {buildComplete && (
                <div className="text-center py-6 sm:py-8 space-y-3 sm:space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-green-500/20 rounded-full mb-2 sm:mb-4">
                    <CheckCircle className="text-green-400" size={32} />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-green-300">پروژه با موفقیت ساخته شد!</h3>
                  <p className="text-gray-400 text-xs sm:text-sm px-2 sm:px-0">
                    فایل ZIP دانلود شد. آن را استخراج کنید و <code className="bg-gray-700 px-1.5 py-0.5 rounded text-green-300" dir="ltr">build.bat</code> را اجرا کنید.
                  </p>
                  <div className="bg-gray-800/30 rounded-lg sm:rounded-xl p-3 sm:p-4 text-right">
                    <h4 className="font-medium text-xs sm:text-sm text-gray-300 mb-2">مراحل ساخت APK:</h4>
                    <ol className="text-[11px] sm:text-xs text-gray-400 space-y-1 list-decimal list-inside">
                      <li>فایل ZIP را استخراج کنید</li>
                      <li>فایل <code className="bg-gray-700 px-1 rounded" dir="ltr">build.bat</code> را اجرا کنید</li>
                      <li>منتظر بمانید تا Gradle دانلود و APK ساخته شود</li>
                      <li>فایل APK در پوشه <code className="bg-gray-700 px-1 rounded" dir="ltr">app/build/outputs/apk/</code> قرار می‌گیرد</li>
                    </ol>
                    <p className="text-[10px] sm:text-xs text-yellow-400/70 mt-3">
                      ⚠️ پیش‌نیاز: Java JDK 17 باید روی سیستم نصب باشد
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setBuildComplete(false);
                      setBuildProgress(0);
                    }}
                    className="px-4 sm:px-6 py-2 bg-indigo-500/20 border border-indigo-500/30 rounded-lg sm:rounded-xl text-xs sm:text-sm text-indigo-300 hover:bg-indigo-500/30 transition active:scale-95"
                  >
                    ساخت مجدد
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-4 sm:mt-6 gap-2">
          <button
            onClick={goPrev}
            disabled={stepIndex === 0}
            className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition text-xs sm:text-sm ${
              stepIndex === 0
                ? 'opacity-30 cursor-not-allowed bg-gray-800/50'
                : 'bg-white/10 hover:bg-white/20 active:scale-95'
            }`}
          >
            <ChevronRight size={16} />
            <span className="hidden sm:inline">مرحله قبل</span>
            <span className="sm:hidden">قبلی</span>
          </button>

          {currentStep !== 'build' && (
            <button
              onClick={goNext}
              disabled={!htmlCode.trim() && currentStep === 'code'}
              className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition text-xs sm:text-sm ${
                !htmlCode.trim() && currentStep === 'code'
                  ? 'opacity-30 cursor-not-allowed bg-gray-800/50'
                  : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg shadow-indigo-500/25 active:scale-95'
              }`}
            >
              <span className="hidden sm:inline">مرحله بعد</span>
              <span className="sm:hidden">بعدی</span>
              <ChevronLeft size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center mt-8 sm:mt-12 text-gray-600 text-[10px] sm:text-xs px-2">
        <p>ساخته شده با ❤️ | تبدیل HTML به اپلیکیشن اندروید</p>
      </footer>
    </div>
  );
}
