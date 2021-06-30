import { SingIn, SingUp, ResetPassword } from '@/components/auth'
import EditProfile from '@/components/profiles/Edit'
import ListProfiles from '@/components/profiles/List'
import EditProxy from '@/components/proxies/Edit'
import ListProxies from '@/components/proxies/List'
import { RoutesCfg } from '@/components/Router'

const Routes: RoutesCfg = {
  publicOnly: [
    { path: '/auth/login', component: SingIn },
    { path: '/auth/create', component: SingUp },
    { path: '/auth/reset', component: ResetPassword },
  ],

  authOnly: [
    { path: '/profiles/add', component: EditProfile },
    { path: '/profiles/edit/:profileId', component: EditProfile },
    { path: '/profiles', component: ListProfiles },

    { path: '/proxies/add', component: EditProxy },
    { path: '/proxies/edit/:proxyId', component: EditProxy },
    { path: '/proxies', component: ListProxies },
  ],

  defaultRedirect: '/profiles',
}

export default Routes
