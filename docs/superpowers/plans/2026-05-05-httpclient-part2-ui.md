# HTTP Client — Part 2: UI Components & Integration

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete UI for the HTTP Client tool — KeyValueEditor component, useHttpClient hook, full page with request/response panels, history drawer, i18n for 10 locales, and SEO structured data.

**Architecture:** Following the project pattern: `page.tsx` (route entry, already created in Part 1) + `httpclient-page.tsx` (client component with all UI). Sub-components defined as functions within the page file. State managed by `useHttpClient` custom hook. KV editor is a reusable component in `components/httpclient/`.

**Tech Stack:** React 19, Next.js 16, TypeScript, Tailwind CSS 4, @headlessui/react, Lucide React, next-intl, @uiw/react-json-view

**Prerequisite:** Part 1 plan must be fully completed before starting this plan.

---

## File Map

| Action | File                                          | Responsibility                       |
| ------ | --------------------------------------------- | ------------------------------------ |
| Create | `public/locales/en/httpclient.json`           | English tool-specific translations   |
| Create | `public/locales/zh-CN/httpclient.json`        | Simplified Chinese translations      |
| Create | `public/locales/zh-TW/httpclient.json`        | Traditional Chinese translations     |
| Create | `public/locales/ja/httpclient.json`           | Japanese translations                |
| Create | `public/locales/ko/httpclient.json`           | Korean translations                  |
| Create | `public/locales/es/httpclient.json`           | Spanish translations                 |
| Create | `public/locales/pt-BR/httpclient.json`        | Portuguese (BR) translations         |
| Create | `public/locales/fr/httpclient.json`           | French translations                  |
| Create | `public/locales/de/httpclient.json`           | German translations                  |
| Create | `public/locales/ru/httpclient.json`           | Russian translations                 |
| Modify | `public/locales/en/tools.json`                | Add httpclient entry                 |
| Modify | `public/locales/zh-CN/tools.json`             | Add httpclient entry                 |
| Modify | `public/locales/zh-TW/tools.json`             | Add httpclient entry                 |
| Modify | `public/locales/ja/tools.json`                | Add httpclient entry                 |
| Modify | `public/locales/ko/tools.json`                | Add httpclient entry                 |
| Modify | `public/locales/es/tools.json`                | Add httpclient entry                 |
| Modify | `public/locales/pt-BR/tools.json`             | Add httpclient entry                 |
| Modify | `public/locales/fr/tools.json`                | Add httpclient entry                 |
| Modify | `public/locales/de/tools.json`                | Add httpclient entry                 |
| Modify | `public/locales/ru/tools.json`                | Add httpclient entry                 |
| Create | `components/httpclient/key-value-editor.tsx`  | Reusable KV pair editor              |
| Create | `libs/httpclient/use-http-client.ts`          | Core hook for request/response state |
| Create | `app/[locale]/httpclient/httpclient-page.tsx` | Full page component                  |

---

### Task 1: English i18n — httpclient.json + tools.json Entry

**Files:**

- Create: `public/locales/en/httpclient.json`
- Modify: `public/locales/en/tools.json`

- [ ] **Step 1: Create English tool-specific translations**

```json
{
  "url": {
    "placeholder": "https://api.example.com/users"
  },
  "method": {
    "label": "Method"
  },
  "timeout": {
    "label": "Timeout"
  },
  "send": "Send",
  "sending": "Sending...",
  "tabs": {
    "params": "Params",
    "headers": "Headers",
    "body": "Body",
    "auth": "Auth"
  },
  "bodyType": {
    "none": "none",
    "json": "JSON",
    "form-data": "Form-Data",
    "urlencoded": "x-www-form-urlencoded",
    "raw": "Raw"
  },
  "authType": {
    "none": "none",
    "bearer": "Bearer Token",
    "basic": "Basic Auth"
  },
  "bearerToken": {
    "placeholder": "Enter Bearer token"
  },
  "basicAuth": {
    "username": "Username",
    "password": "Password",
    "usernamePlaceholder": "Username",
    "passwordPlaceholder": "Password"
  },
  "kv": {
    "keyPlaceholder": "Key",
    "valuePlaceholder": "Value"
  },
  "bodyPlaceholder": "Enter request body...",
  "response": {
    "title": "Response",
    "emptyState": "Enter a URL and click Send to get started",
    "tabs": {
      "body": "Body",
      "headers": "Headers",
      "cookies": "Cookies",
      "timing": "Timing",
      "redirects": "Redirects"
    },
    "status": "Status",
    "time": "Time",
    "size": "Size",
    "type": "Type",
    "download": "Download",
    "copyBody": "Copy Body",
    "pretty": "Pretty",
    "raw": "Raw",
    "largeResponseWarning": "Response is larger than 1MB. Showing first 100KB.",
    "noHeaders": "No response headers",
    "noCookies": "No accessible cookies",
    "cookieNote": "Cookies are only visible for same-origin requests or when the server exposes Set-Cookie via CORS headers.",
    "timingNote": "Detailed timing (TTFB, Download) is only available when the server returns Timing-Allow-Origin header.",
    "ttfb": "TTFB",
    "download": "Download",
    "total": "Total",
    "na": "N/A",
    "crossOrigin": "(cross-origin)",
    "redirectOccurred": "A redirect occurred",
    "noRedirect": "No redirects",
    "finalUrl": "Final URL",
    "redirectNote": "Browser fetch does not expose intermediate redirect URLs. Only the final destination is shown.",
    "binaryPreview": "Binary response — hex dump preview (first 4KB)"
  },
  "error": {
    "cors": "CORS policy blocked this request. The target API does not allow cross-origin requests from browsers.",
    "network": "Network error",
    "timeout": "Request timed out after {timeout}s.",
    "generic": "Request failed"
  },
  "history": {
    "title": "History",
    "clear": "Clear History",
    "empty": "No history yet",
    "ago": {
      "seconds": "{count}s ago",
      "minutes": "{count}min ago",
      "hours": "{count}h ago",
      "days": "{count}d ago"
    }
  },
  "description": {
    "text": "A lightweight, browser-based HTTP client for testing REST APIs. Compose and send requests with full control over method, headers, body, and auth — then inspect responses with timing details, headers, and cookies. All requests execute via browser fetch(), so only CORS-friendly APIs are supported. No data is sent to any server.",
    "features": {
      "title": "Features",
      "methods": "All standard HTTP methods: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS",
      "auth": "Authentication: Bearer Token, Basic Auth",
      "body": "Request body formats: JSON, Form-Data, x-www-form-urlencoded, Raw text",
      "response": "Response inspection: formatted body, headers, cookies, timing, redirect info",
      "history": "Request history with one-click restore (stored locally)"
    },
    "cors": {
      "title": "CORS Limitations",
      "text": "This tool uses the browser's native fetch() API. Cross-origin requests require the target server to include appropriate CORS headers (Access-Control-Allow-Origin). If a server does not support CORS, the request will fail with a CORS error. This is a browser security feature and cannot be bypassed without a proxy server."
    }
  }
}
```

- [ ] **Step 2: Add httpclient entry to `public/locales/en/tools.json`**

Insert before `"categories"` (before line 137):

```json
  "httpclient": {
    "title": "HTTP Client - Online REST API Tester",
    "shortTitle": "HTTP Client",
    "description": "Send HTTP requests and test REST APIs directly in your browser. Supports GET, POST, PUT, DELETE with headers, body, and auth. Free, no data sent to servers."
  },
```

- [ ] **Step 3: Verify JSON is valid**

Run: `node -e "JSON.parse(require('fs').readFileSync('public/locales/en/httpclient.json','utf8')); JSON.parse(require('fs').readFileSync('public/locales/en/tools.json','utf8')); console.log('OK')"`
Expected: `OK`

- [ ] **Step 4: Commit**

```bash
git add public/locales/en/httpclient.json public/locales/en/tools.json
git commit -m "feat(httpclient): add English i18n translations"
```

---

### Task 2: CJK i18n — zh-CN, zh-TW, ja, ko

**Files:**

- Create: `public/locales/zh-CN/httpclient.json`
- Create: `public/locales/zh-TW/httpclient.json`
- Create: `public/locales/ja/httpclient.json`
- Create: `public/locales/ko/httpclient.json`
- Modify: `public/locales/zh-CN/tools.json`
- Modify: `public/locales/zh-TW/tools.json`
- Modify: `public/locales/ja/tools.json`
- Modify: `public/locales/ko/tools.json`

- [ ] **Step 1: Create zh-CN translations**

```json
{
  "url": {
    "placeholder": "https://api.example.com/users"
  },
  "method": {
    "label": "请求方法"
  },
  "timeout": {
    "label": "超时时间"
  },
  "send": "发送",
  "sending": "发送中...",
  "tabs": {
    "params": "参数",
    "headers": "请求头",
    "body": "请求体",
    "auth": "认证"
  },
  "bodyType": {
    "none": "无",
    "json": "JSON",
    "form-data": "表单数据",
    "urlencoded": "x-www-form-urlencoded",
    "raw": "原始文本"
  },
  "authType": {
    "none": "无",
    "bearer": "Bearer Token",
    "basic": "Basic 认证"
  },
  "bearerToken": {
    "placeholder": "输入 Bearer Token"
  },
  "basicAuth": {
    "username": "用户名",
    "password": "密码",
    "usernamePlaceholder": "用户名",
    "passwordPlaceholder": "密码"
  },
  "kv": {
    "keyPlaceholder": "键",
    "valuePlaceholder": "值"
  },
  "bodyPlaceholder": "输入请求体...",
  "response": {
    "title": "响应",
    "emptyState": "输入 URL 并点击发送开始测试",
    "tabs": {
      "body": "响应体",
      "headers": "响应头",
      "cookies": "Cookies",
      "timing": "耗时",
      "redirects": "重定向"
    },
    "status": "状态",
    "time": "耗时",
    "size": "大小",
    "type": "类型",
    "download": "下载",
    "copyBody": "复制响应体",
    "pretty": "格式化",
    "raw": "原始",
    "largeResponseWarning": "响应超过 1MB，仅显示前 100KB。",
    "noHeaders": "无响应头",
    "noCookies": "无可访问的 Cookie",
    "cookieNote": "Cookie 仅在同源请求或服务器通过 CORS 暴露 Set-Cookie 时可见。",
    "timingNote": "详细耗时（TTFB、下载）仅在服务器返回 Timing-Allow-Origin 头时可用。",
    "ttfb": "首字节时间",
    "download": "下载",
    "total": "总计",
    "na": "不可用",
    "crossOrigin": "（跨域）",
    "redirectOccurred": "发生了重定向",
    "noRedirect": "无重定向",
    "finalUrl": "最终 URL",
    "redirectNote": "浏览器 fetch 不暴露中间重定向 URL，仅显示最终地址。",
    "binaryPreview": "二进制响应 — 十六进制预览（前 4KB）"
  },
  "error": {
    "cors": "CORS 策略阻止了此请求。目标 API 不允许来自浏览器的跨域请求。",
    "network": "网络错误",
    "timeout": "请求在 {timeout} 秒后超时。",
    "generic": "请求失败"
  },
  "history": {
    "title": "历史记录",
    "clear": "清空历史",
    "empty": "暂无历史记录",
    "ago": {
      "seconds": "{count} 秒前",
      "minutes": "{count} 分钟前",
      "hours": "{count} 小时前",
      "days": "{count} 天前"
    }
  },
  "description": {
    "text": "一个轻量级的浏览器端 HTTP 客户端，用于测试 REST API。可以自由配置请求方法、请求头、请求体和认证方式，发送请求后查看响应的耗时详情、响应头和 Cookie。所有请求通过浏览器 fetch() 执行，因此仅支持允许 CORS 的 API。数据不会发送到任何服务器。",
    "features": {
      "title": "功能特性",
      "methods": "所有标准 HTTP 方法：GET、POST、PUT、PATCH、DELETE、HEAD、OPTIONS",
      "auth": "认证方式：Bearer Token、Basic 认证",
      "body": "请求体格式：JSON、表单数据、x-www-form-urlencoded、原始文本",
      "response": "响应检查：格式化响应体、响应头、Cookie、耗时、重定向信息",
      "history": "请求历史记录，一键恢复（本地存储）"
    },
    "cors": {
      "title": "CORS 限制",
      "text": "本工具使用浏览器原生 fetch() API。跨域请求需要目标服务器包含正确的 CORS 响应头（Access-Control-Allow-Origin）。如果服务器不支持 CORS，请求将因 CORS 错误而失败。这是浏览器安全特性，无法在没有代理服务器的情况下绕过。"
    }
  }
}
```

