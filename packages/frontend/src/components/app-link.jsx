import { Typography } from 'antd'
import React from 'react'
import { Link as BaseLink } from 'react-router-dom'

export default function Link ({ children, ...props }) {
  return <BaseLink component={Typography.Link} {...props}>{children}</BaseLink>
}
