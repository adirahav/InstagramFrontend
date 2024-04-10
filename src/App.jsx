import { Suspense, lazy } from 'react'
const LazyLoadHome = lazy(() => import('./pages/Home'))
import { Home } from './pages/Home'
import { Alert } from './cmps/Alert'
import { Routes, Route, useLocation } from 'react-router-dom'
import { DynamicModal } from './cmps/DynamicModal'
import { PostDetails } from './cmps/PostDetails'
import { Profile } from './pages/Profile'
import { store } from './store/store.js'    
import { Provider, useSelector } from 'react-redux'      
import { Signup } from './cmps/Signup.jsx'
import { Login } from './cmps/Login.jsx'
import { useEffect, useState } from 'react'
import { MenuMoreOptions } from './cmps/MenuMoreOptions.jsx'
import { MenuNotifications } from './cmps/MenuNotifications.jsx'
import { Messages } from './pages/Messages.jsx'
import { MessagesChat } from './cmps/MessagesChat.jsx'
import { Tags } from './pages/Tags.jsx'
import { Explore } from './pages/Explore.jsx'
import { socketService, SOCKET_CHAT_NEW_PRIVATE_MESSAGE, SOCKET_FOLLOWER_SET_OFFLINE, SOCKET_FOLLOWER_SET_ONLINE, SOCKET_NOTIFICATION_POST_ADDED, SOCKET_NOTIFICATION_POST_COMMENT_ADDED, SOCKET_NOTIFICATION_POST_LIKED } from './services/socket.service.js'
import { hasNewNotifications, loadNotifications, saveUnreadMessage, saveUnreadNotification, setFollowerOnline } from './store/actions/user.actions.js'
import { showNewMessage } from './store/actions/conversation.actions.js'

function App() {//socket.connected
  const [logging, setLogging] = useState(false)
  const loggedinUser = useSelector(storeState => storeState.userModule.loggedinUser)
  const notifications = useSelector(storeState => storeState.userModule.notifications)
  const location = useLocation()
  
  useEffect(() => {
    socketService.on(SOCKET_FOLLOWER_SET_ONLINE, (data) => {
      setFollowerOnline(data)
    })

    socketService.on(SOCKET_FOLLOWER_SET_OFFLINE, (data) => {
      setFollowerOnline(data)
    })

    socketService.on(SOCKET_CHAT_NEW_PRIVATE_MESSAGE, (newMessage) => {
      const isInMessagesChat = window.location.href.includes('/direct/inbox/')  
                            && window.location.href.includes(`/${newMessage.conversationId}/`)
      
      if (isInMessagesChat) {
        showNewMessage(newMessage)
      }
      else {
        if (loggedinUser) {
          saveUnreadMessage(loggedinUser, newMessage)
        }
      }
    })
    
    socketService.on(SOCKET_NOTIFICATION_POST_LIKED, newNotification)
    socketService.on(SOCKET_NOTIFICATION_POST_COMMENT_ADDED, newNotification)
    socketService.on(SOCKET_NOTIFICATION_POST_ADDED, newNotification)
     
    return () => {
        socketService.off(SOCKET_FOLLOWER_SET_ONLINE)
        socketService.off(SOCKET_FOLLOWER_SET_OFFLINE)
        socketService.off(SOCKET_CHAT_NEW_PRIVATE_MESSAGE)
        socketService.off(SOCKET_NOTIFICATION_POST_LIKED)
        socketService.off(SOCKET_NOTIFICATION_POST_COMMENT_ADDED)
        socketService.off(SOCKET_NOTIFICATION_POST_ADDED)
      }
  }, [])

  function newNotification() {
    //console.log("NEW_NOTIFICATION")
    
    if (notifications?.isVisible) {
      loadNotifications()
    }
    else {
      if (loggedinUser) {
        hasNewNotifications(true)
        saveUnreadNotification(loggedinUser)
      }
    }
  }

  useEffect(() => {
    setLogging(loggedinUser !== null && location.pathname.includes("/accounts/emailsignup/"))
  }, [loggedinUser, location.pathname])

  const mainClass = `main-layout ${loggedinUser ? '' : 'logout'} ${logging ? 'logging' : ''}` 

  return (   
    <Provider store={store}>      
      <section className={mainClass}>
          <Routes>
              {/*<Route path="/" element={ <Suspense fallback={<div><LoadingIcon.page /></div>}><LazyLoadHome /> </Suspense>} >
                <Route path='/p/:postId' element={<PostDetails />} />
              </Route>*/}
                
              <Route path="/" element={<Home />}>
                <Route path='/p/:postId' element={<PostDetails />} />
              </Route>

              <Route path="/home/" element={ <Home /> }>
                <Route path='/home/p/:postId' element={<PostDetails />} />
              </Route>

              <Route path="/search/" element={<Home />} />    
              
              <Route path="/explore/" element={<Explore />}>
                <Route path='/explore/p/:postId' element={<PostDetails />} />
              </Route>

              <Route path="/explore/tags/:tag" element={<Tags />}>
                <Route path='/explore/tags/:tag/p/:postId' element={<PostDetails />} />
              </Route>

              <Route path="/reels/" element={<Home />} />

              <Route path="/direct/inbox/" element={<Messages />}>
                <Route path="/direct/inbox/:conversationId/" element={<MessagesChat />} />
              </Route>

              <Route path="/notifications/" element={<Home />} /> 
              <Route path="/stories/:username/:storyid/" element={<Home />} />     
              <Route path="/new-post/" element={<Home />} />     
              
              <Route path="/:username/:type" element={<Profile />}>
                <Route path='/:username/:type/p/:postId' element={<PostDetails />} />
              </Route>
              <Route path="/accounts/emailsignup/" element={<Signup />} />     {}
              <Route path="/accounts/login/" element={<Login />} />     {}
              
          </Routes>

          <Alert />
          <DynamicModal />
          <MenuNotifications />
          <MenuMoreOptions />
      </section>
    </Provider>
  )
}

export default App