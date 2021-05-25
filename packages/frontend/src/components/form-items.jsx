import { CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { Space, Form, Switch, Button, InputNumber, Select, Row, Col } from 'antd'
import React, { useState } from 'react'

export function Cols ({ children, label = null, style }) {
  if (!Array.isArray(children)) children = [children]

  return (
    <Form.Item label={label} style={{ marginBottom: 0 }}>
      <Row className={'child-margin-8'} style={style}>
        {children.map((el, idx) => <Col key={idx} flex={1}>{el}</Col>)}
      </Row>
    </Form.Item>
  )
}

export function FormSwitch ({ name, label }) {
  return (
    <Space>
      <Form.Item name={name} valuePropName={'checked'} noStyle>
        <Switch size={'small'} checkedChildren={<CheckOutlined />} unCheckedChildren={<CloseOutlined />} />
      </Form.Item>
      {label}
    </Space>
  )
}

export function FormSelect ({ name, label, options, ...props }) {
  return (
    <Form.Item name={name} label={label} {...props}>
      <Select>
        {options.map((x, idx) => (
          <Select.Option key={idx} value={x}>{x}</Select.Option>
        ))}
      </Select>
    </Form.Item>
  )
}

export function FormNumber ({ name, label, min = 0, max = 100, size = 'default' }) {
  return (
    <Form.Item name={name} label={label}>
      <InputNumber min={min} max={max} size={size} />
    </Form.Item>
  )
}

export function FromButton ({ children, icon = null }) {
  const [loading, setLoading] = useState(false)

  return (
    <Form.Item>
      <Button type="primary" htmlType="submit" icon={icon} loading={loading} onClick={() => setLoading(true)}>
        {children}
      </Button>
    </Form.Item>
  )
}
