/**
 * 云策 AI · Service Worker
 * 缓存策略：静态资源 CacheFirst，API请求 NetworkFirst
 */
const CACHE_VERSION = 'zhiyu-v1'
const STATIC_CACHE = `${CACHE_VERSION}-static`
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`

// 需要预缓存的静态资源
const PRECACHE_URLS = [
  '/',
  '/favicon.svg',
  '/manifest.json'
]

// 安装事件：预缓存静态资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_URLS)
    }).then(() => {
      return self.skipWaiting()
    })
  )
})

// 激活事件：清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => {
          return key !== STATIC_CACHE && key !== DYNAMIC_CACHE
        }).map((key) => {
          return caches.delete(key)
        })
      )
    }).then(() => {
      return self.clients.claim()
    })
  )
})

// 请求拦截
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // 跳过非 GET 请求和 chrome-extension 请求
  if (request.method !== 'GET') return
  if (url.protocol === 'chrome-extension:') return

  // API 请求：NetworkFirst 策略
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request))
    return
  }

  // 静态资源：CacheFirst 策略
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/) ||
    url.pathname.startsWith('/assets/')
  ) {
    event.respondWith(cacheFirst(request))
    return
  }

  // 其他请求：NetworkFirst
  event.respondWith(networkFirst(request))
})

// CacheFirst 策略
async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch (err) {
    return new Response('离线状态，资源不可用', { status: 503 })
  }
}

// NetworkFirst 策略
async function networkFirst(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch (err) {
    const cached = await caches.match(request)
    if (cached) return cached
    return new Response(
      JSON.stringify({ message: '当前处于离线状态' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
