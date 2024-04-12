import { Message } from "@mui/icons-material"
import { userService } from "../../services/user.service"

export const LOGGEDIN_USER = 'LOGGEDIN_USER'
export const LOGIN = 'LOGIN'
export const UPDATE_USER = 'UPDATE_USER'
export const DELETE_USER = 'DELETE_USER'
export const SIGNUP = 'SIGNUP'
export const LOGOUT = 'LOGOUT'
export const GET_NOTIFICATIONS = 'GET_NOTIFICATIONS'
export const HAS_NEW_NOTIFICATION = 'HAS_NEW_NOTIFICATION'
export const IS_NOTIFICATIONS_VISIBLE = 'IS_NOTIFICATIONS_VISIBLE'
export const IS_NOTIFICATIONS_LOADING = 'IS_NOTIFICATIONS_LOADING'
export const GET_SUGGESTIONS = 'GET_SUGGESTIONS'
export const GET_FOLLOWINGS = 'GET_FOLLOWINGS'
export const FOLLOW_USER = 'FOLLOW_USER'
export const UNFOLLOW_USER = 'UNFOLLOW_USER'
export const SET_FOLLOWER_ONLINE = 'SET_FOLLOWER_ONLINE'
export const SAVE_UNREAD_MESSAGE = 'SAVE_UNREAD_MESSAGE'
export const UNSAVE_READ_MESSAGE = 'UNSAVE_READ_MESSAGE'
export const SAVE_UNREAD_NOTIFICATION = 'SAVE_UNREAD_NOTIFICATION'
export const UNSAVE_READ_NOTIFICATION = 'UNSAVE_READ_NOTIFICATION'

const initialState = {
    //users: null,
    loggedinUser: userService.getLoggedinUser(),
    notifications: null,
    suggestions: null,
    followings: null,
}

export function userReducer(state = initialState, action = {}) {
            
    switch (action.type) {
        case LOGGEDIN_USER:
        case LOGIN:
            return {
                ...state,
                loggedinUser: action.loggedinUser,
            }

        case UPDATE_USER:
            return {
                ...state,
                loggedinUser: action.userToSave
            }

        case DELETE_USER:
            return {
                ...state,
                //users: state.users.filter(user => user.id !== action.userID),
                lastUsers: [...state.users]
            }

        case SIGNUP:
            return {
                ...state,
                //users: state.users.concat(action.signupUser),
                loggedinUser: action.signupUser
            }

        case LOGOUT:
            return {
                ...state,
                loggedinUser: null
            } 

        case GET_NOTIFICATIONS:
            return {
                ...state,
                notifications: { 
                    list: action.notifications,
                    hasNewNotification: action.hasNewNotification,
                    isLoading: action.isLoading,
                    isVisible: action.isVisible
                }
            } 

        case GET_SUGGESTIONS:
            return {
                ...state,
                suggestions: action.suggestions
            } 

        case GET_FOLLOWINGS:
            return {
                ...state,
                followings: action.followings
            }

        case FOLLOW_USER:
        case UNFOLLOW_USER:
            return {
                ...state,
                suggestions: state.suggestions?.map(suggestion =>
                    suggestion.follower._id === action.user._id
                        ? { ...suggestion, following: !suggestion.following }
                        : suggestion),
                notifications: { 
                        ...state.notifications, 
                        list: state.notifications?.list?.map(notification =>
                            notification._id === action.user._id
                                ? { ...notification, following: !notification.following }
                                : notification)
                    },
                followings: action.type === FOLLOW_USER
                                ? [...state.followings ?? [], action.user]
                                : state.followings?.filter(follower => follower._id !== action.user._id)
            }

        case HAS_NEW_NOTIFICATION:
            return {
                ...state,
                notifications: { 
                        ...state.notifications, 
                        hasNewNotification: action.existNewNotifications
                    },
            }

        case IS_NOTIFICATIONS_VISIBLE:
            return {
                ...state,
                notifications: { 
                        ...state.notifications, 
                        isVisible: action.isVisible
                    },
            }

        case IS_NOTIFICATIONS_LOADING:
            return {
                ...state,
                notifications: { 
                        ...state.notifications, 
                        isLoading: action.isLoading
                    },
            }

        case SET_FOLLOWER_ONLINE:
            return {
                ...state,
                followings: state.followings?.map(follower =>
                    follower.username === action.username
                        ? { ...follower, isOnline: action.isOnline }
                        : follower),
            }

        case SAVE_UNREAD_MESSAGE: 
            return {
                ...state,
                loggedinUser: { 
                    ...state.loggedinUser, 
                    unreadMessages: state.loggedinUser.unreadMessages
                                        ? [...state.loggedinUser.unreadMessages, action.unreadMessage]
                                        : [action.unreadMessage]
                },
            }

        case UNSAVE_READ_MESSAGE: 
            
            return {
                ...state,
                loggedinUser: { 
                    ...state.loggedinUser, 
                    unreadMessages: state.loggedinUser.unreadMessages?.filter(message => message.from !== action.readMessage.from)
                },
            }

        case SAVE_UNREAD_NOTIFICATION: 
            return {
                ...state,
                loggedinUser: { 
                    ...state.loggedinUser, 
                    unreadNotification: true
                },
            }

        case UNSAVE_READ_NOTIFICATION: 
            return {
                ...state,
                loggedinUser: { 
                    ...state.loggedinUser, 
                    unreadNotification: false
                },
            }

        default:
            return state
    }
}