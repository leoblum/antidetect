import { SingIn, SingUp, ResetPassword } from './page-auth'
import ProfileEdit from './page-profile-edit'
import Profiles from './page-profiles'

const Routes = {
  publicOnly: [
    { path: '/auth/login', component: SingIn },
    { path: '/auth/create', component: SingUp },
    { path: '/auth/reset', component: ResetPassword },
  ],

  authOnly: [
    { path: '/profiles/add', component: ProfileEdit },
    { path: '/profiles/edit/:profileId', component: ProfileEdit },
    { path: '/profiles', component: Profiles },
  ],

  default: '/profiles',
}

export default Routes
