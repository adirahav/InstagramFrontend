import { storageService } from './async-storage.service.js'
import { httpService } from './http.service.js'

const STORAGE_KEY = 'users'
const STORAGE_KEY_LOGGEDIN_USER = 'loggedinUser'

const BASE_URL = 'user/'

export const userService = {
    update,
    follow,
    unfollow,
    queryNotifications,
    querySuggestions,
    queryFollowings,
    getConversation,
    unsaveReadMessage,
    saveUnreadMessage,
    saveUnreadNotification,
    unsaveReadNotification,
    getLoggedinUser,
    saveLocalUser,
    getDefaultUser,
}

async function queryNotifications(loggedinUser) {
    const notifications = await httpService.get(BASE_URL + 'notifications/')
    unsaveReadNotification(loggedinUser)
    return notifications
}

async function querySuggestions() {
    const suggestions = await httpService.get(BASE_URL + 'suggestions/')
    return suggestions
}

async function queryFollowings() {
    const followings = await httpService.get(BASE_URL + 'followings/')
    return followings
}

async function getConversation(loggedinUserId, followId) {
    const followUser = await httpService.get(BASE_URL + followId + '/')
    return {
        followUser,
        conversation: []
    } 
}

async function saveUnreadMessage(loggedinUser, unreadMessage) {
    
    await httpService.put(BASE_URL + 'saveUnreadMessage/', unreadMessage)
    
    const messageToSave = {
        from: unreadMessage.from, 
        txt: unreadMessage.txt, 
        createdAt: unreadMessage.createdAt
    }

    const updatedLoggedinUser = 
        loggedinUser.unreadMessages && !loggedinUser.unreadMessages.some(message => message.from === messageToSave.from)
            ? {
                ...loggedinUser, 
                unreadMessages: loggedinUser.unreadMessages 
                                    ?  [...loggedinUser.unreadMessages, messageToSave]
                                    : [messageToSave]
              }
            : loggedinUser
    
    
    saveLocalUser(updatedLoggedinUser)

    return updatedLoggedinUser
        
}

async function unsaveReadMessage(loggedinUser, readMessage) {
    await httpService.put(BASE_URL + 'unsaveReadMessage/', readMessage)
    
    const updatedLoggedinUser = {
        ...loggedinUser, 
        unreadMessages: loggedinUser.unreadMessages?.filter(message => message.from !== readMessage.from)
    } 

    saveLocalUser(updatedLoggedinUser)
    
    return updatedLoggedinUser
        
}


async function saveUnreadNotification(loggedinUser) {
    
    await httpService.put(BASE_URL + 'saveUnreadNotification/')
    
    const updatedLoggedinUser = {
        ...loggedinUser, 
        unreadNotification: true
    } 
    saveLocalUser(updatedLoggedinUser)

    return updatedLoggedinUser
        
}

async function unsaveReadNotification(loggedinUser) {
    await httpService.put(BASE_URL + 'unsaveReadNotification/')
    
    const updatedLoggedinUser = {
        ...loggedinUser, 
        unreadNotification: false
    } 
    saveLocalUser(updatedLoggedinUser)

    return updatedLoggedinUser
        
}

async function update(userToUpdate) {
    const updatedUser = await httpService.put(BASE_URL, userToUpdate)
    if (getLoggedinUser()._id === updatedUser._id) {
        saveLocalUser(updatedUser)
    }
    return updatedUser
}


async function follow(userToFollow) {
    
    if (getLoggedinUser()._id !== userToFollow) {
        await httpService.put(BASE_URL + userToFollow + '/follow/')
    }
    return userToFollow
}

async function unfollow(userToUnfollow) {
    if (getLoggedinUser()._id !== userToUnfollow) {
        await httpService.put(BASE_URL + userToUnfollow + '/unfollow/')
    }
    return userToUnfollow
}

function getLoggedinUser() {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY_LOGGEDIN_USER))
}

function saveLocalUser(user) {
    user = {
        _id: user._id, 
        username: user.username, 
        fullname: user.fullname, 
        profilePicture: user.profilePicture,
        hasNewNotifications: user.newNotification,
        unreadMessages: user.unreadMessages,
        unreadNotification: user.unreadNotification,
    }

    sessionStorage.setItem(STORAGE_KEY_LOGGEDIN_USER, JSON.stringify(user))
    return user
}

function getDefaultUser() {
    return {
        contact: '',
        fullname: '',
        username: '',
        password: '',
        profilePicture: '',
    }
}

