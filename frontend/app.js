const API = 'https://mini-shipping-manager-backend.onrender.com/api/shipments'

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('shipForm')
  const list = document.getElementById('list')
  const notif = document.getElementById('notification')
  const submitBtn = document.getElementById('createShipmentBtn')

  // Animate form labels
  const labels = document.querySelectorAll('.form-control label span')
  labels.forEach((label, idx) => {
    label.style.transitionDelay = `${idx * 50}ms`
  })

  // Form submission handler
  submitBtn.addEventListener('click', async function () {
    const formData = new FormData(form)
    const recipient = formData.get('recipient')
    const address = formData.get('address')
    const weight = formData.get('weight')
    const service = formData.get('service')

    if (!recipient || !address || !weight || !service) {
      showNotification('Please fill in all required fields', 'error')
      return
    }

    const originalText = submitBtn.textContent
    submitBtn.disabled = true
    submitBtn.textContent = 'Creating...'

    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient,
          address,
          weight: parseFloat(weight),
          service,
        }),
      })

      if (!res.ok) throw new Error('Failed to create shipment')

      const shipment = await res.json()
      form.reset()
      showSuccessMessage(shipment)
      fetchShipments()
    } catch (err) {
      console.error(err)
      showNotification('Error creating shipment. Please try again.', 'error')
    } finally {
      submitBtn.disabled = false
      submitBtn.textContent = originalText
    }
  })

  // Fetch and display shipments
  async function fetchShipments() {
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
      list.innerHTML = `<div class="card">Error loading shipments: ${err.message}</div>`
    }
  }

  // Success notification
  function showSuccessMessage(shipment) {
    notif.innerHTML = `Shipment created successfully!<br>
      <strong>Recipient:</strong> ${escapeHtml(shipment.recipient)}<br>
      <strong>Service:</strong> ${escapeHtml(shipment.service)}<br>
      <strong>Weight:</strong> ${shipment.weight} lbs`
    notif.style.backgroundColor = '#28a745'
    notif.style.color = '#fff'
    notif.style.display = 'block'

    setTimeout(() => {
      notif.style.display = 'none'
    }, 5000) // keeps it longer than before
  }

  // Simple notification for errors or info
  function showNotification(message, type = 'info') {
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
    }, 5000)
  }

  // Escape HTML to avoid XSS
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

  // Initial fetch
  fetchShipments()
})

const mergeBtn = document.getElementById('mergeBtn')
mergeBtn.addEventListener('click', () => {
  const url =
    'https://mini-shipping-manager-backend.onrender.com/api/shipments/merge-last-5'
  window.open(url, '_blank') // triggers download
})
