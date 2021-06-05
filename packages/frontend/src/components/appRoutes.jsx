import { SingIn, SingUp, ResetPassword } from './pages/auth'
import ProfileEdit from './pages/profileEdit'
import ProfilesList from './pages/profilesList'
import ProxiesList from './pages/proxiesList'
import ProxyEdit from './pages/proxyEdit'

const Routes = {
  publicOnly: [
    { path: '/auth/login', component: SingIn },
    { path: '/auth/create', component: SingUp },
    { path: '/auth/reset', component: ResetPassword },
  ],

  authOnly: [
    { path: '/profiles/add', component: ProfileEdit },
    { path: '/profiles/edit/:profileId', component: ProfileEdit },
    { path: '/profiles', component: ProfilesList },

    { path: '/proxies/add', component: ProxyEdit },
    { path: '/proxies/edit/:proxyId', component: ProxyEdit },
    { path: '/proxies', component: ProxiesList },
  ],

  default: '/profiles',
}

export default Routes
