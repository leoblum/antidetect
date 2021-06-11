import { Modal } from 'antd'
import React from 'react'

import { reactJoin } from '@/components/react-utils'
import { CallbackVoid } from '@/types'

function ConfirmMessage ({ names }: {names: string[]}) {
  const children = reactJoin(names, x => <u>{x}</u>, () => ', ')
  return (
    <div style={{ textAlign: 'left' }}>
      Are you sure to delete {children}?
    </div>
  )
}

export default function confirmDelete (names: string[], onConfirm: CallbackVoid): void {
  // todo: callback from Modal.cofirm is not used
  Modal.confirm({
    content: <ConfirmMessage names={names} />,
    okText: 'Yes',
    okType: 'danger',
    cancelText: 'No',
    onOk: onConfirm,
  })
}
