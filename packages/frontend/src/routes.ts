import { RoutesCfg } from '@/components/Router'
import { SingIn, SingUp, ResetPassword } from '@/pages/Auth'
import EditProfile from '@/pages/EditProfile'
import EditProxy from '@/pages/EditProxy'
import ListProfiles from '@/pages/ListProfiles'
import ListProxies from '@/pages/ListProxies'

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
