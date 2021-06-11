import getUnicodeFlagIcon from 'country-flag-icons/unicode'
import React from 'react'

import { ProxyType } from '@/types'

export function getProxyIcon (proxy: ProxyType): string {
  console.log(proxy)
  if (!proxy) return '🚫'
  if (proxy.country) try { return getUnicodeFlagIcon(proxy.country) } catch (e) {}
  return '🌍'
}

type ProxyIconProps = {proxy: ProxyType, size?: number}
export default function ProxyIcon ({ proxy, size = 18 }: ProxyIconProps): JSX.Element {
  return (
    <div style={{ fontSize: `${size}px` }}>
      {getProxyIcon(proxy)}
    </div>
  )
}
