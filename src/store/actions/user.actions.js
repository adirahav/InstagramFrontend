import { authService } from "../../services/auth.service.js"
import { socketService } from "../../services/socket.service.js"
import { userService } from "../../services/user.service.js"
import { LOADING_DONE, LOADING_START } from "../reducers/app.reducer.js"
import { LOGGEDIN_USER, UPDATE_USER, SIGNUP, LOGIN, LOGOUT, GET_SUGGESTIONS, GET_NOTIFICATIONS, GET_FOLLOWINGS, FOLLOW_USER, UNFOLLOW_USER, SET_FOLLOWER_ONLINE, HAS_NEW_NOTIFICATION, SAVE_UNREAD_MESSAGE, UNSAVE_READ_MESSAGE, IS_NOTIFICATIONS_VISIBLE, SAVE_UNREAD_NOTIFICATION, UNSAVE_READ_NOTIFICATION } from "../reducers/user.reducer.js"
import { store } from "../store.js"

export function setLoggedinUser(loggedinUser) {
    try {
        store.dispatch({type: LOGGEDIN_USER, loggedinUser})
    } catch(err) {
        console.log("Had issues loggedin user")
        throw err
    }
}
export async function updateUser(userToSave) {
    try {   
        store.dispatch({ type: LOADING_START })
        const savedUser = await userService.update(userToSave)
        store.dispatch({type: UPDATE_USER, userToSave})
    } catch(err) {
        console.log("Had issues updating user")
        throw err
    } finally {
        store.dispatch({ type: LOADING_DONE })
    }
}

export async function signup(credentials) {
    try { 
        store.dispatch({ type: LOADING_START })
        const signupUser = await authService.signup(credentials)
        console.log(`${signupUser.fullname} signup succesfully!`)
        store.dispatch({type: SIGNUP, signupUser})
    } catch(err) {
        console.log(`User had issues signup`)
        throw err
    } finally {
        store.dispatch({ type: LOADING_DONE })
    }
}

export async function login(credentials) {
    try { 
        store.dispatch({ type: LOADING_START })
        const loggedinUser = await authService.login(credentials)
        socketService.login(loggedinUser)
        store.dispatch({type: LOGIN, loggedinUser})
    } catch(err) {
        console.log(`${credentials.identifier} had issues login`)
        throw err
    } finally {
        store.dispatch({ type: LOADING_DONE })
    }
}

export async function logout() {
    try {   
        socketService.logout()
        await authService.logout()
        store.dispatch({type: LOGOUT})
    } catch(err) {
        console.log("Had issues logged out user")
        throw err
    }
}

export async function loadNotifications(loggedinUser) {
    try {
       const notifications = await userService.queryNotifications(loggedinUser)
        store.dispatch({type: GET_NOTIFICATIONS, notifications, isVisible: true})
    } catch(err) {
        console.log("Had issues loading notifications")
        throw err
    } 
}

export function hasNewNotifications(existNewNotifications) {
    try {
        store.dispatch({type: HAS_NEW_NOTIFICATION, existNewNotifications})
    } catch(err) {
        console.log("Had issues loading notifications")
        throw err
    } 
}

export function isNotificationsVisible(isVisible) {
    try {
        store.dispatch({type: IS_NOTIFICATIONS_VISIBLE, isVisible})
    } catch(err) {
        console.log("Had issues display notifications")
        throw err
    } 
}

export async function loadSuggestions() {
    try {
        const suggestions = await userService.querySuggestions()
        store.dispatch({type: GET_SUGGESTIONS, suggestions})
    } catch(err) {
        console.log("Had issues loading suggestions")
        throw err
    } 
}

export async function loadFollowings() {
    try {
        const followings = await userService.queryFollowings()
        store.dispatch({type: GET_FOLLOWINGS, followings})
    } catch(err) {
        console.log("Had issues loading followings")
        throw err
    } 
}

export async function followUser(user) {
    const loggedinUser = userService.getLoggedinUser()
    if (!loggedinUser) throw 'user error'
    
    try {   
        await userService.follow(user._id)
        store.dispatch({type: FOLLOW_USER, user })
    } catch(err) {
        console.log("Had issues follow user")
        throw err
    } 
}

export async function unfollowUser(user) {
    const loggedinUser = userService.getLoggedinUser()
    if (!loggedinUser) throw 'user error'
    
    try {   
        await userService.unfollow(user._id)
        //await delay(2000)   // TO DELETE
        store.dispatch({type: UNFOLLOW_USER, user })
    } catch(err) {
        console.log("Had issues unfollow user")
        throw err
    } 
}

export function setFollowerOnline(data) {
    try {
        store.dispatch({type: SET_FOLLOWER_ONLINE, username: data.username, isOnline: data.isOnline})
    } catch(err) {
        console.log("Had issues set follower online/offline")
        throw err
    } 
}

export async function saveUnreadMessage(loggedinUser, unreadMessage) {
    
    try { 
        const userToSave = await userService.saveUnreadMessage(loggedinUser, unreadMessage)
        store.dispatch({type: SAVE_UNREAD_MESSAGE, unreadMessage})
        store.dispatch({type: UPDATE_USER, userToSave})
    } catch(err) {
        console.log("Had issues save unread message")
        throw err
    } 
}

export async function unsaveReadMessage(loggedinUser, readMessage) {
    try {
        const userToSave = await userService.unsaveReadMessage(loggedinUser, readMessage)
        store.dispatch({type: UNSAVE_READ_MESSAGE, readMessage})
        store.dispatch({type: UPDATE_USER, userToSave})
    } catch(err) {
        console.log("Had issues unsave read message")
        throw err
    } 
}

export async function saveUnreadNotification(loggedinUser) {
    
    try { 
        const userToSave = await userService.saveUnreadNotification(loggedinUser)
        store.dispatch({type: SAVE_UNREAD_NOTIFICATION})
        store.dispatch({type: UPDATE_USER, userToSave})
    } catch(err) {
        console.log("Had issues save unread notification")
        throw err
    } 
}

export async function unsaveReadNotification(loggedinUser) {
    try {
        const userToSave = await userService.unsaveReadNotification(loggedinUser)
        store.dispatch({type: UNSAVE_READ_NOTIFICATION})
        store.dispatch({type: UPDATE_USER, userToSave})
    } catch(err) {
        console.log("Had issues unsave read notification")
        throw err
    } 
}
