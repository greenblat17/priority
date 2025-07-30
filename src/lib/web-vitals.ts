import { onCLS, onFCP, onFID, onLCP, onTTFB, ReportHandler } from 'web-vitals'

const vitalsUrl = '/api/web-vitals'

// Function to send analytics
function sendToAnalytics(metric: any) {
  const body = JSON.stringify({
    id: metric.id,
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    navigationType: metric.navigationType,
  })

  // Use `navigator.sendBeacon()` if available, falling back to `fetch()`.
  if (navigator.sendBeacon) {
    navigator.sendBeacon(vitalsUrl, body)
  } else {
    fetch(vitalsUrl, {
      body,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
    })
  }
}

// Report Web Vitals
export function reportWebVitals() {
  onCLS(sendToAnalytics)
  onFCP(sendToAnalytics)
  onFID(sendToAnalytics)
  onLCP(sendToAnalytics)
  onTTFB(sendToAnalytics)
}

// Log Web Vitals to console in development
export function logWebVitals() {
  onCLS(console.log)
  onFCP(console.log)
  onFID(console.log)
  onLCP(console.log)
  onTTFB(console.log)
}

// Get threshold values for Web Vitals
export const webVitalsThresholds = {
  CLS: { good: 0.1, needsImprovement: 0.25 },
  FCP: { good: 1800, needsImprovement: 3000 },
  FID: { good: 100, needsImprovement: 300 },
  LCP: { good: 2500, needsImprovement: 4000 },
  TTFB: { good: 800, needsImprovement: 1800 },
}