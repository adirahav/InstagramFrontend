import { hasNewNotifications } from '../store/actions/user.actions.js'
import { httpService } from './http.service.js'
import { userService } from './user.service.js'

const STORAGE_KEY_LOGGEDIN_USER = 'loggedinUser'

const BASE_URL = 'auth/'

export const authService = {
    login,
    signup,
    logout
}
async function login(credentials) {
    //console.log("login credentials: " + JSON.stringify(credentials))
    const user = await httpService.post(BASE_URL + 'login', credentials)
    
    if (user) {
        hasNewNotifications(user.unreadNotification ?? false)
        return userService.saveLocalUser(user)
    }
}

async function signup(credentials) {
    //console.log("signup credentials: " + JSON.stringify(credentials))
    const user = await httpService.post(BASE_URL + 'signup', credentials)
    if (user) {
        return userService.saveLocalUser(user)
    }
}

async function logout() {
    await httpService.post(BASE_URL + 'logout')
    sessionStorage.removeItem(STORAGE_KEY_LOGGEDIN_USER)
}

