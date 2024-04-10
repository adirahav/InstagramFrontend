
import { NEW_MESSAGE, RESET_MESSAGE } from "../reducers/conversation.reducer.js"
import { store } from "../store.js"

export function showNewMessage(message) {
    store.dispatch({ type: NEW_MESSAGE, message })
}

export function resetMessage() {
    store.dispatch({ type: RESET_MESSAGE })
}
