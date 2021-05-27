import PageProfileEditor from '../old/components/PageProfileEditor'
import PageProfilesList from '../old/components/PageProfilesList'

import { SingIn, SingUp, ResetPassword } from './pages/auth'
import ProfileEdit from './pages/profileEdit'
import ProfilesList from './pages/profilesList'

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

    { path: '/profiles-old/:profileId', component: PageProfileEditor },
    { path: '/profiles-old', component: PageProfilesList },

  ],

  default: '/profiles',
}

export default Routes