- [ ] **Step 2: Create zh-TW translations**

```json
{
  "url": {
    "placeholder": "https://api.example.com/users"
  },
  "method": {
    "label": "請求方法"
  },
  "timeout": {
    "label": "逾時時間"
  },
  "send": "傳送",
  "sending": "傳送中...",
  "tabs": {
    "params": "參數",
    "headers": "請求標頭",
    "body": "請求主體",
    "auth": "認證"
  },
  "bodyType": {
    "none": "無",
    "json": "JSON",
    "form-data": "表單資料",
    "urlencoded": "x-www-form-urlencoded",
    "raw": "原始文字"
  },
  "authType": {
    "none": "無",
    "bearer": "Bearer Token",
    "basic": "Basic 認證"
  },
  "bearerToken": {
    "placeholder": "輸入 Bearer Token"
  },
  "basicAuth": {
    "username": "使用者名稱",
    "password": "密碼",
    "usernamePlaceholder": "使用者名稱",
    "passwordPlaceholder": "密碼"
  },
  "kv": {
    "keyPlaceholder": "鍵",
    "valuePlaceholder": "值"
  },
  "bodyPlaceholder": "輸入請求主體...",
  "response": {
    "title": "回應",
    "emptyState": "輸入 URL 並點擊傳送開始測試",
    "tabs": {
      "body": "回應主體",
      "headers": "回應標頭",
      "cookies": "Cookies",
      "timing": "耗時",
      "redirects": "重新導向"
    },
    "status": "狀態",
    "time": "耗時",
    "size": "大小",
    "type": "類型",
    "download": "下載",
    "copyBody": "複製回應主體",
    "pretty": "格式化",
    "raw": "原始",
    "largeResponseWarning": "回應超過 1MB，僅顯示前 100KB。",
    "noHeaders": "無回應標頭",
    "noCookies": "無可存取的 Cookie",
    "cookieNote": "Cookie 僅在同源請求或伺服器透過 CORS 暴露 Set-Cookie 時可見。",
    "timingNote": "詳細耗時（TTFB、下載）僅在伺服器回傳 Timing-Allow-Origin 標頭時可用。",
    "ttfb": "首字元組時間",
    "download": "下載",
    "total": "總計",
    "na": "不適用",
    "crossOrigin": "（跨域）",
    "redirectOccurred": "發生了重新導向",
    "noRedirect": "無重新導向",
    "finalUrl": "最終 URL",
    "redirectNote": "瀏覽器 fetch 不暴露中間重新導向 URL，僅顯示最終位址。",
    "binaryPreview": "二進位回應 — 十六進位預覽（前 4KB）"
  },
  "error": {
    "cors": "CORS 政策阻擋了此請求。目標 API 不允許來自瀏覽器的跨域請求。",
    "network": "網路錯誤",
    "timeout": "請求在 {timeout} 秒後逾時。",
    "generic": "請求失敗"
  },
  "history": {
    "title": "歷史紀錄",
    "clear": "清空歷史",
    "empty": "暫無歷史紀錄",
    "ago": {
      "seconds": "{count} 秒前",
      "minutes": "{count} 分鐘前",
      "hours": "{count} 小時前",
      "days": "{count} 天前"
    }
  },
  "description": {
    "text": "一個輕量級的瀏覽器端 HTTP 用戶端，用於測試 REST API。可以自由配置請求方法、請求標頭、請求主體和認證方式，傳送請求後查看回應的耗時詳情、回應標頭和 Cookie。所有請求透過瀏覽器 fetch() 執行，因此僅支援允許 CORS 的 API。資料不會傳送到任何伺服器。",
    "features": {
      "title": "功能特性",
      "methods": "所有標準 HTTP 方法：GET、POST、PUT、PATCH、DELETE、HEAD、OPTIONS",
      "auth": "認證方式：Bearer Token、Basic 認證",
      "body": "請求主體格式：JSON、表單資料、x-www-form-urlencoded、原始文字",
      "response": "回應檢查：格式化回應主體、回應標頭、Cookie、耗時、重新導向資訊",
      "history": "請求歷史紀錄，一鍵還原（本機儲存）"
    },
    "cors": {
      "title": "CORS 限制",
      "text": "本工具使用瀏覽器原生 fetch() API。跨域請求需要目標伺服器包含正確的 CORS 回應標頭（Access-Control-Allow-Origin）。如果伺服器不支援 CORS，請求將因 CORS 錯誤而失敗。這是瀏覽器安全特性，無法在沒有代理伺服器的情況下繞過。"
    }
  }
}
```

- [ ] **Step 3: Create ja translations**

```json
{
  "url": {
    "placeholder": "https://api.example.com/users"
  },
  "method": {
    "label": "メソッド"
  },
  "timeout": {
    "label": "タイムアウト"
  },
  "send": "送信",
  "sending": "送信中...",
  "tabs": {
    "params": "パラメータ",
    "headers": "ヘッダー",
    "body": "ボディ",
    "auth": "認証"
  },
  "bodyType": {
    "none": "なし",
    "json": "JSON",
    "form-data": "フォームデータ",
    "urlencoded": "x-www-form-urlencoded",
    "raw": "Raw"
  },
  "authType": {
    "none": "なし",
    "bearer": "Bearer Token",
    "basic": "Basic 認証"
  },
  "bearerToken": {
    "placeholder": "Bearer トークンを入力"
  },
  "basicAuth": {
    "username": "ユーザー名",
    "password": "パスワード",
    "usernamePlaceholder": "ユーザー名",
    "passwordPlaceholder": "パスワード"
  },
  "kv": {
    "keyPlaceholder": "キー",
    "valuePlaceholder": "値"
  },
  "bodyPlaceholder": "リクエストボディを入力...",
  "response": {
    "title": "レスポンス",
    "emptyState": "URL を入力して送信をクリックしてください",
    "tabs": {
      "body": "ボディ",
      "headers": "ヘッダー",
      "cookies": "Cookies",
      "timing": "タイミング",
      "redirects": "リダイレクト"
    },
    "status": "ステータス",
    "time": "時間",
    "size": "サイズ",
    "type": "タイプ",
    "download": "ダウンロード",
    "copyBody": "ボディをコピー",
    "pretty": "整形",
    "raw": "Raw",
    "largeResponseWarning": "レスポンスが 1MB を超えています。最初の 100KB のみ表示しています。",
    "noHeaders": "レスポンスヘッダーなし",
    "noCookies": "アクセス可能な Cookie なし",
    "cookieNote": "Cookie は同一オリジンリクエスト、またはサーバーが CORS 経由で Set-Cookie を公開している場合にのみ表示されます。",
    "timingNote": "詳細なタイミング（TTFB、ダウンロード）は、サーバーが Timing-Allow-Origin ヘッダーを返した場合にのみ利用可能です。",
    "ttfb": "TTFB",
    "download": "ダウンロード",
    "total": "合計",
    "na": "N/A",
    "crossOrigin": "（クロスオリジン）",
    "redirectOccurred": "リダイレクトが発生しました",
    "noRedirect": "リダイレクトなし",
    "finalUrl": "最終 URL",
    "redirectNote": "ブラウザの fetch は中間リダイレクト URL を公開しません。最終宛先のみ表示されます。",
    "binaryPreview": "バイナリレスポンス — hex ダンププレビュー（先頭 4KB）"
  },
  "error": {
    "cors": "CORS ポリシーによりこのリクエストがブロックされました。対象 API はブラウザからのクロスオリジンリクエストを許可していません。",
    "network": "ネットワークエラー",
    "timeout": "{timeout} 秒後にリクエストがタイムアウトしました。",
    "generic": "リクエスト失敗"
  },
  "history": {
    "title": "履歴",
    "clear": "履歴をクリア",
    "empty": "履歴なし",
    "ago": {
      "seconds": "{count}秒前",
      "minutes": "{count}分前",
      "hours": "{count}時間前",
      "days": "{count}日前"
    }
  },
  "description": {
    "text": "ブラウザベースの軽量 HTTP クライアントで、REST API のテストに最適。メソッド、ヘッダー、ボディ、認証を自由に設定してリクエストを送信し、タイミング、ヘッダー、Cookie を含むレスポンスを確認できます。すべてのリクエストはブラウザの fetch() で実行されるため、CORS 対応の API のみサポートしています。データはサーバーに送信されません。",
    "features": {
      "title": "機能",
      "methods": "全標準 HTTP メソッド：GET、POST、PUT、PATCH、DELETE、HEAD、OPTIONS",
      "auth": "認証：Bearer Token、Basic 認証",
      "body": "リクエストボディ形式：JSON、フォームデータ、x-www-form-urlencoded、Raw テキスト",
      "response": "レスポンス検査：整形ボディ、ヘッダー、Cookie、タイミング、リダイレクト情報",
      "history": "リクエスト履歴をワンクリックで復元（ローカル保存）"
    },
    "cors": {
      "title": "CORS の制限",
      "text": "このツールはブラウザネイティブの fetch() API を使用します。クロスオリジンリクエストには、対象サーバーが適切な CORS ヘッダー（Access-Control-Allow-Origin）を含める必要があります。サーバーが CORS をサポートしていない場合、リクエストは CORS エラーで失敗します。これはブラウザのセキュリティ機能であり、プロキシサーバーなしでは回避できません。"
    }
  }
}
```

- [ ] **Step 4: Create ko translations**

