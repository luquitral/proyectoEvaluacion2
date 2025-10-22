import React, { useState, useMemo } from 'react'


function buildUrlFromPath(path) {
  if (!path) return null
  if (path.startsWith('http')) return path
  if (!storageBase) return path 
  return storageBase.replace(/\/$/, '') + (path.startsWith('/') ? path : `/${path}`)
}

export default function ProductImagesSlider({ images = [], alt = 'Imagen', aspect = '4/3' }) {
  const urls = useMemo(() => {
    const arr = Array.isArray(images) ? images : []
    const list = arr.map((it) => {
      if (!it) return null
      if (typeof it === 'string') return it
      // Priorizar campos comunes
      if (it.url) return it.url
      if (it.src) return it.src
      if (it.path) return buildUrlFromPath(it.path)
      // Algunos objetos devuelven 'name' y 'path' o 'file' info
      if (it.file?.url) return it.file.url
      if (it.file?.path) return buildUrlFromPath(it.file.path)
      return null
    }).filter(Boolean)
    return list.length > 0 ? list : ['/vite.svg']
  }, [images])

  const [idx, setIdx] = useState(0)
  function prev() { setIdx((i) => (i - 1 + urls.length) % urls.length) }
  function next() { setIdx((i) => (i + 1) % urls.length) }

  return (
    <div className="position-relative bg-light" style={{ aspectRatio: aspect }}>
      <img src={urls[idx]} alt={alt} className="w-100 h-100" style={{ objectFit: 'cover' }} loading="lazy" />
      {urls.length > 1 && (
        <button type="button" className="btn btn-sm btn-dark position-absolute" onClick={prev} style={{ top: '50%', left: '8px', transform: 'translateY(-50%)' }} aria-label="Anterior">‹</button>
      )}
      {urls.length > 1 && (
        <button type="button" className="btn btn-sm btn-dark position-absolute" onClick={next} style={{ top: '50%', right: '8px', transform: 'translateY(-50%)' }} aria-label="Siguiente">›</button>
      )}
      {urls.length > 1 && (
        <div className="position-absolute d-flex gap-1" style={{ bottom: '8px', left: '50%', transform: 'translateX(-50%)' }}>
          {urls.map((_, i) => (
            <span key={i} className="rounded-circle" style={{ width: 8, height: 8, background: i === idx ? '#000' : '#bbb' }} />
          ))}
        </div>
      )}
    </div>
  )
}
