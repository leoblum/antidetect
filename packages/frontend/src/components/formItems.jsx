import { CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { Space, Form, Switch, Button, InputNumber, Select, Row, Col, Radio, Input } from 'antd'
import React, { useState } from 'react'

function isObject (value) {
  if (Object.prototype.toString.call(value) !== '[object Object]') return false

  const prototype = Object.getPrototypeOf(value)
  return prototype === null || prototype === Object.prototype
}

function normalizeReactChildren (children) {
  if (!children) children = []
  if (!Array.isArray(children)) children = [children]
  return children
}
export function Cols ({ children, label = null, style, condition = true }) {
  if (!condition) return <></>

  children = normalizeReactChildren(children)

  const props = []
  for (let i = 0; i < children.length; ++i) {
    const marginLeft = i === 0 ? 0 : '4px'
    const marginRight = i === children.length - 1 ? 0 : '4px'
    const flex = children[i].props.flex || 1
    // delete children[i].props.flex
    props.push({ style: { marginLeft, marginRight }, flex })
  }

  return (
    <Form.Item label={label} style={{ marginBottom: 0 }}>
      <Row style={style}>
        {children.map((el, idx) => <Col key={idx} {...props[idx]} >{el}</Col>)}
      </Row>
    </Form.Item>
  )
}

export function FormInput ({ name, label, placeholder, ...props }) {
  return (
    <Form.Item name={name} label={label} {...props}>
      <Input placeholder={placeholder} />
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

export function FormTextArea ({ name, label, rows = 2, style = null }) {
  return (
    <Form.Item name={name} label={label}>
      <Input.TextArea rows={rows} style={{ resize: 'none', ...style }} />
    </Form.Item>
  )
}

export function FormSwitch ({ name, label }) {
  return (
    <Space>
      <Form.Item name={name} valuePropName="checked" noStyle>
        <Switch size="small" checkedChildren={<CheckOutlined />} unCheckedChildren={<CloseOutlined />} />
      </Form.Item>
      {label}
    </Space>
  )
}

export function FormSelect ({ name, label, options, placeholder, ...props }) {
  options = options.map(x => isObject(x) ? x : { value: x, title: x })

  return (
    <Form.Item name={name} label={label} {...props}>
      <Select showSearch placeholder={placeholder}>
        {options.map((x, idx) => (
          <Select.Option key={idx} value={x.value}>{x.title}</Select.Option>
        ))}
      </Select>
    </Form.Item>
  )
}

export function FormRadio ({ name, label, options, ...props }) {
  return (
    <Form.Item name={name} label={label} {...props}>
      <Radio.Group style={{ display: 'flex', width: '100%' }}>
        {options.map((x, idx) => (
          <Radio.Button key={idx} value={x.value} style={{ flex: 1, textAlign: 'center' }}>{x.title}</Radio.Button>
        ))}
      </Radio.Group>
    </Form.Item>
  )
}

export function FormButton ({ children, icon = null, ...props }) {
  const [loading, setLoading] = useState(false)

  const onClick = () => null

  return (
    <Form.Item {...props}>
      <Button type="primary" htmlType="submit" icon={icon} loading={loading} onClick={onClick}>
        {children}
      </Button>
    </Form.Item>
  )
}
