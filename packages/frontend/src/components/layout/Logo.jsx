import React from 'react'

import { useTheme } from '@/hooks'

export default function Logo () {
  const { toggleTheme } = useTheme()
  return (
    <div style={{ userSelect: 'none', fontSize: '22px', margin: '0 10px 0 12px', display: 'flex', alignItems: 'center' }}>
      <div style={{ fontSize: '28px', marginRight: '10px' }} onClick={toggleTheme}>
        🎭
      </div>
      <div style={{ textAlign: 'center', marginTop: '2px' }}>
        <div style={{ fontSize: '18px', lineHeight: '16px', fontWeight: 500, letterSpacing: '2px' }}>YANUS</div>
        <div style={{ fontSize: '11px', lineHeight: '10px' }}>antidetect</div>
      </div>
    </div>
  )
}
