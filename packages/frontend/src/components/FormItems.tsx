import { CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { Button, Col, Form, Input, InputNumber, Radio, Row, Select, Space, Switch } from 'antd'
import React from 'react'

type Options = { [key: string]: string }
type JSXS = JSX.Element | JSX.Element[]

type FormItem = { name: string | string[], label?: string, placeholder?: string, rules?: any[] }

type ColsProps = { children: JSXS, label?: string, condition?: boolean, style?: React.CSSProperties }
export function Cols ({ children, label, condition = true, style }: ColsProps) {
  if (!condition) return <></>

  const count = React.Children.count(children)
  return (
    <Form.Item label={label} style={{ marginBottom: 0 }}>
      <Row style={style}>
        {React.Children.map(children, (child, idx) => {
          const style: React.CSSProperties = {
            marginLeft: idx === 0 ? 0 : '4px',
            marginRight: idx === count - 1 ? 0 : '4px',
          }
          return <Col key={idx} flex="1" style={style}>{child}</Col>
        })}
      </Row>
    </Form.Item>
  )
}

type FormInputProps = FormItem
export function FormInput ({ name, label, placeholder, rules }: FormInputProps) {
  return (
    <Form.Item name={name} label={label} rules={rules}>
      <Input placeholder={placeholder} />
    </Form.Item>
  )
}

type FormNumberProps = FormItem & { min: number, max: number }
export function FormNumber ({ name, label, min = 0, max = 100 }: FormNumberProps) {
  return (
    <Form.Item name={name} label={label}>
      <InputNumber min={min} max={max} />
    </Form.Item>
  )
}

type FormTextAreaProps = FormItem & { rows?: number }
export function FormTextArea ({ name, label, rows = 2 }: FormTextAreaProps) {
  return (
    <Form.Item name={name} label={label}>
      <Input.TextArea rows={rows} style={{ resize: 'none' }} />
    </Form.Item>
  )
}

type FormSwitchProps = FormItem
export function FormSwitch ({ name, label }: FormSwitchProps) {
  return (
    <Space>
      <Form.Item name={name} valuePropName="checked" noStyle>
        <Switch size="small" checkedChildren={<CheckOutlined />} unCheckedChildren={<CloseOutlined />} />
      </Form.Item>
      {label}
    </Space>
  )
}

type FormSelectProps = FormItem & { options: Options }
export function FormSelect ({ name, label, options = {}, placeholder, ...props }: FormSelectProps) {
  return (
    <Form.Item name={name} label={label} {...props}>
      <Select showSearch placeholder={placeholder}>
        {Object.entries(options).map((x, idx) => (
          <Select.Option key={idx} value={x[0]}>{x[1]}</Select.Option>
        ))}
      </Select>
    </Form.Item>
  )
}

type FormRadioProps = FormItem & { options: Options }
export function FormRadio ({ name, label, options = {} }: FormRadioProps) {
  return (
    <Form.Item name={name} label={label}>
      <Radio.Group style={{ display: 'flex', width: '100%' }}>
        {Object.entries(options).map((x, idx) => (
          <Radio.Button key={idx} value={x[0]} style={{ flex: 1, textAlign: 'center' }}>{x[1]}</Radio.Button>
        ))}
      </Radio.Group>
    </Form.Item>
  )
}

type FormButtonProps = { children: React.ReactNode, icon?: React.ReactNode, style?: React.CSSProperties }
export function FormButton ({ children, icon, style }: FormButtonProps) {
  return (
    <Form.Item style={style}>
      <Button type="primary" htmlType="submit" icon={icon}>
        {children}
      </Button>
    </Form.Item>
  )
}