```json
{
  "url": {
    "placeholder": "https://api.example.com/users"
  },
  "method": {
    "label": "메서드"
  },
  "timeout": {
    "label": "시간 초과"
  },
  "send": "보내기",
  "sending": "전송 중...",
  "tabs": {
    "params": "매개변수",
    "headers": "헤더",
    "body": "본문",
    "auth": "인증"
  },
  "bodyType": {
    "none": "없음",
    "json": "JSON",
    "form-data": "폼 데이터",
    "urlencoded": "x-www-form-urlencoded",
    "raw": "Raw"
  },
  "authType": {
    "none": "없음",
    "bearer": "Bearer Token",
    "basic": "Basic 인증"
  },
  "bearerToken": {
    "placeholder": "Bearer 토큰 입력"
  },
  "basicAuth": {
    "username": "사용자 이름",
    "password": "비밀번호",
    "usernamePlaceholder": "사용자 이름",
    "passwordPlaceholder": "비밀번호"
  },
  "kv": {
    "keyPlaceholder": "키",
    "valuePlaceholder": "값"
  },
  "bodyPlaceholder": "요청 본문을 입력하세요...",
  "response": {
    "title": "응답",
    "emptyState": "URL을 입력하고 보내기를 클릭하세요",
    "tabs": {
      "body": "본문",
      "headers": "헤더",
      "cookies": "Cookies",
      "timing": "타이밍",
      "redirects": "리다이렉트"
    },
    "status": "상태",
    "time": "시간",
    "size": "크기",
    "type": "유형",
    "download": "다운로드",
    "copyBody": "본문 복사",
    "pretty": "포맷",
    "raw": "Raw",
    "largeResponseWarning": "응답이 1MB를 초과합니다. 처음 100KB만 표시합니다.",
    "noHeaders": "응답 헤더 없음",
    "noCookies": "접근 가능한 쿠키 없음",
    "cookieNote": "Cookie는 동일 출처 요청이거나 서버가 CORS를 통해 Set-Cookie를 노출하는 경우에만 볼 수 있습니다.",
    "timingNote": "상세 타이밍(TTFB, 다운로드)은 서버가 Timing-Allow-Origin 헤더를 반환할 때만 사용할 수 있습니다.",
    "ttfb": "TTFB",
    "download": "다운로드",
    "total": "총계",
    "na": "N/A",
    "crossOrigin": "(크로스 오리진)",
    "redirectOccurred": "리다이렉트가 발생했습니다",
    "noRedirect": "리다이렉트 없음",
    "finalUrl": "최종 URL",
    "redirectNote": "브라우저 fetch는 중간 리다이렉트 URL을 노출하지 않습니다. 최종 목적지만 표시됩니다.",
    "binaryPreview": "바이너리 응답 — hex 덤프 미리보기 (처음 4KB)"
  },
  "error": {
    "cors": "CORS 정책이 이 요청을 차단했습니다. 대상 API가 브라우저의 크로스 오리진 요청을 허용하지 않습니다.",
    "network": "네트워크 오류",
    "timeout": "{timeout}초 후 요청이 시간 초과되었습니다.",
    "generic": "요청 실패"
  },
  "history": {
    "title": "기록",
    "clear": "기록 삭제",
    "empty": "기록 없음",
    "ago": {
      "seconds": "{count}초 전",
      "minutes": "{count}분 전",
      "hours": "{count}시간 전",
      "days": "{count}일 전"
    }
  },
  "description": {
    "text": "브라우저 기반의 가벼운 HTTP 클라이언트로 REST API 테스트에 적합합니다. 메서드, 헤더, 본문, 인증을 자유롭게 설정하여 요청을 보내고, 타이밍, 헤더, 쿠키가 포함된 응답을 확인할 수 있습니다. 모든 요청은 브라우저 fetch()로 실행되므로 CORS를 지원하는 API만 사용할 수 있습니다. 데이터는 서버로 전송되지 않습니다.",
    "features": {
      "title": "기능",
      "methods": "모든 표준 HTTP 메서드: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS",
      "auth": "인증: Bearer Token, Basic 인증",
      "body": "요청 본문 형식: JSON, 폼 데이터, x-www-form-urlencoded, Raw 텍스트",
      "response": "응답 검사: 포맷된 본문, 헤더, 쿠키, 타이밍, 리다이렉트 정보",
      "history": "요청 기록을 원클릭으로 복원 (로컬 저장)"
    },
    "cors": {
      "title": "CORS 제한",
      "text": "이 도구는 브라우저 네이티브 fetch() API를 사용합니다. 크로스 오리진 요청을 하려면 대상 서버가 적절한 CORS 헤더(Access-Control-Allow-Origin)를 포함해야 합니다. 서버가 CORS를 지원하지 않으면 CORS 오류로 요청이 실패합니다. 이는 브라우저 보안 기능이며 프록시 서버 없이는 우회할 수 없습니다."
    }
  }
}
```

- [ ] **Step 5: Add httpclient entries to CJK tools.json files**

For **zh-CN** — insert before `"categories"`:

```json
  "httpclient": {
    "title": "HTTP 客户端 - 在线 REST API 测试工具",
    "shortTitle": "HTTP 客户端",
    "description": "在浏览器中直接发送 HTTP 请求，测试 REST API。支持 GET、POST、PUT、DELETE，可配置请求头、请求体和认证。免费，数据不上传服务器。",
    "searchTerms": "httpkehuduan hkt rest api"
  },
```

For **zh-TW** — insert before `"categories"`:

```json
  "httpclient": {
    "title": "HTTP 用戶端 - 線上 REST API 測試工具",
    "shortTitle": "HTTP 用戶端",
    "description": "在瀏覽器中直接傳送 HTTP 請求，測試 REST API。支援 GET、POST、PUT、DELETE，可設定請求標頭、請求主體和認證。免費，資料不上傳伺服器。",
    "searchTerms": "httpkehuduan hkt rest api"
  },
```

For **ja** — insert before `"categories"`:

```json
  "httpclient": {
    "title": "HTTP クライアント - オンライン REST API テスター",
    "shortTitle": "HTTP クライアント",
    "description": "ブラウザで直接 HTTP リクエストを送信し、REST API をテスト。GET、POST、PUT、DELETE に対応。ヘッダー、ボディ、認証を設定可能。無料、データはサーバーに送信されません。",
    "searchTerms": "httpkuraianto hk rest api"
  },
```

For **ko** — insert before `"categories"`:

```json
  "httpclient": {
    "title": "HTTP 클라이언트 - 온라인 REST API 테스터",
    "shortTitle": "HTTP 클라이언트",
    "description": "브라우저에서 직접 HTTP 요청을 보내 REST API를 테스트하세요. GET, POST, PUT, DELETE 지원. 헤더, 본문, 인증 설정 가능. 무료, 서버에 데이터 전송 없음.",
    "searchTerms": "httpkeulaieondu hk rest api"
  },
```

- [ ] **Step 6: Validate all JSON files**

Run: `node -e "['zh-CN','zh-TW','ja','ko'].forEach(l=>{JSON.parse(require('fs').readFileSync('public/locales/'+l+'/httpclient.json','utf8'));JSON.parse(require('fs').readFileSync('public/locales/'+l+'/tools.json','utf8'))});console.log('OK')"`
Expected: `OK`

- [ ] **Step 7: Commit**

```bash
git add public/locales/zh-CN/httpclient.json public/locales/zh-CN/tools.json public/locales/zh-TW/httpclient.json public/locales/zh-TW/tools.json public/locales/ja/httpclient.json public/locales/ja/tools.json public/locales/ko/httpclient.json public/locales/ko/tools.json
git commit -m "feat(httpclient): add CJK locale translations (zh-CN, zh-TW, ja, ko)"
```

---

### Task 3: Latin-script i18n — es, pt-BR, fr, de, ru

**Files:**

- Create: `public/locales/es/httpclient.json`
- Create: `public/locales/pt-BR/httpclient.json`
- Create: `public/locales/fr/httpclient.json`
- Create: `public/locales/de/httpclient.json`
- Create: `public/locales/ru/httpclient.json`
- Modify: `public/locales/es/tools.json`
- Modify: `public/locales/pt-BR/tools.json`
- Modify: `public/locales/fr/tools.json`
- Modify: `public/locales/de/tools.json`
- Modify: `public/locales/ru/tools.json`

- [ ] **Step 1: Create es translations**

```json
{
  "url": {
    "placeholder": "https://api.example.com/users"
  },
  "method": {
    "label": "Método"
  },
  "timeout": {
    "label": "Tiempo de espera"
  },
  "send": "Enviar",
  "sending": "Enviando...",
  "tabs": {
    "params": "Parámetros",
    "headers": "Cabeceras",
    "body": "Cuerpo",
    "auth": "Autenticación"
  },
  "bodyType": {
    "none": "ninguno",
    "json": "JSON",
    "form-data": "Form-Data",
    "urlencoded": "x-www-form-urlencoded",
    "raw": "Raw"
  },
  "authType": {
    "none": "ninguno",
    "bearer": "Bearer Token",
    "basic": "Autenticación Basic"
  },
  "bearerToken": {
    "placeholder": "Introduce el token Bearer"
  },
  "basicAuth": {
    "username": "Usuario",
    "password": "Contraseña",
    "usernamePlaceholder": "Usuario",
    "passwordPlaceholder": "Contraseña"
  },
  "kv": {
    "keyPlaceholder": "Clave",
    "valuePlaceholder": "Valor"
  },
  "bodyPlaceholder": "Introduce el cuerpo de la petición...",
  "response": {
    "title": "Respuesta",
    "emptyState": "Introduce una URL y haz clic en Enviar para empezar",
    "tabs": {
      "body": "Cuerpo",
      "headers": "Cabeceras",
      "cookies": "Cookies",
      "timing": "Tiempos",
      "redirects": "Redirecciones"
    },
    "status": "Estado",
    "time": "Tiempo",
    "size": "Tamaño",
    "type": "Tipo",
    "download": "Descargar",
    "copyBody": "Copiar cuerpo",
    "pretty": "Formateado",
    "raw": "Raw",
    "largeResponseWarning": "La respuesta supera 1MB. Se muestran solo los primeros 100KB.",
    "noHeaders": "Sin cabeceras de respuesta",
    "noCookies": "No hay cookies accesibles",
    "cookieNote": "Las cookies solo son visibles en solicitudes del mismo origen o cuando el servidor expone Set-Cookie mediante cabeceras CORS.",
    "timingNote": "Los tiempos detallados (TTFB, descarga) solo están disponibles cuando el servidor devuelve la cabecera Timing-Allow-Origin.",
    "ttfb": "TTFB",
    "download": "Descarga",
    "total": "Total",
    "na": "N/A",
    "crossOrigin": "(origen cruzado)",
    "redirectOccurred": "Ocurrió una redirección",
    "noRedirect": "Sin redirecciones",
    "finalUrl": "URL final",
    "redirectNote": "El fetch del navegador no expone las URLs de redirección intermedias. Solo se muestra el destino final.",
    "binaryPreview": "Respuesta binaria — vista previa hex (primeros 4KB)"
  },
  "error": {
    "cors": "La política CORS bloqueó esta solicitud. La API de destino no permite solicitudes de origen cruzado desde navegadores.",
    "network": "Error de red",
    "timeout": "La solicitud superó el tiempo de espera de {timeout}s.",
    "generic": "Error en la solicitud"
  },
  "history": {
    "title": "Historial",
    "clear": "Borrar historial",
    "empty": "Sin historial",
    "ago": {
      "seconds": "hace {count}s",
      "minutes": "hace {count}min",
      "hours": "hace {count}h",
      "days": "hace {count}d"
    }
  },
  "description": {
    "text": "Un cliente HTTP ligero basado en navegador para probar APIs REST. Configura y envía solicitudes con control total sobre método, cabeceras, cuerpo y autenticación, luego inspecciona las respuestas con detalles de tiempos, cabeceras y cookies. Todas las solicitudes se ejecutan mediante fetch() del navegador, por lo que solo se admiten APIs compatibles con CORS. No se envían datos a ningún servidor.",
    "features": {
      "title": "Características",
      "methods": "Todos los métodos HTTP estándar: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS",
      "auth": "Autenticación: Bearer Token, Autenticación Basic",
      "body": "Formatos de cuerpo: JSON, Form-Data, x-www-form-urlencoded, texto Raw",
      "response": "Inspección de respuesta: cuerpo formateado, cabeceras, cookies, tiempos, redirecciones",
      "history": "Historial de solicitudes con restauración en un clic (almacenado localmente)"
    },
    "cors": {
      "title": "Limitaciones de CORS",
      "text": "Esta herramienta utiliza la API fetch() nativa del navegador. Las solicitudes de origen cruzado requieren que el servidor de destino incluya las cabeceras CORS adecuadas (Access-Control-Allow-Origin). Si el servidor no admite CORS, la solicitud fallará con un error CORS. Esta es una función de seguridad del navegador y no se puede eludir sin un servidor proxy."
    }
  }
}
```

- [ ] **Step 2: Create pt-BR translations**

