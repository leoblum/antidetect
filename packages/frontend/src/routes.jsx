import { SingIn, SingUp, ResetPassword } from 'Pages/Auth'
import EditProfile from 'Pages/EditProfile'
import EditProxy from 'Pages/EditProxy'
import ListProfiles from 'Pages/ListProfiles'
import ListProxies from 'Pages/ListProxies'

const Routes = {
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

  default: '/profiles',
}

export default Routes
