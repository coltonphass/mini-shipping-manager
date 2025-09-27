const API = 'https://mini-shipping-manager-backend.onrender.com'

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('shipForm')
  const list = document.getElementById('list')

  // Animate form labels
  const labels = document.querySelectorAll('.form-control label')
  labels.forEach((label) => {
    if (label && label.innerText) {
      label.innerHTML = label.innerText
        .split('')
        .map(
          (letter, idx) =>
            `<span style="transition-delay: ${idx * 50}ms">${letter}</span>`
        )
        .join('')
    }
  })

  // Form submission handler (manual button click)
  document
    .getElementById('createShipmentBtn')
    .addEventListener('click', function (e) {
      console.log('Create Shipment button clicked')

      const formData = new FormData(form)
      const recipient = formData.get('recipient')
      const address = formData.get('address')
      const weight = formData.get('weight')
      const service = formData.get('service')

      if (!recipient || !address || !weight || !service) {
        showNotification('Please fill in all required fields', 'error')
        return
      }

      const submitBtn = document.getElementById('createShipmentBtn')
      const originalText = submitBtn.textContent
      submitBtn.disabled = true
      submitBtn.textContent = 'Creating...'

      fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient,
          address,
          weight: parseFloat(weight),
          service,
        }),
      })
        .then((res) => (res.ok ? res.json() : Promise.reject(res)))
        .then((newShipment) => {
          showSuccessMessage(newShipment)
          form.reset()
          submitBtn.disabled = false
          submitBtn.textContent = originalText
          fetchShipments()
        })
        .catch((err) => {
          console.error(err)
          showNotification(
            'Error creating shipment. Please try again.',
            'error'
          )
          submitBtn.disabled = false
          submitBtn.textContent = originalText
        })
    })

  // Initial fetch
  fetchShipments()
})

// ======================
// Modal Success Function
// ======================
function showSuccessMessage(shipment) {
  // Show notification bar (toast) for success
  const notif = document.getElementById('notification')
  if (!notif) return

  notif.innerHTML = `✅ Shipment created successfully!<br>
    <strong>Recipient:</strong> ${escapeHtml(shipment.recipient)}<br>
    <strong>Service:</strong> ${escapeHtml(shipment.service)}<br>
    <strong>Weight:</strong> ${shipment.weight} lbs`
  notif.style.display = 'block'
  notif.style.backgroundColor = '#28a745'
  notif.style.color = '#fff'
  notif.style.borderRadius = '6px'
  notif.style.padding = '16px'
  notif.style.position = 'fixed'
  notif.style.top = '20px'
  notif.style.left = '50%'
  notif.style.transform = 'translateX(-50%)'
  notif.style.zIndex = '9999'

  setTimeout(() => {
    notif.style.display = 'none'
  }, 3000)
}

// ======================
// Simple notification
// ======================
function showNotification(message, type = 'info') {
  const notif = document.getElementById('notification')
  if (!notif) return

  notif.textContent = message
  notif.style.display = 'block'

  switch (type) {
    case 'success':
      notif.style.backgroundColor = '#28a745'
      notif.style.color = '#fff'
      break
    case 'error':
      notif.style.backgroundColor = '#dc3545'
      notif.style.color = '#fff'
      break
    default:
      notif.style.backgroundColor = '#351E0A'
      notif.style.color = '#FFB500'
      break
  }

  setTimeout(() => {
    notif.style.display = 'none'
  }, 3000)
}

// ======================
// Escape HTML
// ======================
function escapeHtml(unsafe) {
  if (!unsafe) return ''
  return unsafe.replace(/[&<"'>]/g, function (m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    }[m]
  })
}

// ======================
// Fetch and display shipments
// ======================
async function fetchShipments() {
  const list = document.getElementById('list')
  try {
    const res = await fetch(API)
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)

    const data = await res.json()
    if (!Array.isArray(data)) throw new Error('Expected array of shipments')

    list.innerHTML = data
      .map(
        (s) => `
        <div class="card">
          <strong>${escapeHtml(s.recipient)}</strong> — ${escapeHtml(
          s.service
        )} — ${s.weight} lb
          <div>${escapeHtml(s.address)}</div>
          <div>
            ${
              s.labelPath
                ? `<a href="${s.labelPath}" target="_blank" class="download-link">Download label</a>`
                : '<span class="label-pending">Label not ready</span>'
            } 
             Tracking: ${s.trackingNumber || 'N/A'}
          </div>
          <small>${new Date(s.createdAt).toLocaleString()}</small>
        </div>
      `
      )
      .join('')
  } catch (err) {
    console.error('Fetch error', err)
    list.innerHTML =
      '<div class="card">Error loading shipments: ' + err.message + '</div>'
  }
}

console.log('Showing modal', modal)
