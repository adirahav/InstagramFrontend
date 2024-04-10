export const GET_DYNAMIC_MODAL_DATA = 'GET_DYNAMIC_MODAL_DATA'
export const LOADING_START = 'LOADING_START'
export const LOADING_DONE = 'LOADING_DONE'

const initialState = {
    modalData: null,
    isLoading: false
}

export function appReducer(state = initialState, action = {}) {
    
    switch (action.type) {
        case GET_DYNAMIC_MODAL_DATA:
            return { ...state, modalData: action.modalData }

        case LOADING_START:
            return { ...state, isLoading: true }
        
        case LOADING_DONE:
                return { ...state, isLoading: false }

        default:
            return state
    }
}