```json
{
  "url": {
    "placeholder": "https://api.example.com/users"
  },
  "method": {
    "label": "Método"
  },
  "timeout": {
    "label": "Tempo limite"
  },
  "send": "Enviar",
  "sending": "Enviando...",
  "tabs": {
    "params": "Parâmetros",
    "headers": "Cabeçalhos",
    "body": "Corpo",
    "auth": "Autenticação"
  },
  "bodyType": {
    "none": "nenhum",
    "json": "JSON",
    "form-data": "Form-Data",
    "urlencoded": "x-www-form-urlencoded",
    "raw": "Raw"
  },
  "authType": {
    "none": "nenhum",
    "bearer": "Bearer Token",
    "basic": "Autenticação Basic"
  },
  "bearerToken": {
    "placeholder": "Insira o token Bearer"
  },
  "basicAuth": {
    "username": "Usuário",
    "password": "Senha",
    "usernamePlaceholder": "Usuário",
    "passwordPlaceholder": "Senha"
  },
  "kv": {
    "keyPlaceholder": "Chave",
    "valuePlaceholder": "Valor"
  },
  "bodyPlaceholder": "Insira o corpo da requisição...",
  "response": {
    "title": "Resposta",
    "emptyState": "Insira uma URL e clique em Enviar para começar",
    "tabs": {
      "body": "Corpo",
      "headers": "Cabeçalhos",
      "cookies": "Cookies",
      "timing": "Tempos",
      "redirects": "Redirecionamentos"
    },
    "status": "Status",
    "time": "Tempo",
    "size": "Tamanho",
    "type": "Tipo",
    "download": "Baixar",
    "copyBody": "Copiar corpo",
    "pretty": "Formatado",
    "raw": "Raw",
    "largeResponseWarning": "A resposta excede 1MB. Exibindo apenas os primeiros 100KB.",
    "noHeaders": "Sem cabeçalhos de resposta",
    "noCookies": "Nenhum cookie acessível",
    "cookieNote": "Cookies só são visíveis em requisições de mesma origem ou quando o servidor expõe Set-Cookie via cabeçalhos CORS.",
    "timingNote": "Tempos detalhados (TTFB, download) só estão disponíveis quando o servidor retorna o cabeçalho Timing-Allow-Origin.",
    "ttfb": "TTFB",
    "download": "Download",
    "total": "Total",
    "na": "N/A",
    "crossOrigin": "(origem cruzada)",
    "redirectOccurred": "Ocorreu um redirecionamento",
    "noRedirect": "Sem redirecionamentos",
    "finalUrl": "URL final",
    "redirectNote": "O fetch do navegador não expõe URLs de redirecionamento intermediárias. Apenas o destino final é exibido.",
    "binaryPreview": "Resposta binária — pré-visualização hex (primeiros 4KB)"
  },
  "error": {
    "cors": "A política CORS bloqueou esta requisição. A API de destino não permite requisições de origem cruzada de navegadores.",
    "network": "Erro de rede",
    "timeout": "A requisição excedeu o tempo limite de {timeout}s.",
    "generic": "Falha na requisição"
  },
  "history": {
    "title": "Histórico",
    "clear": "Limpar histórico",
    "empty": "Sem histórico",
    "ago": {
      "seconds": "{count}s atrás",
      "minutes": "{count}min atrás",
      "hours": "{count}h atrás",
      "days": "{count}d atrás"
    }
  },
  "description": {
    "text": "Um cliente HTTP leve baseado em navegador para testar APIs REST. Configure e envie requisições com controle total sobre método, cabeçalhos, corpo e autenticação, depois inspecione as respostas com detalhes de tempo, cabeçalhos e cookies. Todas as requisições são executadas via fetch() do navegador, portanto apenas APIs compatíveis com CORS são suportadas. Nenhum dado é enviado a servidores.",
    "features": {
      "title": "Recursos",
      "methods": "Todos os métodos HTTP padrão: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS",
      "auth": "Autenticação: Bearer Token, Autenticação Basic",
      "body": "Formatos de corpo: JSON, Form-Data, x-www-form-urlencoded, texto Raw",
      "response": "Inspeção de resposta: corpo formatado, cabeçalhos, cookies, tempos, redirecionamentos",
      "history": "Histórico de requisições com restauração em um clique (armazenado localmente)"
    },
    "cors": {
      "title": "Limitações do CORS",
      "text": "Esta ferramenta usa a API fetch() nativa do navegador. Requisições de origem cruzada exigem que o servidor de destino inclua cabeçalhos CORS adequados (Access-Control-Allow-Origin). Se o servidor não suportar CORS, a requisição falhará com um erro CORS. Este é um recurso de segurança do navegador e não pode ser contornado sem um servidor proxy."
    }
  }
}
```

- [ ] **Step 3: Create fr translations**

```json
{
  "url": {
    "placeholder": "https://api.example.com/users"
  },
  "method": {
    "label": "Méthode"
  },
  "timeout": {
    "label": "Délai d'attente"
  },
  "send": "Envoyer",
  "sending": "Envoi en cours...",
  "tabs": {
    "params": "Paramètres",
    "headers": "En-têtes",
    "body": "Corps",
    "auth": "Authentification"
  },
  "bodyType": {
    "none": "aucun",
    "json": "JSON",
    "form-data": "Form-Data",
    "urlencoded": "x-www-form-urlencoded",
    "raw": "Brut"
  },
  "authType": {
    "none": "aucune",
    "bearer": "Bearer Token",
    "basic": "Authentification Basic"
  },
  "bearerToken": {
    "placeholder": "Entrez le token Bearer"
  },
  "basicAuth": {
    "username": "Nom d'utilisateur",
    "password": "Mot de passe",
    "usernamePlaceholder": "Nom d'utilisateur",
    "passwordPlaceholder": "Mot de passe"
  },
  "kv": {
    "keyPlaceholder": "Clé",
    "valuePlaceholder": "Valeur"
  },
  "bodyPlaceholder": "Entrez le corps de la requête...",
  "response": {
    "title": "Réponse",
    "emptyState": "Entrez une URL et cliquez sur Envoyer pour commencer",
    "tabs": {
      "body": "Corps",
      "headers": "En-têtes",
      "cookies": "Cookies",
      "timing": "Chronométrage",
      "redirects": "Redirections"
    },
    "status": "Statut",
    "time": "Temps",
    "size": "Taille",
    "type": "Type",
    "download": "Télécharger",
    "copyBody": "Copier le corps",
    "pretty": "Formaté",
    "raw": "Brut",
    "largeResponseWarning": "La réponse dépasse 1 Mo. Seuls les premiers 100 Ko sont affichés.",
    "noHeaders": "Aucun en-tête de réponse",
    "noCookies": "Aucun cookie accessible",
    "cookieNote": "Les cookies ne sont visibles que pour les requêtes de même origine ou lorsque le serveur expose Set-Cookie via les en-têtes CORS.",
    "timingNote": "Le chronométrage détaillé (TTFB, téléchargement) n'est disponible que lorsque le serveur renvoie l'en-tête Timing-Allow-Origin.",
    "ttfb": "TTFB",
    "download": "Téléchargement",
    "total": "Total",
    "na": "N/A",
    "crossOrigin": "(origine croisée)",
    "redirectOccurred": "Une redirection a eu lieu",
    "noRedirect": "Aucune redirection",
    "finalUrl": "URL finale",
    "redirectNote": "Le fetch du navigateur n'expose pas les URLs de redirection intermédiaires. Seule la destination finale est affichée.",
    "binaryPreview": "Réponse binaire — aperçu hex (4 premiers Ko)"
  },
  "error": {
    "cors": "La politique CORS a bloqué cette requête. L'API cible n'autorise pas les requêtes cross-origin depuis les navigateurs.",
    "network": "Erreur réseau",
    "timeout": "La requête a expiré après {timeout}s.",
    "generic": "Échec de la requête"
  },
  "history": {
    "title": "Historique",
    "clear": "Effacer l'historique",
    "empty": "Aucun historique",
    "ago": {
      "seconds": "il y a {count}s",
      "minutes": "il y a {count}min",
      "hours": "il y a {count}h",
      "days": "il y a {count}j"
    }
  },
  "description": {
    "text": "Un client HTTP léger basé sur le navigateur pour tester les APIs REST. Composez et envoyez des requêtes avec un contrôle total sur la méthode, les en-têtes, le corps et l'authentification, puis inspectez les réponses avec les détails de chronométrage, les en-têtes et les cookies. Toutes les requêtes s'exécutent via fetch() du navigateur, seules les APIs compatibles CORS sont prises en charge. Aucune donnée n'est envoyée à un serveur.",
    "features": {
      "title": "Fonctionnalités",
      "methods": "Toutes les méthodes HTTP standard : GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS",
      "auth": "Authentification : Bearer Token, Authentification Basic",
      "body": "Formats de corps : JSON, Form-Data, x-www-form-urlencoded, texte brut",
      "response": "Inspection de la réponse : corps formaté, en-têtes, cookies, chronométrage, redirections",
      "history": "Historique des requêtes avec restauration en un clic (stocké localement)"
    },
    "cors": {
      "title": "Limitations CORS",
      "text": "Cet outil utilise l'API fetch() native du navigateur. Les requêtes cross-origin nécessitent que le serveur cible inclue les en-têtes CORS appropriés (Access-Control-Allow-Origin). Si le serveur ne prend pas en charge CORS, la requête échouera avec une erreur CORS. Il s'agit d'une fonctionnalité de sécurité du navigateur qui ne peut être contournée sans serveur proxy."
    }
  }
}
```

- [ ] **Step 4: Create de translations**

```json
{
  "url": {
    "placeholder": "https://api.example.com/users"
  },
  "method": {
    "label": "Methode"
  },
  "timeout": {
    "label": "Zeitlimit"
  },
  "send": "Senden",
  "sending": "Senden...",
  "tabs": {
    "params": "Parameter",
    "headers": "Header",
    "body": "Body",
    "auth": "Authentifizierung"
  },
  "bodyType": {
    "none": "keiner",
    "json": "JSON",
    "form-data": "Form-Data",
    "urlencoded": "x-www-form-urlencoded",
    "raw": "Raw"
  },
  "authType": {
    "none": "keine",
    "bearer": "Bearer Token",
    "basic": "Basic Auth"
  },
  "bearerToken": {
    "placeholder": "Bearer-Token eingeben"
  },
  "basicAuth": {
    "username": "Benutzername",
    "password": "Passwort",
    "usernamePlaceholder": "Benutzername",
    "passwordPlaceholder": "Passwort"
  },
  "kv": {
    "keyPlaceholder": "Schlüssel",
    "valuePlaceholder": "Wert"
  },
  "bodyPlaceholder": "Request-Body eingeben...",
  "response": {
    "title": "Antwort",
    "emptyState": "URL eingeben und auf Senden klicken",
    "tabs": {
      "body": "Body",
      "headers": "Header",
      "cookies": "Cookies",
      "timing": "Zeitmessung",
      "redirects": "Weiterleitungen"
    },
    "status": "Status",
    "time": "Zeit",
    "size": "Größe",
    "type": "Typ",
    "download": "Herunterladen",
    "copyBody": "Body kopieren",
    "pretty": "Formatiert",
    "raw": "Raw",
    "largeResponseWarning": "Antwort ist größer als 1MB. Es werden nur die ersten 100KB angezeigt.",
    "noHeaders": "Keine Antwort-Header",
    "noCookies": "Keine zugänglichen Cookies",
    "cookieNote": "Cookies sind nur bei Same-Origin-Anfragen sichtbar oder wenn der Server Set-Cookie über CORS-Header freigibt.",
    "timingNote": "Detaillierte Zeitmessung (TTFB, Download) ist nur verfügbar, wenn der Server den Timing-Allow-Origin-Header zurückgibt.",
    "ttfb": "TTFB",
    "download": "Download",
    "total": "Gesamt",
    "na": "N/A",
    "crossOrigin": "(Cross-Origin)",
    "redirectOccurred": "Eine Weiterleitung hat stattgefunden",
    "noRedirect": "Keine Weiterleitungen",
    "finalUrl": "Endgültige URL",
    "redirectNote": "Der Browser-fetch zeigt keine zwischenzeitlichen Weiterleitungs-URLs an. Nur das endgültige Ziel wird angezeigt.",
    "binaryPreview": "Binäre Antwort — Hex-Dump-Vorschau (erste 4KB)"
  },
  "error": {
    "cors": "Die CORS-Richtlinie hat diese Anfrage blockiert. Die Ziel-API erlaubt keine Cross-Origin-Anfragen aus Browsern.",
    "network": "Netzwerkfehler",
    "timeout": "Zeitlimit nach {timeout}s überschritten.",
    "generic": "Anfrage fehlgeschlagen"
  },
  "history": {
    "title": "Verlauf",
    "clear": "Verlauf löschen",
    "empty": "Kein Verlauf",
    "ago": {
      "seconds": "vor {count}s",
      "minutes": "vor {count}Min",
      "hours": "vor {count}Std",
      "days": "vor {count}T"
    }
  },
  "description": {
    "text": "Ein leichtgewichtiger, browserbasierter HTTP-Client zum Testen von REST-APIs. Stellen Sie Anfragen mit voller Kontrolle über Methode, Header, Body und Authentifizierung zusammen und senden Sie diese — dann inspizieren Sie die Antworten mit Timing-Details, Headern und Cookies. Alle Anfragen werden über das browser-native fetch() ausgeführt, daher werden nur CORS-kompatible APIs unterstützt. Keine Daten werden an Server gesendet.",
    "features": {
      "title": "Funktionen",
      "methods": "Alle Standard-HTTP-Methoden: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS",
      "auth": "Authentifizierung: Bearer Token, Basic Auth",
      "body": "Body-Formate: JSON, Form-Data, x-www-form-urlencoded, Raw-Text",
      "response": "Antwort-Inspektion: formatierter Body, Header, Cookies, Timing, Weiterleitungs-Info",
      "history": "Anfrageverlauf mit Ein-Klick-Wiederherstellung (lokal gespeichert)"
    },
    "cors": {
      "title": "CORS-Einschränkungen",
      "text": "Dieses Tool verwendet die native fetch()-API des Browsers. Cross-Origin-Anfragen erfordern, dass der Zielserver entsprechende CORS-Header (Access-Control-Allow-Origin) sendet. Wenn der Server CORS nicht unterstützt, schlägt die Anfrage mit einem CORS-Fehler fehl. Dies ist eine Browsersicherheitsfunktion und kann ohne Proxy-Server nicht umgangen werden."
    }
  }
}
```

