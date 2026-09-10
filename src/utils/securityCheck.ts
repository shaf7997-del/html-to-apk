export interface SecurityIssue {
  type: 'danger' | 'warning' | 'info';
  title: string;
  description: string;
  line?: number;
  code?: string;
}

export interface SecurityReport {
  isSafe: boolean;
  score: number;
  issues: SecurityIssue[];
  sanitizedCode: string;
}

const DANGEROUS_PATTERNS = [
  {
    pattern: /eval\s*\(/gi,
    type: 'danger' as const,
    title: 'استفاده از eval()',
    description: 'تابع eval می‌تواند کد مخرب را اجرا کند و خطر امنیتی بالایی دارد.',
  },
  {
    pattern: /document\.write\s*\(/gi,
    type: 'warning' as const,
    title: 'استفاده از document.write()',
    description: 'این تابع می‌تواند محتوای صفحه را تغییر دهد و ممکن است مخرب باشد.',
  },
  {
    pattern: /innerHTML\s*=/gi,
    type: 'warning' as const,
    title: 'تخصیص innerHTML',
    description: 'تخصیص مستقیم innerHTML می‌تواند منجر به حملات XSS شود.',
  },
  {
    pattern: /outerHTML\s*=/gi,
    type: 'warning' as const,
    title: 'تخصیص outerHTML',
    description: 'تخصیص مستقیم outerHTML می‌تواند منجر به حملات XSS شود.',
  },
  {
    pattern: /<script[^>]*src\s*=\s*["'][^"']*["'][^>]*>/gi,
    type: 'warning' as const,
    title: 'اسکریپت خارجی',
    description: 'لود اسکریپت از منبع خارجی می‌تواند خطرناک باشد.',
  },
  {
    pattern: /window\.location\s*=/gi,
    type: 'warning' as const,
    title: 'تغییر location',
    description: 'تغییر آدرس صفحه می‌تواند کاربر را به سایت مخرب هدایت کند.',
  },
  {
    pattern: /localStorage\s*\.\s*(setItem|removeItem|clear)/gi,
    type: 'info' as const,
    title: 'دسترسی به localStorage',
    description: 'دسترسی به ذخیره‌سازی محلی detected شد.',
  },
  {
    pattern: /sessionStorage\s*\.\s*(setItem|removeItem|clear)/gi,
    type: 'info' as const,
    title: 'دسترسی به sessionStorage',
    description: 'دسترسی به ذخیره‌سازی session detected شد.',
  },
  {
    pattern: /fetch\s*\(\s*["'][^"']*["']/gi,
    type: 'info' as const,
    title: 'درخواست شبکه‌ای',
    description: 'درخواست HTTP به سرور خارجی detected شد.',
  },
  {
    pattern: /XMLHttpRequest/gi,
    type: 'info' as const,
    title: 'استفاده از XMLHttpRequest',
    description: 'درخواست شبکه‌ای با XMLHttpRequest detected شد.',
  },
  {
    pattern: /navigator\.geolocation/gi,
    type: 'warning' as const,
    title: 'دسترسی به موقعیت مکانی',
    description: 'دسترسی به GPS دستگاه detected شد.',
  },
  {
    pattern: /navigator\.camera|getUserMedia/gi,
    type: 'warning' as const,
    title: 'دسترسی به دوربین',
    description: 'دسترسی به دوربین دستگاه detected شد.',
  },
  {
    pattern: /<iframe[^>]*>/gi,
    type: 'warning' as const,
    title: 'استفاده از iframe',
    description: 'iframe می‌تواند محتوای خارجی خطرناک را نمایش دهد.',
  },
  {
    pattern: /on(error|load|click|mouseover|focus|blur)\s*=/gi,
    type: 'info' as const,
    title: 'رویدادHandler خطی',
    description: 'رویدادHandler به صورت خطی تعریف شده است.',
  },
  {
    pattern: /Function\s*\(/gi,
    type: 'danger' as const,
    title: 'استفاده از Function constructor',
    description: 'ساختار Function مشابه eval عمل می‌کند و خطرناک است.',
  },
  {
    pattern: /setTimeout\s*\(\s*["']/gi,
    type: 'warning' as const,
    title: 'setTimeout با رشته',
    description: 'استفاده از setTimeout با رشته مشابه eval عمل می‌کند.',
  },
  {
    pattern: /setInterval\s*\(\s*["']/gi,
    type: 'warning' as const,
    title: 'setInterval با رشته',
    description: 'استفاده از setInterval با رشته مشابه eval عمل می‌کند.',
  },
  {
    pattern: /crypto\.subtle|crypto\.getRandomValues/gi,
    type: 'info' as const,
    title: 'استفاده از API رمزنگاری',
    description: 'کد از API‌های رمزنگاری استفاده می‌کند.',
  },
  {
    pattern: /WebSocket\s*\(/gi,
    type: 'info' as const,
    title: 'اتصال WebSocket',
    description: 'اتصال WebSocket به سرور detected شد.',
  },
  {
    pattern: /cookie/gi,
    type: 'warning' as const,
    title: 'دسترسی به Cookie',
    description: 'دسترسی یا تغییر cookie‌ها detected شد.',
  },
];

export function analyzeSecurity(htmlCode: string): SecurityReport {
  const issues: SecurityIssue[] = [];
  const lines = htmlCode.split('\n');

  for (const { pattern, type, title, description } of DANGEROUS_PATTERNS) {
    const matches = htmlCode.matchAll(new RegExp(pattern, 'gi'));
    for (const match of matches) {
      const beforeMatch = htmlCode.substring(0, match.index || 0);
      const lineNumber = beforeMatch.split('\n').length;
      const lineContent = lines[lineNumber - 1]?.trim() || '';

      issues.push({
        type,
        title,
        description,
        line: lineNumber,
        code: lineContent.substring(0, 100),
      });
    }
  }

  // Calculate security score
  let score = 100;
  for (const issue of issues) {
    if (issue.type === 'danger') score -= 25;
    else if (issue.type === 'warning') score -= 10;
    else if (issue.type === 'info') score -= 3;
  }
  score = Math.max(0, score);

  // Sanitize code
  let sanitizedCode = htmlCode;

  // Remove eval calls
  sanitizedCode = sanitizedCode.replace(/eval\s*\(([^)]*)\)/g, '/* [EVAL REMOVED] */ void(0)');

  // Remove Function constructor
  sanitizedCode = sanitizedCode.replace(/new\s+Function\s*\(([^)]*)\)/g, '/* [FUNCTION REMOVED] */ void(0)');

  // Remove document.write
  sanitizedCode = sanitizedCode.replace(/document\.write\s*\([^)]*\)/g, '/* [document.write REMOVED] */ void(0)');

  // Remove dangerous iframes
  sanitizedCode = sanitizedCode.replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '<!-- [IFRAME REMOVED] -->');

  // Remove inline event handlers
  sanitizedCode = sanitizedCode.replace(/\s+on(error|load|click|mouseover|focus|blur|submit|change|keydown|keyup|keypress)\s*=\s*["'][^"']*["']/gi, '');

  const isSafe = !issues.some(i => i.type === 'danger');

  return {
    isSafe,
    score,
    issues,
    sanitizedCode,
  };
}
