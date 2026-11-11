const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif'

function svgToImage(svg, width, height) {
  const clone = svg.cloneNode(true)
  clone.setAttribute('width', width)
  clone.setAttribute('height', height)
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  const xml = new XMLSerializer().serializeToString(clone)
  const url = URL.createObjectURL(new Blob([xml], { type: 'image/svg+xml;charset=utf-8' }))
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = (e) => {
      URL.revokeObjectURL(url)
      reject(e)
    }
    img.src = url
  })
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/** Crea il PNG della formazione: intestazione, campo e panchina. */
export async function renderFormationImage({ svg, teamName, formationId, bench, captainName }) {
  const W = 1080
  const pad = 40
  const pitchW = W - pad * 2
  const pitchH = Math.round(pitchW * 1.4)
  const headerH = 170
  const benchList = bench.filter((b) => b.name.trim())
  const rows = Math.ceil(benchList.length / 2)
  const benchH = benchList.length ? 90 + rows * 56 : 0
  const H = headerH + pitchH + benchH + 80

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#0b1220'
  ctx.fillRect(0, 0, W, H)

  ctx.fillStyle = '#ffffff'
  ctx.font = `800 58px ${FONT}`
  ctx.textBaseline = 'alphabetic'
  ctx.fillText((teamName || 'La mia squadra').toUpperCase(), pad, 92, W - pad * 2)
  ctx.fillStyle = '#a3e635'
  ctx.font = `700 34px ${FONT}`
  const sub = captainName ? `${formationId}  ·  Capitano: ${captainName}` : formationId
  ctx.fillText(sub, pad, 142, W - pad * 2)

  const img = await svgToImage(svg, pitchW, pitchH)
  ctx.save()
  roundRect(ctx, pad, headerH, pitchW, pitchH, 24)
  ctx.clip()
  ctx.drawImage(img, pad, headerH, pitchW, pitchH)
  ctx.restore()

  if (benchList.length) {
    let y = headerH + pitchH + 70
    ctx.fillStyle = '#94a3b8'
    ctx.font = `700 30px ${FONT}`
    ctx.fillText('PANCHINA', pad, y)
    y += 56
    const colW = (W - pad * 2) / 2
    benchList.forEach((b, i) => {
      const x = pad + (i % 2) * colW
      const yy = y + Math.floor(i / 2) * 56
      ctx.fillStyle = '#a3e635'
      ctx.font = `800 32px ${FONT}`
      ctx.fillText(b.number || '–', x, yy, 70)
      ctx.fillStyle = '#ffffff'
      ctx.font = `600 32px ${FONT}`
      ctx.fillText(b.name.trim().toUpperCase(), x + 76, yy, colW - 90)
    })
  }

  ctx.fillStyle = '#475569'
  ctx.font = `500 24px ${FONT}`
  ctx.fillText('Formazione Pro Club', pad, H - 32)

  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
}

/** Condivide con il menu del telefono, altrimenti scarica il file. */
export async function shareOrDownload(blob, filename) {
  const file = new File([blob], filename, { type: 'image/png' })
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Formazione' })
      return 'shared'
    } catch (e) {
      if (e?.name === 'AbortError') return 'cancelled'
    }
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  return 'downloaded'
}
