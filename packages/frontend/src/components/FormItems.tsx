/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { Button, Col, Form, Input, InputNumber, Radio, Row, Select, Space, Switch } from 'antd'
import React from 'react'

import { Callback } from '@/types'

type Option = { value: string, title: string }
type Options = Option[]
type OneOrManyJSX = JSX.Element | JSX.Element[]

// function isObject (value: any) {
// if (Object.prototype.toString.call(value) !== '[object Object]') return false
//
// const prototype = Object.getPrototypeOf(value)
// return prototype === null || prototype === Object.prototype
// }

// function normalizeReactChildren (children) {
// if (!children) children = []
// if (!Array.isArray(children)) children = [children]
// return children
// }

type ColsProps = { children: OneOrManyJSX, label?: string, condition?: boolean, style?: React.CSSProperties }
export function Cols ({ children, label, condition = true, style }: ColsProps) {
  if (!condition) return <></>

  // children = normalizeReactChildren(children)
  // const props = []
  // for (let i = 0; i < children.length; ++i) {
  //   const marginLeft = i === 0 ? 0 : '4px'
  //   const marginRight = i === children.length - 1 ? 0 : '4px'
  //   const flex = children[i].props.flex || 1
  //   // delete children[i].props.flex
  //   props.push({ style: { marginLeft, marginRight }, flex })
  // }

  return (
    <Form.Item label={label} style={{ marginBottom: 0 }}>
      <Row style={style}>
        {React.Children.map(children, (child, idx) => <Col key={idx}>{child}</Col>)}
        {/* {children.map((el, idx) => <Col key={idx} {...props[idx]} >{el}</Col>)} */}
      </Row>
    </Form.Item>
  )
}

type FormInputProps = { name: string, label: string, placeholder: string }
export function FormInput ({ name, label, placeholder }: FormInputProps) {
  return (
    <Form.Item name={name} label={label}>
      <Input placeholder={placeholder} />
    </Form.Item>
  )
}

type FormNumberProps = { name: string, label: string, min: number, max: number }
export function FormNumber ({ name, label, min = 0, max = 100 }: FormNumberProps) {
  return (
    <Form.Item name={name} label={label}>
      <InputNumber min={min} max={max} />
    </Form.Item>
  )
}

type FormTextAreaProps = { name: string, label: string, rows: number }
export function FormTextArea ({ name, label, rows = 2 }: FormTextAreaProps) {
  return (
    <Form.Item name={name} label={label}>
      <Input.TextArea rows={rows} style={{ resize: 'none' }} />
    </Form.Item>
  )
}

type FormSwitchProps = { name: string, label: string, onChange: Callback }
export function FormSwitch ({ name, label, onChange }: FormSwitchProps) {
  return (
    <Space>
      <Form.Item name={name} valuePropName="checked" noStyle>
        <Switch size="small" checkedChildren={<CheckOutlined />} unCheckedChildren={<CloseOutlined />} onChange={onChange} />
      </Form.Item>
      {label}
    </Space>
  )
}

type FormSelectProps = { name: string, label: string, options: Options, placeholder: string }
export function FormSelect ({ name, label, options, placeholder, ...props }: FormSelectProps) {
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

type FormRadioProps = { name: string, label: string, options: Options, placeholder?: string }
export function FormRadio ({ name, label, options }: FormRadioProps) {
  return (
    <Form.Item name={name} label={label}>
      <Radio.Group style={{ display: 'flex', width: '100%' }}>
        {options.map((x, idx) => (
          <Radio.Button key={idx} value={x.value} style={{ flex: 1, textAlign: 'center' }}>{x.title}</Radio.Button>
        ))}
      </Radio.Group>
    </Form.Item>
  )
}

type FormButtonProps = { children: React.ReactNode, icon?: React.ReactNode }
export function FormButton ({ children, icon }: FormButtonProps) {
  return (
    <Form.Item>
      <Button type="primary" htmlType="submit" icon={icon}>
        {children}
      </Button>
    </Form.Item>
  )
}
