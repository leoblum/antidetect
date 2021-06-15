import getUnicodeFlagIcon from 'country-flag-icons/unicode'
import React from 'react'

import { iProxy } from '@/types'

export function getProxyIcon (proxy: iProxy | null): string {
  console.log(proxy)
  if (proxy === null) return '🚫'
  if (proxy.country !== null) try { return getUnicodeFlagIcon(proxy.country) } catch (e) {}
  return '🌍'
}

type ProxyIconProps = { proxy: iProxy | null, size?: number }
export default function ProxyIcon ({ proxy, size = 18 }: ProxyIconProps): JSX.Element {
  return (
    <div style={{ fontSize: `${size}px` }}>
      {getProxyIcon(proxy)}
    </div>
  )
}
