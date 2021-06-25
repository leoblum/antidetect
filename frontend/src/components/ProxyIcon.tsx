import getUnicodeFlagIcon from 'country-flag-icons/unicode'
import React from 'react'

import { Proxy } from '@/types'

export function getProxyIcon (proxy?: Proxy): string {
  if (proxy === undefined) return '🚫'
  if (proxy.country) try { return getUnicodeFlagIcon(proxy.country) } catch (e) {}
  return '🌍'
}

type ProxyIconProps = { proxy?: Proxy, size?: number }
export default function ProxyIcon ({ proxy, size = 18 }: ProxyIconProps): JSX.Element {
  return (
    <div style={{ fontSize: `${size}px` }}>
      {getProxyIcon(proxy)}
    </div>
  )
}
