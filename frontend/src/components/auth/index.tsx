import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Card, Col, Divider, Form, Input, Layout, Row, Typography } from 'antd'
import React from 'react'

import backend from '@/backend'
import { notifyByApiCode } from '@/components/Notify'
import { Link } from '@/components/Router'
import { useRouter } from '@/hooks'

const emailItemProps = {
  name: 'email',
  rules: [
    { required: true, message: 'Please input your email!' },
    { type: 'email' as const, message: 'The input is not valid email!' },
  ],
}

const passwordItemProps = {
  name: 'password',
  rules: [
    { required: true, message: 'Please input your password!' },
  ],
}

function SingInForm () {
  const router = useRouter()

  async function onFinish (values: any) {
    const response = await backend.auth.login(values)
    notifyByApiCode(response)
    return response.success ? router.replace('/') : null
  }

  return (
    <Form name="sign-in" onFinish={onFinish} layout="vertical">
      <Divider>Login</Divider>

      <Form.Item {...emailItemProps}>
        <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Email address" />
      </Form.Item>

      <Form.Item {...passwordItemProps}>
        <Input.Password prefix={<LockOutlined className="site-form-item-icon" />} placeholder="Password" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" style={{ width: '100%' }}>Login</Button>
      </Form.Item>

      <Row justify="space-between" style={{ fontSize: '12px' }}>
        <Col>
          <Link to="/auth/create">Create account</Link>
        </Col>
        <Col>
          <Link to="/auth/reset">Reset password</Link>
        </Col>
      </Row>
    </Form>
  )
}

function SingUpForm () {
  const router = useRouter()

  async function onFinish (values: any) {
    const response = await backend.users.create(values)
    notifyByApiCode(response)
    return response.success ? router.push('/auth/login') : null
  }

  return (
    <Form name="sign-up" onFinish={onFinish} layout="vertical">
      <Divider>Create Account</Divider>

      <Form.Item {...emailItemProps}>
        <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Email address" />
      </Form.Item>

      <Form.Item {...passwordItemProps}>
        <Input.Password prefix={<LockOutlined className="site-form-item-icon" />} placeholder="Password" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" style={{ width: '100%' }}>Create Account</Button>
      </Form.Item>

      <Row justify="space-between" style={{ fontSize: '12px' }}>
        <Col>
          <Link to="/auth/login">Login</Link>
        </Col>
        <Col>
          <Link to="/auth/reset">Reset password</Link>
        </Col>
      </Row>
    </Form>
  )
}

function ResetForm () {
  const router = useRouter()

  async function onFinish (values: any) {
    const response = await backend.users.resetPassword(values)
    notifyByApiCode(response)
    router.push('/auth/login')
  }

  return (
    <Form name="reset-password" onFinish={onFinish} layout="vertical">
      <Divider>Reset Password</Divider>
      <Typography.Text style={{ fontSize: '13px', textAlign: 'center', display: 'block', marginBottom: '12px' }}>
        Please provide your email address and we’ll send you instructions on how to change your password.
      </Typography.Text>

      <Form.Item {...emailItemProps}>
        <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Email address" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" style={{ width: '100%' }}>Reset Password</Button>
      </Form.Item>

      <Row justify="space-between" style={{ fontSize: '12px' }}>
        <Col>
          <Link to="/auth/login">Login</Link>
        </Col>
      </Row>
    </Form>
  )
}

function PageLayout ({ content }: { content: JSX.Element }) {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Content>
        <Row justify="center" align="middle" style={{ minHeight: '100vh' }}>
          <Col style={{ width: '350px' }}>
            <Card>
              {content}
            </Card>
          </Col>
        </Row>
      </Layout.Content>
    </Layout>
  )
}

export const SingIn = () => <PageLayout content={<SingInForm />} />
export const SingUp = () => <PageLayout content={<SingUpForm />} />
export const ResetPassword = () => <PageLayout content={<ResetForm />} />
