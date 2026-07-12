// Warstwa komunikacji z backendem — wszystkie fetch'e w jednym miejscu

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    throw new Error(`Błąd API: ${res.status}`)
  }
  return res.json()
}

export function fetchTickets(status) {
  const query = status ? `?status=${status}` : ''
  return request(`/api/tickets${query}`)
}

export function fetchTicket(id) {
  return request(`/api/tickets/${id}`)
}

export function createTicket(data) {
  return request('/api/tickets', { method: 'POST', body: JSON.stringify(data) })
}

export function updateTicket(id, data) {
  return request(`/api/tickets/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
}

export function addComment(id, data) {
  return request(`/api/tickets/${id}/comments`, { method: 'POST', body: JSON.stringify(data) })
}

// --- Zasoby IT (CMDB) ---

export function fetchAssets(status) {
  const query = status ? `?status=${status}` : ''
  return request(`/api/assets${query}`)
}

export function createAsset(data) {
  return request('/api/assets', { method: 'POST', body: JSON.stringify(data) })
}

export function updateAsset(id, data) {
  return request(`/api/assets/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
}

// --- Baza wiedzy ---

export function fetchKbArticles(search) {
  const query = search ? `?search=${encodeURIComponent(search)}` : ''
  return request(`/api/kb${query}`)
}

export function createKbArticle(data) {
  return request('/api/kb', { method: 'POST', body: JSON.stringify(data) })
}

// --- Raporty ---

export function fetchReportsSummary() {
  return request('/api/reports/summary')
}

// --- Monitoring ---

export function fetchMonitoringStatus() {
  return request('/api/monitoring/status')
}

export function fetchMonitoringHistory(hours) {
  return request(`/api/monitoring/history?hours=${hours}`)
}
