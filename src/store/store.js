import { combineReducers, legacy_createStore as createStore, compose } from 'redux'
import { appReducer } from './reducers/app.reducer'
import { userReducer } from './reducers/user.reducer'
import { postReducer } from './reducers/post.reducer'
import { conversationReducer } from './reducers/conversation.reducer'

const rootReducer = combineReducers({
    appModule: appReducer,
    userModule: userReducer,
    postModule: postReducer,
    conversationModule: conversationReducer
})

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose // use for devtools

export const store = createStore(rootReducer, composeEnhancers())

window.gStore = store  // FOR DEBUGGING ONLY