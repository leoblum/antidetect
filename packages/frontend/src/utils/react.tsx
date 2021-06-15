import React from 'react'

type El = React.ReactNode
type Render<T> = (item: T) => El
type Separator = () => El

export function reactJoin<T extends El> (items: T[], itemRender: Render<T>, separatorRender: Separator): El {
  return items.reduce((prev: El[], item, idx) => {
    const isLast = idx === items.length - 1
    prev.push(<span key={idx}>{isLast ? itemRender(item) : <>{itemRender(item)}{separatorRender()}</>}</span>)
    return prev
  }, [])
}
