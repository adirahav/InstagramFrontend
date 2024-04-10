import io from 'socket.io-client'
import { userService } from './user.service'

// =========================
// AUTH
// =========================
const SOCKET_EMIT_LOGIN = 'set-user-socket'
const SOCKET_EMIT_LOGOUT = 'unset-user-socket'

// =========================
// FOLLOWER
// =========================
export const SOCKET_FOLLOWER_SET_ONLINE = 'follower-set-online'
export const SOCKET_FOLLOWER_SET_OFFLINE = 'follower-set-offline'

// =========================
// CHAT
// =========================

export const SOCKET_CHAT_NEW_PRIVATE_MESSAGE = 'chat-new-private-message'

// =========================
// NOTIFICATION
// =========================
export const SOCKET_NOTIFICATION_POST_LIKED = 'notification-post-liked'
export const SOCKET_NOTIFICATION_POST_COMMENT_ADDED = 'notification-post-comment-added'
export const SOCKET_NOTIFICATION_POST_ADDED = 'notification-post-added'

const baseUrl = (process.env.NODE_ENV === 'production') ? '' : '//localhost:3031'
export const socketService = createSocketService()

// for debugging from console
window.socketService = socketService

socketService.setup()

function createSocketService() {
    var socket = null
    const socketService = {
        setup() {
            socket = io(baseUrl)
            const user = userService.getLoggedinUser()
            if (user) this.login(user)
        },
        on(eventName, cb) {
            socket.on(eventName, cb)
        },
        off(eventName, cb = null) {
            if (!socket) return
            if (!cb) socket.removeAllListeners(eventName)
            else socket.off(eventName, cb)
        },
        emit(eventName, data) {
            socket.emit(eventName, data)
        },
        login(user) {
            socket.emit(SOCKET_EMIT_LOGIN, user)
        },
        logout() {
            socket.emit(SOCKET_EMIT_LOGOUT)
        },
        terminate() {
            socket = null
        }
    }
    return socketService
}