- [ ] **Step 5: Create ru translations**

```json
{
  "url": {
    "placeholder": "https://api.example.com/users"
  },
  "method": {
    "label": "Метод"
  },
  "timeout": {
    "label": "Таймаут"
  },
  "send": "Отправить",
  "sending": "Отправка...",
  "tabs": {
    "params": "Параметры",
    "headers": "Заголовки",
    "body": "Тело",
    "auth": "Аутентификация"
  },
  "bodyType": {
    "none": "нет",
    "json": "JSON",
    "form-data": "Form-Data",
    "urlencoded": "x-www-form-urlencoded",
    "raw": "Raw"
  },
  "authType": {
    "none": "нет",
    "bearer": "Bearer Token",
    "basic": "Basic Auth"
  },
  "bearerToken": {
    "placeholder": "Введите Bearer токен"
  },
  "basicAuth": {
    "username": "Имя пользователя",
    "password": "Пароль",
    "usernamePlaceholder": "Имя пользователя",
    "passwordPlaceholder": "Пароль"
  },
  "kv": {
    "keyPlaceholder": "Ключ",
    "valuePlaceholder": "Значение"
  },
  "bodyPlaceholder": "Введите тело запроса...",
  "response": {
    "title": "Ответ",
    "emptyState": "Введите URL и нажмите Отправить",
    "tabs": {
      "body": "Тело",
      "headers": "Заголовки",
      "cookies": "Cookies",
      "timing": "Время",
      "redirects": "Перенаправления"
    },
    "status": "Статус",
    "time": "Время",
    "size": "Размер",
    "type": "Тип",
    "download": "Скачать",
    "copyBody": "Копировать тело",
    "pretty": "Формат.",
    "raw": "Raw",
    "largeResponseWarning": "Ответ превышает 1 МБ. Показаны первые 100 КБ.",
    "noHeaders": "Нет заголовков ответа",
    "noCookies": "Нет доступных cookies",
    "cookieNote": "Cookies доступны только для запросов с тем же источником или когда сервер предоставляет Set-Cookie через CORS-заголовки.",
    "timingNote": "Подробное время (TTFB, загрузка) доступно только когда сервер возвращает заголовок Timing-Allow-Origin.",
    "ttfb": "TTFB",
    "download": "Загрузка",
    "total": "Итого",
    "na": "Н/Д",
    "crossOrigin": "(кросс-домен)",
    "redirectOccurred": "Произошло перенаправление",
    "noRedirect": "Без перенаправлений",
    "finalUrl": "Итоговый URL",
    "redirectNote": "Browser fetch не показывает промежуточные URL перенаправлений. Отображается только конечный адрес.",
    "binaryPreview": "Бинарный ответ — hex-предпросмотр (первые 4 КБ)"
  },
  "error": {
    "cors": "Политика CORS заблокировала этот запрос. Целевой API не разрешает кросс-доменные запросы из браузера.",
    "network": "Сетевая ошибка",
    "timeout": "Время запроса истекло через {timeout}с.",
    "generic": "Ошибка запроса"
  },
  "history": {
    "title": "История",
    "clear": "Очистить историю",
    "empty": "История пуста",
    "ago": {
      "seconds": "{count}с назад",
      "minutes": "{count}мин назад",
      "hours": "{count}ч назад",
      "days": "{count}д назад"
    }
  },
  "description": {
    "text": "Легковесный HTTP-клиент на базе браузера для тестирования REST API. Настраивайте и отправляйте запросы с полным контролем метода, заголовков, тела и аутентификации, затем просматривайте ответы с данными о времени, заголовках и cookies. Все запросы выполняются через fetch() браузера, поэтому поддерживаются только CORS-совместимые API. Данные не отправляются на сервер.",
    "features": {
      "title": "Возможности",
      "methods": "Все стандартные HTTP-методы: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS",
      "auth": "Аутентификация: Bearer Token, Basic Auth",
      "body": "Форматы тела: JSON, Form-Data, x-www-form-urlencoded, Raw-текст",
      "response": "Инспекция ответа: форматированное тело, заголовки, cookies, время, перенаправления",
      "history": "История запросов с восстановлением в один клик (локальное хранение)"
    },
    "cors": {
      "title": "Ограничения CORS",
      "text": "Этот инструмент использует нативный fetch() API браузера. Для кросс-доменных запросов целевой сервер должен включать соответствующие CORS-заголовки (Access-Control-Allow-Origin). Если сервер не поддерживает CORS, запрос завершится ошибкой CORS. Это функция безопасности браузера, которую нельзя обойти без прокси-сервера."
    }
  }
}
```

- [ ] **Step 6: Add httpclient entries to Latin-script tools.json files**

For **es** — insert before `"categories"`:

```json
  "httpclient": {
    "title": "Cliente HTTP - Probador de APIs REST en línea",
    "shortTitle": "Cliente HTTP",
    "description": "Envía solicitudes HTTP y prueba APIs REST directamente en tu navegador. Soporta GET, POST, PUT, DELETE con cabeceras, cuerpo y autenticación. Gratis, sin enviar datos a servidores."
  },
```

For **pt-BR** — insert before `"categories"`:

```json
  "httpclient": {
    "title": "Cliente HTTP - Testador de APIs REST Online",
    "shortTitle": "Cliente HTTP",
    "description": "Envie requisições HTTP e teste APIs REST diretamente no seu navegador. Suporta GET, POST, PUT, DELETE com cabeçalhos, corpo e autenticação. Gratuito, sem enviar dados para servidores."
  },
```

For **fr** — insert before `"categories"`:

```json
  "httpclient": {
    "title": "Client HTTP - Testeur d'API REST en ligne",
    "shortTitle": "Client HTTP",
    "description": "Envoyez des requêtes HTTP et testez les APIs REST directement dans votre navigateur. Prend en charge GET, POST, PUT, DELETE avec en-têtes, corps et authentification. Gratuit, aucune donnée envoyée aux serveurs."
  },
```

For **de** — insert before `"categories"`:

```json
  "httpclient": {
    "title": "HTTP-Client - Online REST-API-Tester",
    "shortTitle": "HTTP-Client",
    "description": "Senden Sie HTTP-Anfragen und testen Sie REST-APIs direkt im Browser. Unterstützt GET, POST, PUT, DELETE mit Headern, Body und Authentifizierung. Kostenlos, keine Daten an Server gesendet."
  },
```

For **ru** — insert before `"categories"`:

```json
  "httpclient": {
    "title": "HTTP-клиент — Онлайн-тестер REST API",
    "shortTitle": "HTTP-клиент",
    "description": "Отправляйте HTTP-запросы и тестируйте REST API прямо в браузере. Поддержка GET, POST, PUT, DELETE с заголовками, телом и аутентификацией. Бесплатно, данные не отправляются на серверы.",
    "searchTerms": "httpklient hk rest api"
  },
```

- [ ] **Step 7: Validate all JSON files**

Run: `node -e "['es','pt-BR','fr','de','ru'].forEach(l=>{JSON.parse(require('fs').readFileSync('public/locales/'+l+'/httpclient.json','utf8'));JSON.parse(require('fs').readFileSync('public/locales/'+l+'/tools.json','utf8'))});console.log('OK')"`
Expected: `OK`

- [ ] **Step 8: Commit**

```bash
git add public/locales/es/httpclient.json public/locales/es/tools.json public/locales/pt-BR/httpclient.json public/locales/pt-BR/tools.json public/locales/fr/httpclient.json public/locales/fr/tools.json public/locales/de/httpclient.json public/locales/de/tools.json public/locales/ru/httpclient.json public/locales/ru/tools.json
git commit -m "feat(httpclient): add Latin-script locale translations (es, pt-BR, fr, de, ru)"
```

---

### Task 4: KeyValueEditor Component

**Files:**

- Create: `components/httpclient/key-value-editor.tsx`

- [ ] **Step 1: Create the KeyValueEditor component**

```tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Trash2 } from "lucide-react";
import type { KeyValue } from "../../libs/httpclient/types";

interface KeyValueEditorProps {
  pairs: KeyValue[];
  onChange: (pairs: KeyValue[]) => void;
  suggestions?: string[];
  keyPlaceholder?: string;
  valuePlaceholder?: string;
}

export function KeyValueEditor({
  pairs,
  onChange,
  suggestions,
  keyPlaceholder = "Key",
  valuePlaceholder = "Value",
}: KeyValueEditorProps) {
  const rows =
    pairs.length === 0 || pairs[pairs.length - 1].key !== "" || pairs[pairs.length - 1].value !== ""
      ? [...pairs, { key: "", value: "", enabled: true }]
      : pairs;

  function updateRow(index: number, field: keyof KeyValue, value: string | boolean) {
    const next = [...rows];
    next[index] = { ...next[index], [field]: value };
    onChange(next.filter((r, i) => i < next.length - 1 || r.key !== "" || r.value !== ""));
  }

  function removeRow(index: number) {
    const next = rows.filter((_, i) => i !== index);
    onChange(next.filter((r, i) => i < next.length - 1 || r.key !== "" || r.value !== ""));
  }

  return (
    <div className="space-y-2">
      {rows.map((row, index) => (
        <KVRow
          key={index}
          row={row}
          index={index}
          suggestions={suggestions}
          keyPlaceholder={keyPlaceholder}
          valuePlaceholder={valuePlaceholder}
          onUpdate={updateRow}
          onRemove={removeRow}
          isLast={index === rows.length - 1}
        />
      ))}
    </div>
  );
}

function KVRow({
  row,
  index,
  suggestions,
  keyPlaceholder,
  valuePlaceholder,
  onUpdate,
  onRemove,
  isLast,
}: {
  row: KeyValue;
  index: number;
  suggestions?: string[];
  keyPlaceholder: string;
  valuePlaceholder: string;
  onUpdate: (index: number, field: keyof KeyValue, value: string | boolean) => void;
  onRemove: (index: number) => void;
  isLast: boolean;
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filtered, setFiltered] = useState<string[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showSuggestions) return;
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showSuggestions]);

  function handleKeyChange(value: string) {
    onUpdate(index, "key", value);
    if (suggestions && value) {
      const lower = value.toLowerCase();
      setFiltered(suggestions.filter((s) => s.toLowerCase().includes(lower)));
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }

  function selectSuggestion(suggestion: string) {
    onUpdate(index, "key", suggestion);
    setShowSuggestions(false);
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={row.enabled}
        onChange={(e) => onUpdate(index, "enabled", e.target.checked)}
        className="w-4 h-4 rounded accent-[#06D6A0] bg-bg-input border-border-default cursor-pointer shrink-0"
      />
      <div ref={wrapRef} className="relative flex-1 min-w-0">
        <input
          type="text"
          value={row.key}
          onChange={(e) => handleKeyChange(e.target.value)}
          placeholder={keyPlaceholder}
          className="w-full bg-bg-input border border-border-default rounded-lg px-3 py-1.5 text-sm text-fg-primary placeholder:text-fg-muted focus:outline-none focus:border-accent-cyan transition-colors"
          onFocus={() => {
            if (suggestions && row.key) {
              const lower = row.key.toLowerCase();
              setFiltered(suggestions.filter((s) => s.toLowerCase().includes(lower)));
              setShowSuggestions(true);
            }
          }}
        />
        {showSuggestions && filtered.length > 0 && (
          <div className="absolute top-full left-0 mt-1 min-w-[200px] max-h-40 overflow-y-auto bg-bg-elevated border border-border-default rounded-lg shadow-lg z-50">
            {filtered.map((s) => (
              <button
                key={s}
                type="button"
                className="w-full text-left px-3 py-1.5 text-sm text-fg-primary hover:bg-accent-cyan-dim transition-colors"
                onClick={() => selectSuggestion(s)}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
      <input
        type="text"
        value={row.value}
        onChange={(e) => onUpdate(index, "value", e.target.value)}
        placeholder={valuePlaceholder}
        className="flex-1 min-w-0 bg-bg-input border border-border-default rounded-lg px-3 py-1.5 text-sm text-fg-primary placeholder:text-fg-muted focus:outline-none focus:border-accent-cyan transition-colors"
      />
      {!isLast && (
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="text-fg-muted hover:text-danger transition-colors shrink-0 cursor-pointer"
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npx tsc --noEmit components/httpclient/key-value-editor.tsx`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add components/httpclient/key-value-editor.tsx
git commit -m "feat(httpclient): add KeyValueEditor component"
```

---

### Task 5: useHttpClient Hook

**Files:**

- Create: `libs/httpclient/use-http-client.ts`

- [ ] **Step 1: Create the useHttpClient hook**

```typescript
// libs/httpclient/use-http-client.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import type { RequestConfig, ResponseData, RequestError, HistoryEntry, TimingInfo } from "./types";
import { DEFAULT_REQUEST_CONFIG } from "./types";
import { STORAGE_KEYS } from "../storage-keys";
import { buildRequest, parseResponse } from "./fetch-engine";

const MAX_HISTORY = 50;

function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.httpclientHistory);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.httpclientHistory, JSON.stringify(entries));
  } catch {
    // localStorage quota exceeded — ignore
  }
}

function extractTiming(url: string, startTime: number, endTime: number): TimingInfo {
  const total = endTime - startTime;
  const entries = performance.getEntriesByName(url, "resource") as PerformanceResourceTiming[];
  const entry = entries[entries.length - 1];
  if (entry && entry.responseStart > 0) {
    return {
      ttfb: Math.round(entry.responseStart - entry.startTime),
      download: Math.round(entry.responseEnd - entry.responseStart),
      total,
    };
  }
  return { total };
}

export function useHttpClient() {
  const [requestConfig, setRequestConfig] = useState<RequestConfig>(DEFAULT_REQUEST_CONFIG);
  const [response, setResponse] = useState<ResponseData | null>(null);
  const [error, setError] = useState<RequestError | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [timeout, setTimeoutValue] = useState<number | null>(30000);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const sendRequest = useCallback(
    async (config?: RequestConfig) => {
      const cfg = config ?? requestConfig;
      if (!cfg.url.trim()) return;

      setLoading(true);
      setError(null);
      setResponse(null);

      const startTime = Date.now();

      try {
        const { request, controller } = buildRequest(cfg, timeout);
        const fetchResponse = await fetch(request);
        const endTime = Date.now();

        let parsed = await parseResponse(fetchResponse, startTime);
        const timing = extractTiming(request.url, startTime, endTime);
        parsed = { ...parsed, timing };

        setResponse(parsed);

        const entry: HistoryEntry = {
          id: crypto.randomUUID(),
          request: cfg,
          responseStatus: parsed.status,
          responseStatusText: parsed.statusText,
          createdAt: Date.now(),
        };
        setHistory((prev) => {
          const next = [entry, ...prev].slice(0, MAX_HISTORY);
          saveHistory(next);
          return next;
        });
      } catch (err: unknown) {
        const endTime = Date.now();
        const msg = err instanceof Error ? err.message : String(err);
        const isCors =
          err instanceof TypeError ||
          msg.includes("CORS") ||
          msg.includes("NetworkError") ||
          msg.includes("Failed to fetch");
        const isTimeout =
          err instanceof DOMException &&
          err.name === "AbortError" &&
          endTime - startTime >= (timeout ?? Infinity) - 500;

        setError({
          message: isTimeout ? "timeout" : isCors ? "cors" : msg,
          isCors,
          isTimeout,
          timestamp: Date.now(),
        });
      } finally {
        setLoading(false);
      }
    },
    [requestConfig, timeout]
  );

  const restoreFromHistory = useCallback((entry: HistoryEntry) => {
    setRequestConfig(entry.request);
    setResponse(null);
    setError(null);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    saveHistory([]);
  }, []);

  return {
    requestConfig,
    setRequestConfig,
    response,
    error,
    loading,
    history,
    timeout,
    setTimeoutValue,
    sendRequest,
    restoreFromHistory,
    clearHistory,
  };
}
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npx tsc --noEmit libs/httpclient/use-http-client.ts`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add libs/httpclient/use-http-client.ts
git commit -m "feat(httpclient): add useHttpClient hook"
```

---

### Task 6: Page Component — Full Implementation

**Files:**

- Create: `app/[locale]/httpclient/httpclient-page.tsx`

This is the largest task. The file contains the full page with RequestPanel, ResponsePanel, HistoryDrawer, and Description sections as internal function components.

- [ ] **Step 1: Create the full page component**

```tsx
// app/[locale]/httpclient/httpclient-page.tsx
"use client";

import { useState, Fragment } from "react";
import { useTranslations } from "next-intl";
import {
  Send,
  Clock,
  Trash2,
  ChevronDown,
  ChevronUp,
  Download,
  Loader2,
  X,
  AlertTriangle,
} from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";
import JsonView from "@uiw/react-json-view";
import Layout from "../../../components/layout";
import { NeonTabs } from "../../../components/ui/tabs";
import { Button } from "../../../components/ui/button";
import { CopyButton } from "../../../components/ui/copy-btn";
import { KeyValueEditor } from "../../../components/httpclient/key-value-editor";
import { useHttpClient } from "../../../libs/httpclient/use-http-client";
import { omniKitJsonTheme } from "../../../libs/json-view-theme";
import {
  HTTP_METHODS,
  TIMEOUT_OPTIONS,
  BODY_TYPE_OPTIONS,
  AUTH_TYPE_OPTIONS,
  COMMON_HEADERS,
  DEFAULT_REQUEST_CONFIG,
  emptyKeyValue,
  type HttpMethod,
  type BodyType,
  type AuthType,
  type KeyValue,
} from "../../../libs/httpclient/types";
import { useIsMobile } from "../../../hooks/use-is-mobile";
import { formatBytes } from "../../../utils/storage";

const METHOD_COLORS: Record<string, string> = {
  GET: "text-green-500",
  POST: "text-yellow-500",
  PUT: "text-blue-500",
  PATCH: "text-blue-500",
  DELETE: "text-red-500",
  HEAD: "text-fg-muted",
  OPTIONS: "text-fg-muted",
};

const STATUS_COLORS: Record<string, string> = {
  "2": "text-green-500",
  "3": "text-blue-500",
  "4": "text-yellow-500",
  "5": "text-red-500",
};

function statusColor(code: number): string {
  return STATUS_COLORS[String(code)[0]] || "text-fg-primary";
}

function timeAgo(
  timestamp: number,
  t: (key: string, vars?: Record<string, number>) => string
): string {
  const diff = Math.floor((Date.now() - timestamp) / 1000);
  if (diff < 60) return t("ago.seconds", { count: diff });
  if (diff < 3600) return t("ago.minutes", { count: Math.floor(diff / 60) });
  if (diff < 86400) return t("ago.hours", { count: Math.floor(diff / 3600) });
  return t("ago.days", { count: Math.floor(diff / 86400) });
}

function formatSize(bytes: number): string {
  return formatBytes(bytes, 1000, 2);
}

function formatTiming(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

// --- Request Panel ---

function RequestPanel() {
  const t = useTranslations("httpclient");
  const tc = useTranslations("common");
  const {
    requestConfig,
    setRequestConfig,
    loading,
    timeout,
    setTimeoutValue,
    sendRequest,
    history,
    restoreFromHistory,
    clearHistory,
  } = useHttpClient();

  function updateConfig(partial: Partial<typeof requestConfig>) {
    setRequestConfig((prev) => ({ ...prev, ...partial }));
  }

  function syncParamsFromUrl(url: string) {
    try {
      const u = new URL(url);
      const params: KeyValue[] = [];
      u.searchParams.forEach((value, key) => {
        params.push({ key, value, enabled: true });
      });
      updateConfig({
        url: url.split("?")[0],
        params: params.length ? params : requestConfig.params,
      });
    } catch {
      // not a valid URL yet
    }
  }

  function handleSend() {
    sendRequest();
  }

  return (
    <section className="space-y-3">
      {/* URL Bar */}
      <div className="flex items-stretch gap-2">
        {/* Method selector */}
        <select
          value={requestConfig.method}
          onChange={(e) => updateConfig({ method: e.target.value as HttpMethod })}
          className={`bg-bg-input border border-border-default rounded-lg px-3 py-2 text-sm font-mono font-semibold focus:outline-none focus:border-accent-cyan transition-colors cursor-pointer shrink-0 ${METHOD_COLORS[requestConfig.method]}`}
        >
          {HTTP_METHODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        {/* URL input */}
        <input
          type="text"
          value={requestConfig.url}
          onChange={(e) => updateConfig({ url: e.target.value })}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          onBlur={() => syncParamsFromUrl(requestConfig.url)}
          placeholder={t("url.placeholder")}
          className="flex-1 min-w-0 bg-bg-input border border-border-default rounded-lg px-3 py-2 text-sm text-fg-primary placeholder:text-fg-muted focus:outline-none focus:border-accent-cyan transition-colors font-mono"
        />

        {/* Timeout selector */}
        <select
          value={timeout ?? ""}
          onChange={(e) => setTimeoutValue(e.target.value ? Number(e.target.value) : null)}
          className="bg-bg-input border border-border-default rounded-lg px-3 py-2 text-sm text-fg-secondary focus:outline-none focus:border-accent-cyan transition-colors cursor-pointer shrink-0"
        >
          {TIMEOUT_OPTIONS.map((opt) => (
            <option key={opt.label} value={opt.value ?? ""}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* History button */}
        <HistoryDrawer history={history} onRestore={restoreFromHistory} onClear={clearHistory} />

        {/* Send button */}
        <Button
          variant="primary"
          onClick={handleSend}
          disabled={loading || !requestConfig.url.trim()}
          className="shrink-0 min-w-[80px]"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {loading ? t("sending") : t("send")}
        </Button>
      </div>

      {/* Request Tabs */}
      <NeonTabs
        tabs={[
          {
            label: t("tabs.params"),
            content: (
              <KeyValueEditor
                pairs={requestConfig.params}
                onChange={(params) => updateConfig({ params })}
                keyPlaceholder={t("kv.keyPlaceholder")}
                valuePlaceholder={t("kv.valuePlaceholder")}
              />
            ),
          },
          {
            label: t("tabs.headers"),
            content: (
              <KeyValueEditor
                pairs={requestConfig.headers}
                onChange={(headers) => updateConfig({ headers })}
                suggestions={COMMON_HEADERS}
                keyPlaceholder={t("kv.keyPlaceholder")}
                valuePlaceholder={t("kv.valuePlaceholder")}
              />
            ),
          },
          {
            label: t("tabs.body"),
            content: (
              <BodyEditor
                bodyType={requestConfig.bodyType}
                bodyContent={requestConfig.bodyContent}
                formData={requestConfig.formData}
                onChange={(partial) => updateConfig(partial)}
              />
            ),
          },
          {
            label: t("tabs.auth"),
            content: (
              <AuthEditor
                authType={requestConfig.authType}
                bearerToken={requestConfig.bearerToken}
                basicUser={requestConfig.basicUser}
                basicPass={requestConfig.basicPass}
                onChange={(partial) => updateConfig(partial)}
              />
            ),
          },
        ]}
      />
    </section>
  );
}

// --- Body Editor ---

function BodyEditor({
  bodyType,
  bodyContent,
  formData,
  onChange,
}: {
  bodyType: BodyType;
  bodyContent: string;
  formData: KeyValue[];
  onChange: (
    partial: Partial<{ bodyType: BodyType; bodyContent: string; formData: KeyValue[] }>
  ) => void;
}) {
  const t = useTranslations("httpclient");

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {BODY_TYPE_OPTIONS.map((bt) => (
          <button
            key={bt}
            type="button"
            onClick={() => onChange({ bodyType: bt })}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
              bodyType === bt
                ? "bg-accent-cyan text-bg-base font-medium"
                : "bg-bg-input text-fg-secondary hover:text-fg-primary border border-border-default"
            }`}
          >
            {t(`bodyType.${bt}`)}
          </button>
        ))}
      </div>

      {bodyType === "json" && (
        <textarea
          value={bodyContent}
          onChange={(e) => onChange({ bodyContent: e.target.value })}
          placeholder={t("bodyPlaceholder")}
          rows={8}
          className="w-full bg-bg-input border border-border-default rounded-lg px-3 py-2 text-sm text-fg-primary placeholder:text-fg-muted focus:outline-none focus:border-accent-cyan transition-colors resize-y font-mono"
        />
      )}

      {(bodyType === "form-data" || bodyType === "urlencoded") && (
        <KeyValueEditor
          pairs={formData}
          onChange={(fd) => onChange({ formData: fd })}
          keyPlaceholder={t("kv.keyPlaceholder")}
          valuePlaceholder={t("kv.valuePlaceholder")}
        />
      )}

      {bodyType === "raw" && (
        <textarea
          value={bodyContent}
          onChange={(e) => onChange({ bodyContent: e.target.value })}
          placeholder={t("bodyPlaceholder")}
          rows={8}
          className="w-full bg-bg-input border border-border-default rounded-lg px-3 py-2 text-sm text-fg-primary placeholder:text-fg-muted focus:outline-none focus:border-accent-cyan transition-colors resize-y font-mono"
        />
      )}
    </div>
  );
}

