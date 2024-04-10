
import { HAS_NEW_NOTIFICATION } from "../reducers/notification.reducer.js"
import { store } from "../store.js"

export async function showNewNotificationIndication(display) {
    store.dispatch({ type: HAS_NEW_NOTIFICATION, display })
}


