import { Modal } from 'antd'
import React from 'react'

import { reactJoin } from '@/utils/react'

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

export default function confirmDelete (names: string[], onConfirm: Callback | AsyncCallback) {
  // todo: callback from Modal.cofirm is not used
  Modal.confirm({
    content: <ConfirmMessage names={names} />,
    okText: 'Yes',
    okType: 'danger',
    cancelText: 'No',
    onOk: onConfirm,
  })
}