// --- Auth Editor ---

function AuthEditor({
  authType,
  bearerToken,
  basicUser,
  basicPass,
  onChange,
}: {
  authType: AuthType;
  bearerToken: string;
  basicUser: string;
  basicPass: string;
  onChange: (
    partial: Partial<{
      authType: AuthType;
      bearerToken: string;
      basicUser: string;
      basicPass: string;
    }>
  ) => void;
}) {
  const t = useTranslations("httpclient");

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {AUTH_TYPE_OPTIONS.map((at) => (
          <button
            key={at}
            type="button"
            onClick={() => onChange({ authType: at })}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
              authType === at
                ? "bg-accent-cyan text-bg-base font-medium"
                : "bg-bg-input text-fg-secondary hover:text-fg-primary border border-border-default"
            }`}
          >
            {t(`authType.${at}`)}
          </button>
        ))}
      </div>

      {authType === "bearer" && (
        <input
          type="text"
          value={bearerToken}
          onChange={(e) => onChange({ bearerToken: e.target.value })}
          placeholder={t("bearerToken.placeholder")}
          className="w-full bg-bg-input border border-border-default rounded-lg px-3 py-2 text-sm text-fg-primary placeholder:text-fg-muted focus:outline-none focus:border-accent-cyan transition-colors font-mono"
        />
      )}

      {authType === "basic" && (
        <div className="flex gap-2">
          <input
            type="text"
            value={basicUser}
            onChange={(e) => onChange({ basicUser: e.target.value })}
            placeholder={t("basicAuth.usernamePlaceholder")}
            className="flex-1 bg-bg-input border border-border-default rounded-lg px-3 py-2 text-sm text-fg-primary placeholder:text-fg-muted focus:outline-none focus:border-accent-cyan transition-colors"
          />
          <input
            type="password"
            value={basicPass}
            onChange={(e) => onChange({ basicPass: e.target.value })}
            placeholder={t("basicAuth.passwordPlaceholder")}
            className="flex-1 bg-bg-input border border-border-default rounded-lg px-3 py-2 text-sm text-fg-primary placeholder:text-fg-muted focus:outline-none focus:border-accent-cyan transition-colors"
          />
        </div>
      )}
    </div>
  );
}

// --- History Drawer ---

function HistoryDrawer({
  history,
  onRestore,
  onClear,
}: {
  history: {
    id: string;
    request: { method: string; url: string };
    responseStatus: number;
    responseStatusText: string;
    createdAt: number;
  }[];
  onRestore: (entry: (typeof history)[number]) => void;
  onClear: () => void;
}) {
  const t = useTranslations("httpclient");
  const tc = useTranslations("common");
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 bg-bg-input border border-border-default rounded-lg px-3 py-2 text-sm text-fg-muted hover:text-fg-secondary transition-colors cursor-pointer shrink-0"
        title={t("history.title")}
      >
        <Clock size={16} />
      </button>

      <Transition show={open} as={Fragment}>
        <Dialog onClose={() => setOpen(false)} className="relative z-50">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50" />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 translate-x-full"
            enterTo="opacity-100 translate-x-0"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 translate-x-0"
            leaveTo="opacity-0 translate-x-full"
          >
            <Dialog.Panel
              className={`fixed right-0 top-0 bottom-0 bg-bg-surface border-l border-border-default shadow-xl flex flex-col ${
                isMobile ? "w-full" : "w-96"
              }`}
            >
              <div className="flex items-center justify-between p-4 border-b border-border-default">
                <Dialog.Title className="text-sm font-semibold text-fg-primary">
                  {t("history.title")}
                </Dialog.Title>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-fg-muted hover:text-fg-primary transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2">
                {history.length === 0 && (
                  <p className="text-sm text-fg-muted text-center py-8">{t("history.empty")}</p>
                )}
                {history.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => {
                      onRestore(entry);
                      setOpen(false);
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-accent-cyan-dim transition-colors cursor-pointer mb-1"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-mono font-semibold shrink-0 ${METHOD_COLORS[entry.request.method]}`}
                      >
                        {entry.request.method}
                      </span>
                      <span className="text-sm text-fg-primary truncate flex-1 font-mono">
                        {entry.request.url}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs ${statusColor(entry.responseStatus)}`}>
                        {entry.responseStatus} {entry.responseStatusText}
                      </span>
                      <span className="text-xs text-fg-muted">
                        {timeAgo(entry.createdAt, (key: string, vars?: Record<string, number>) =>
                          t(`history.${key}`, vars as Record<string, string>)
                        )}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {history.length > 0 && (
                <div className="p-3 border-t border-border-default">
                  <Button variant="danger" size="sm" onClick={onClear} className="w-full">
                    <Trash2 size={14} />
                    {t("history.clear")}
                  </Button>
                </div>
              )}
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  );
}

// --- Response Panel ---

function ResponsePanel() {
  const t = useTranslations("httpclient");
  const { response, error, loading } = useHttpClient();
  const [bodyView, setBodyView] = useState<"pretty" | "raw">("pretty");

  if (loading) {
    return (
      <section className="mt-6 border border-border-default rounded-xl p-8 flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-accent-cyan" />
        <span className="ml-3 text-fg-secondary text-sm">{t("sending")}</span>
      </section>
    );
  }

  if (error) {
    const message = error.isCors
      ? t("error.cors")
      : error.isTimeout
        ? t("error.timeout", {
            timeout: String(Math.round((useHttpClient().timeout ?? 30000) / 1000)),
          })
        : error.isCors
          ? t("error.cors")
          : t("error.generic");

    return (
      <section className="mt-6 border border-danger/30 rounded-xl p-6 bg-danger/5">
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="text-danger shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-danger font-medium">{message}</p>
            {!error.isCors && !error.isTimeout && (
              <p className="text-xs text-fg-muted mt-1 font-mono break-all">{error.message}</p>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (!response) {
    return (
      <section className="mt-6 border border-border-default rounded-xl p-8 text-center">
        <p className="text-fg-muted text-sm">{t("response.emptyState")}</p>
      </section>
    );
  }

  const responseHeaders = Object.entries(response.headers);

  return (
    <section className="mt-6 space-y-3">
      {/* Status Bar */}
      <div className="flex items-center gap-3 flex-wrap border border-border-default rounded-xl p-3 bg-bg-surface">
        <span className={`text-sm font-mono font-semibold ${statusColor(response.status)}`}>
          {response.status} {response.statusText}
        </span>
        <span className="text-xs text-fg-muted">{formatTiming(response.timing.total)}</span>
        <span className="text-xs text-fg-muted">{formatSize(response.size)}</span>
        <span className="text-xs text-fg-muted uppercase">{response.bodyType}</span>
        <div className="flex-1" />
        <CopyButton getContent={() => response.body} label={t("response.copyBody")} />
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            const blob = new Blob([response.body]);
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `response.${response.bodyType === "json" ? "json" : response.bodyType === "html" ? "html" : response.bodyType === "xml" ? "xml" : "txt"}`;
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          <Download size={14} />
          {t("response.download")}
        </Button>
      </div>

      {/* Response Tabs */}
      <NeonTabs
        tabs={[
          {
            label: t("response.tabs.body"),
            content: (
              <ResponseBodyTab response={response} bodyView={bodyView} setBodyView={setBodyView} />
            ),
          },
          {
            label: t("response.tabs.headers"),
            content: (
              <div className="space-y-1">
                {responseHeaders.length === 0 && (
                  <p className="text-sm text-fg-muted">{t("response.noHeaders")}</p>
                )}
                {responseHeaders.map(([key, value]) => (
                  <div key={key} className="flex gap-2 text-sm">
                    <span className="text-accent-cyan font-medium shrink-0">{key}:</span>
                    <span className="text-fg-primary break-all font-mono">{value}</span>
                  </div>
                ))}
              </div>
            ),
          },
          {
            label: t("response.tabs.cookies"),
            content: (
              <div className="space-y-2">
                {response.cookies.length === 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm text-fg-muted">{t("response.noCookies")}</p>
                    <p className="text-xs text-fg-muted">{t("response.cookieNote")}</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border-default">
                          <th className="text-left py-1.5 px-2 text-fg-muted font-medium">Name</th>
                          <th className="text-left py-1.5 px-2 text-fg-muted font-medium">Value</th>
                          <th className="text-left py-1.5 px-2 text-fg-muted font-medium">Path</th>
                          <th className="text-left py-1.5 px-2 text-fg-muted font-medium">
                            Expires
                          </th>
                          <th className="text-left py-1.5 px-2 text-fg-muted font-medium">Flags</th>
                        </tr>
                      </thead>
                      <tbody>
                        {response.cookies.map((cookie, i) => (
                          <tr key={i} className="border-b border-border-subtle">
                            <td className="py-1.5 px-2 font-mono text-fg-primary">{cookie.name}</td>
                            <td className="py-1.5 px-2 font-mono text-fg-primary truncate max-w-[200px]">
                              {cookie.value}
                            </td>
                            <td className="py-1.5 px-2 text-fg-secondary">{cookie.path ?? "—"}</td>
                            <td className="py-1.5 px-2 text-fg-secondary text-xs">
                              {cookie.expires ?? "—"}
                            </td>
                            <td className="py-1.5 px-2 text-fg-secondary text-xs">
                              {cookie.httpOnly && (
                                <span className="mr-1 text-yellow-500">HttpOnly</span>
                              )}
                              {cookie.secure && <span className="mr-1 text-green-500">Secure</span>}
                              {cookie.sameSite && (
                                <span className="text-blue-500">{cookie.sameSite}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ),
          },
          {
            label: t("response.tabs.timing"),
            content: (
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-lg font-mono font-semibold text-accent-cyan">
                      {formatTiming(response.timing.total)}
                    </div>
                    <div className="text-xs text-fg-muted">{t("response.total")}</div>
                  </div>
                  {response.timing.ttfb != null && (
                    <div className="text-center">
                      <div className="text-lg font-mono font-semibold text-accent-purple">
                        {formatTiming(response.timing.ttfb)}
                      </div>
                      <div className="text-xs text-fg-muted">{t("response.ttfb")}</div>
                    </div>
                  )}
                  {response.timing.download != null && (
                    <div className="text-center">
                      <div className="text-lg font-mono font-semibold text-fg-secondary">
                        {formatTiming(response.timing.download)}
                      </div>
                      <div className="text-xs text-fg-muted">{t("response.download")}</div>
                    </div>
                  )}
                </div>

                {response.timing.ttfb == null && response.timing.download == null && (
                  <p className="text-xs text-fg-muted">{t("response.timingNote")}</p>
                )}

                {/* Timing bar */}
                {response.timing.ttfb != null && response.timing.download != null && (
                  <div className="space-y-1">
                    <div className="flex rounded-full overflow-hidden h-3 bg-bg-input">
                      <div
                        className="bg-accent-purple transition-all"
                        style={{
                          width: `${(response.timing.ttfb / response.timing.total) * 100}%`,
                        }}
                      />
                      <div
                        className="bg-accent-cyan transition-all"
                        style={{
                          width: `${(response.timing.download / response.timing.total) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-fg-muted">
                      <span>{t("response.ttfb")}</span>
                      <span>{t("response.download")}</span>
                    </div>
                  </div>
                )}
              </div>
            ),
          },
          {
            label: t("response.tabs.redirects"),
            content: (
              <div className="space-y-2">
                {response.redirected ? (
                  <>
                    <p className="text-sm text-yellow-500">{t("response.redirectOccurred")}</p>
                    <div className="text-sm">
                      <span className="text-fg-muted">{t("response.finalUrl")}:</span>{" "}
                      <span className="font-mono text-fg-primary break-all">
                        {response.finalUrl}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-fg-muted">{t("response.noRedirect")}</p>
                )}
                <p className="text-xs text-fg-muted">{t("response.redirectNote")}</p>
              </div>
            ),
          },
        ]}
      />
    </section>
  );
}

