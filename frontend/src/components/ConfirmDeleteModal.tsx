import { Modal } from 'antd'
import React, { ReactNode } from 'react'

type Render<T> = (item: T) => ReactNode
type Separator = () => ReactNode

const reactJoin = <T extends ReactNode> (items: T[], fc: Render<T>, sfc: Separator): ReactNode => {
  return items.reduce((prev: ReactNode[], item, idx) => {
    const isLast = idx === items.length - 1
    prev.push(<span key={idx}>{isLast ? fc(item) : <>{fc(item)}{sfc()}</>}</span>)
    return prev
  }, [])
}

function ConfirmMessage ({ names }: { names: string[] }) {
  const children = reactJoin(names, x => <u>{x}</u>, () => ', ')
  return (
    <div style={{ textAlign: 'left' }}>
      Are you sure to delete {children}?
    </div>
  )
}

type Callback = () => void
type AsyncCallback = () => Promise<void>

export function confirmDelete (names: string[], onConfirm: Callback | AsyncCallback) {
  // todo: callback from Modal.cofirm is not used
  Modal.confirm({
    content: <ConfirmMessage names={names} />,
    okText: 'Yes',
    okType: 'danger',
    cancelText: 'No',
    onOk: onConfirm,
  })
}
