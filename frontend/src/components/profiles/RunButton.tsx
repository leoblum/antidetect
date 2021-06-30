import { PoweroffOutlined, CaretRightOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import React, { useState, useEffect } from 'react'

import native from '@/native-api'
import { Profile } from '@/types'

const RunButton = ({ profile }: { profile: Profile }) => {
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    setLoading(false)
  }, [profile])

  const onClick = async () => {
    setLoading(true)
    await native.chrome_start(profile._id)
  }

  const danger = false

  return (
    <Button
      type="primary" onClick={onClick} loading={loading}
      icon={profile.isActive ? <PoweroffOutlined /> : <CaretRightOutlined />}
      danger={danger}
    >
      Run
    </Button>
  )
}

export default RunButton