// --- Response Body Tab ---

function ResponseBodyTab({
  response,
  bodyView,
  setBodyView,
}: {
  response: { body: string; bodyType: string; size: number };
  bodyView: "pretty" | "raw";
  setBodyView: (v: "pretty" | "raw") => void;
}) {
  const t = useTranslations("httpclient");
  const isLarge = response.size > 1_000_000;
  const displayBody = isLarge ? response.body.substring(0, 100_000) : response.body;
  const isJson = response.bodyType === "json";
  let parsedJson: unknown = null;
  if (isJson && bodyView === "pretty") {
    try {
      parsedJson = JSON.parse(response.body);
    } catch {
      parsedJson = null;
    }
  }

  return (
    <div className="space-y-2">
      {isLarge && (
        <div className="flex items-center gap-2 text-xs text-yellow-500 bg-yellow-500/10 rounded-lg px-3 py-2">
          <AlertTriangle size={14} />
          {t("response.largeResponseWarning")}
        </div>
      )}
      {response.bodyType === "binary" && (
        <p className="text-xs text-fg-muted">{t("response.binaryPreview")}</p>
      )}
      {isJson && (
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setBodyView("pretty")}
            className={`px-2 py-1 text-xs rounded cursor-pointer ${bodyView === "pretty" ? "bg-accent-cyan text-bg-base" : "text-fg-muted hover:text-fg-primary"}`}
          >
            {t("response.pretty")}
          </button>
          <button
            type="button"
            onClick={() => setBodyView("raw")}
            className={`px-2 py-1 text-xs rounded cursor-pointer ${bodyView === "raw" ? "bg-accent-cyan text-bg-base" : "text-fg-muted hover:text-fg-primary"}`}
          >
            {t("response.raw")}
          </button>
        </div>
      )}
      <div className="max-h-[500px] overflow-auto rounded-lg bg-bg-input border border-border-default">
        {isJson && bodyView === "pretty" && parsedJson ? (
          <JsonView value={parsedJson} style={omniKitJsonTheme} />
        ) : (
          <pre className="p-3 text-sm font-mono text-fg-primary whitespace-pre-wrap break-all">
            {displayBody}
          </pre>
        )}
      </div>
    </div>
  );
}

// --- Description ---

function Description() {
  const t = useTranslations("httpclient");
  const tc = useTranslations("common");
  const [expanded, setExpanded] = useState(false);

  return (
    <section id="description" className="py-3">
      <div className="relative">
        <div
          className={`overflow-hidden transition-all duration-300 ${expanded ? "max-h-[800px]" : "max-h-20"}`}
        >
          <p className="text-fg-secondary text-sm leading-8 indent-12">{t("description.text")}</p>

          <div className="mt-4">
            <h3 className="text-sm font-semibold text-fg-primary mb-2">
              {t("description.features.title")}
            </h3>
            <ul className="space-y-1 text-sm text-fg-secondary">
              <li>• {t("description.features.methods")}</li>
              <li>• {t("description.features.auth")}</li>
              <li>• {t("description.features.body")}</li>
              <li>• {t("description.features.response")}</li>
              <li>• {t("description.features.history")}</li>
            </ul>
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-semibold text-fg-primary mb-2">
              {t("description.cors.title")}
            </h3>
            <p className="text-sm text-fg-secondary leading-7">{t("description.cors.text")}</p>
          </div>
        </div>
        {!expanded && (
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-bg-base to-transparent pointer-events-none" />
        )}
      </div>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="mt-1 flex items-center gap-1 text-xs text-accent-cyan hover:text-accent-cyan/80 transition-colors cursor-pointer"
      >
        {expanded ? (
          <>
            <ChevronUp size={14} />
            {tc("showLess")}
          </>
        ) : (
          <>
            <ChevronDown size={14} />
            {tc("showMore")}
          </>
        )}
      </button>
    </section>
  );
}

// --- Main Page ---

export default function HttpClientPage() {
  const t = useTranslations("tools");
  const tc = useTranslations("common");

  return (
    <Layout title={t("httpclient.shortTitle")}>
      <div className="container mx-auto px-4 pt-3 pb-6">
        <div className="flex items-start gap-2 border-l-2 border-accent-cyan bg-accent-cyan-dim/30 rounded-r-lg p-3 my-4">
          <span className="text-sm text-fg-secondary leading-relaxed">
            {tc("alert.notTransferred")}
          </span>
        </div>
        <RequestPanel />
        <ResponsePanel />
        <Description />
      </div>
    </Layout>
  );
}
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add app/[locale]/httpclient/httpclient-page.tsx
git commit -m "feat(httpclient): add full page component with request/response panels"
```

---

### Task 7: SEO JSON-LD Integration

**Files:**

- Modify: `app/[locale]/httpclient/httpclient-page.tsx`

- [ ] **Step 1: Add JSON-LD imports and components to the page**

Add imports at the top of `httpclient-page.tsx`:

```typescript
import { WebApplicationJsonLd, BreadcrumbJsonLd } from "../../../components/json-ld";
import { SITE_URL } from "../../../libs/site";
```

Update the `HttpClientPage` default export to include JSON-LD:

```tsx
export default function HttpClientPage() {
  const t = useTranslations("tools");
  const tc = useTranslations("common");

  return (
    <Layout title={t("httpclient.shortTitle")}>
      <WebApplicationJsonLd
        name={t("httpclient.title")}
        description={t("httpclient.description")}
        url={`${SITE_URL}/httpclient`}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "OmniKit", url: SITE_URL },
          { name: t("httpclient.shortTitle"), url: `${SITE_URL}/httpclient` },
        ]}
      />
      <div className="container mx-auto px-4 pt-3 pb-6">
        <div className="flex items-start gap-2 border-l-2 border-accent-cyan bg-accent-cyan-dim/30 rounded-r-lg p-3 my-4">
          <span className="text-sm text-fg-secondary leading-relaxed">
            {tc("alert.notTransferred")}
          </span>
        </div>
        <RequestPanel />
        <ResponsePanel />
        <Description />
      </div>
    </Layout>
  );
}
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add app/[locale]/httpclient/httpclient-page.tsx
git commit -m "feat(httpclient): add SEO JSON-LD structured data"
```

---

### Task 8: Final Verification

- [ ] **Step 1: Run all HTTP Client tests**

Run: `npx vitest run libs/httpclient/__tests__/fetch-engine.test.ts`
Expected: All tests PASS

- [ ] **Step 2: Run TypeScript type checking**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Run ESLint**

Run: `npx eslint app/[locale]/httpclient/ components/httpclient/ libs/httpclient/`
Expected: No errors (or only warnings about `any` types in existing patterns)

- [ ] **Step 4: Run dev server and verify page loads**

Run: `npx next dev`
Then navigate to `http://localhost:3000/httpclient`
Expected: Page loads with URL bar, method selector, tabs, and empty response panel

- [ ] **Step 5: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix(httpclient): address lint/type issues from final verification"
```

---

## Self-Review Checklist

**1. Spec coverage:**

- ✅ UI Layout: Vertical split with Request Panel (top) and Response Panel (bottom)
- ✅ URL Bar: Method selector + URL input + Timeout selector + Send button
- ✅ Request Tabs: Params, Headers, Body (with sub-types), Auth (with sub-types)
- ✅ Key-Value Editor: Reusable with suggestions, toggle, delete, auto-append
- ✅ Response Status Bar: Status code (colored) + timing + size + type + Copy + Download
- ✅ Response Tabs: Body (JSON/pretty/raw), Headers, Cookies, Timing (bar chart), Redirects
- ✅ Error States: CORS, network, timeout with clear messages
- ✅ Empty State: Instruction text when no request sent
- ✅ History: Side drawer, localStorage, max 50, FIFO, restore on click, clear button
- ✅ Mobile Adaptation: useIsMobile for history drawer (full-screen on mobile)
- ✅ Description Section: Expandable with features list and CORS explanation
- ✅ i18n: 10 locales with httpclient.json + tools.json entries (with CJK searchTerms)
- ✅ SEO: generatePageMeta (in page.tsx from Part 1), WebApplicationJsonLd, BreadcrumbJsonLd
- ✅ Tool Registration: TOOLS array, TOOL_CATEGORIES, storage key, vitest config (all from Part 1)

**2. Placeholder scan:** No TBD/TODO found. All steps contain complete code.

**3. Type consistency:**

- `KeyValue`, `BodyType`, `AuthType`, `HttpMethod` used consistently across types.ts, KV editor, page, and hook
- `ResponseData["bodyType"]` aliased as `ResponseBodyType` in types.ts, used in detectBodyType
- `DEFAULT_REQUEST_CONFIG` used in hook and page
- `COMMON_HEADERS` used in RequestPanel for suggestions prop
- History types match between hook and HistoryDrawer
