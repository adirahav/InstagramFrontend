export const HAS_NEW_NOTIFICATION = 'HAS_NEW_NOTIFICATION'

const initialState = {
    hasNewNotification: false
}

export function notificationReducer(state = initialState, action = {}) {
    
    switch (action.type) {
        case HAS_NEW_NOTIFICATION:
            return {
                ...state,
                hasNewNotification: action.display,
            }

        default:
            return state
    }
}