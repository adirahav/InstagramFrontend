import { GET_DYNAMIC_MODAL_DATA, LOADING_DONE, LOADING_START } from "../reducers/app.reducer.js"
import { store } from "../store.js"

export function onToggleModal(modalData = null) {
    try {
        store.dispatch({ type: GET_DYNAMIC_MODAL_DATA, modalData })
    } catch(err) {
        console.log("Had issues loading modal data")
        throw err
    }
}

export function onLoadingStart() {
    try {
        store.dispatch({ type: LOADING_START })
    } catch(err) {
        console.log("Had issues start loading")
        throw err
    }
}


export function onLoadingDone() {
    try {
        store.dispatch({ type: LOADING_DONE })
    } catch(err) {
        console.log("Had issues done loading")
        throw err
    }
}