import React from 'react'
import {Row, Col, Card, Layout, Typography, Form, Input, Button, Divider, notification} from 'antd'
import {UserOutlined, LockOutlined} from '@ant-design/icons'
import {Link, Switch, Route, Redirect, useHistory} from './router'
import backend from './../backend'
import {useAuth} from '../hooks/use-auth'

const emailItemProps = {
  name: 'email',
  rules: [
    {required: true, message: 'Please input your email!'},
    {type: 'email', message: 'The input is not valid email!'},
  ],
}

const passwordItemProps = {
  name: 'password',
  rules: [
    {required: true, message: 'Please input your password!'},
  ],
}

function showNotificationByResponse ({success, message = null, ...props}) {
  let handler = notification[success ? 'success' : 'error']
  let tokens = {
    email_already_used: 'Email already used.',
    email_not_confirmed: 'Email not confirmed.',
    wrong_password: 'Invalid email or password.',
    reset_link_sent: 'Password reset link sent to email.',
    confirmation_link_sent: 'Confirmation link sent to email.',
  }

  if (!success && !tokens[message]) console.warn('unknown message', message, props)

  message = tokens[message]
  return message ? handler({message}) : null
}

function SingInForm () {
  const history = useHistory()

  async function onFinish (values) {
    const response = await backend.login(values)
    showNotificationByResponse(response)
    return response.success ? history.replace('/') : null
  }

  return (
    <Form name="sign-in" initialValues={{remember: true}} onFinish={onFinish} layout="vertical">
      <Divider>Login</Divider>

      <Form.Item {...emailItemProps}>
        <Input prefix={<UserOutlined className="site-form-item-icon"/>} placeholder="Email address"/>
      </Form.Item>

      <Form.Item {...passwordItemProps}>
        <Input.Password prefix={<LockOutlined className="site-form-item-icon"/>} placeholder="Password"/>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" style={{width: '100%'}}>Login</Button>
      </Form.Item>

      <Row justify="space-between" style={{fontSize: '12px'}}>
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
  const history = useHistory()

  async function onFinish (values) {
    const response = await backend.createUser(values)
    showNotificationByResponse(response)
    return response.success ? history.push('/auth/login') : null
  }

  return (
    <Form name="sign-up" initialValues={{remember: true}} onFinish={onFinish} layout="vertical">
      <Divider>Create Account</Divider>

      <Form.Item {...emailItemProps}>
        <Input prefix={<UserOutlined className="site-form-item-icon"/>} placeholder="Email address"/>
      </Form.Item>

      <Form.Item {...passwordItemProps}>
        <Input.Password prefix={<LockOutlined className="site-form-item-icon"/>} placeholder="Password"/>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" style={{width: '100%'}}>Create Account</Button>
      </Form.Item>

      <Row justify="space-between" style={{fontSize: '12px'}}>
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
  const history = useHistory()

  async function onFinish (values) {
    const response = await backend.resetPassword(values)
    showNotificationByResponse(response)
    history.push('/auth/login')
  }

  return (
    <Form name="reset-password" initialValues={{remember: true}} onFinish={onFinish} layout="vertical">
      <Divider>Reset Password</Divider>
      <Typography.Text style={{fontSize: '13px', textAlign: 'center', display: 'block', marginBottom: '12px'}}>
        Please provide your email address and we’ll send you instructions on how to change your password.
      </Typography.Text>

      <Form.Item {...emailItemProps}>
        <Input prefix={<UserOutlined className="site-form-item-icon"/>} placeholder="Email address"/>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" style={{width: '100%'}}>Reset Password</Button>
      </Form.Item>

      <Row justify="space-between" style={{fontSize: '12px'}}>
        <Col>
          <Link to="/auth/login">Login</Link>
        </Col>
      </Row>
    </Form>
  )
}

export default function AuthPage () {
  const auth = useAuth()
  if (auth) return <Redirect to="/"/>

  return (
    <Layout style={{minHeight: '100vh'}}>
      <Layout.Content>
        <Row type="flex" justify="center" align="middle" style={{minHeight: '100vh'}}>
          <Col style={{width: '350px'}}>
            <Card>
              <Switch>
                <Route path="/auth/login" component={SingInForm}/>
                <Route path="/auth/create" component={SingUpForm}/>
                <Route path="/auth/reset" component={ResetForm}/>
                <Route path="/auth/*">
                  <Redirect to="/auth/login"/>
                </Route>
              </Switch>
            </Card>
          </Col>
        </Row>
      </Layout.Content>
    </Layout>
  )
}
