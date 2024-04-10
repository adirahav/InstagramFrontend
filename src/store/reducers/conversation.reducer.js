export const NEW_MESSAGE = 'NEW_MESSAGE'
export const RESET_MESSAGE = 'RESET_MESSAGE'

const initialState = {
    newMessage: null
}

export function conversationReducer(state = initialState, action = {}) {
    
    switch (action.type) {
        case NEW_MESSAGE:
            return {
                ...state,
                newMessage: action.message,
            }

        case RESET_MESSAGE:
            return {
                ...state,
                newMessage: null,
            }

        default:
            return state
    }
}