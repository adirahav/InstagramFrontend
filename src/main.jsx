import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { HashRouter as Router, } from 'react-router-dom'
import { store } from './store/store.js'
import { Provider } from 'react-redux'
import './assets/css/main.scss'

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}> 
      <Router>
          <App />
      </Router>
  </Provider>
)