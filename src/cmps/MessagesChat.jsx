import { useEffect, useRef, useState } from "react"

import { Avatar } from "./Avatar"
import { useSelector } from "react-redux"
import { NavLink, useNavigate, useOutletContext } from "react-router-dom"
import { socketService, SOCKET_CHAT_NEW_PRIVATE_MESSAGE } from '../services/socket.service'
import { utilService } from "../services/util.service"
import { conversationService } from "../services/conversation.service"
import { resetMessage, showNewMessage } from "../store/actions/conversation.actions"

export function MessagesChat() {
    const mainRef = useRef(null)
    const [textareaHeight, setTextareaHeight] = useState(null)
    const [showSendButton, setSendPostButton] = useState(false)
    const [partner, setPartner] = useState(null)
    const { selectedConversation } = useOutletContext()

    const [messages, setMessages] = useState([])        
    const chatRef = useRef()                            

    const textareaRef = useRef(null)
    const loggedinUser = useSelector(storeState => storeState.userModule.loggedinUser)
    const newMessage = useSelector(storeState => storeState.conversationModule.newMessage)
    const navigate = useNavigate()

    /**/
    /*useEffect(() => {
        socketService.on(SOCKET_CHAT_NEW_PRIVATE_MESSAGE, (newMessage) => {
            const isInMessagesChat = location.pathname.includes('/direct/inbox/')  
                                && location.pathname.includes(`/${newMessage.conversationId}/`)
            
            if (isInMessagesChat) {
                showNewMessage(newMessage)
            }
            else {
                
            }
        })*/

        ///socketService.on(SOCKET_NOTIFICATION_POST_LIKED, newNotification)
        ///socketService.on(SOCKET_NOTIFICATION_POST_COMMENT_ADDED, newNotification)
       /// socketService.on(SOCKET_NOTIFICATION_POST_ADDED, newNotification)
       /*   
        return () => {
            socketService.off(SOCKET_FOLLOWER_SET_ONLINE)
            socketService.off(SOCKET_FOLLOWER_SET_OFFLINE)
            socketService.off(SOCKET_CHAT_NEW_PRIVATE_MESSAGE)
            //socketService.off(SOCKET_NOTIFICATION_POST_LIKED)
           // socketService.off(SOCKET_NOTIFICATION_POST_COMMENT_ADDED)
           // socketService.off(SOCKET_NOTIFICATION_POST_ADDED)
        }*/
    //}, [])
    /**/
    useEffect(() => {
        if (selectedConversation) {
            getConversation()
        }
    }, [selectedConversation])

    async function getConversation() {
        const conversation = await conversationService.query(selectedConversation.conversationId)
        setPartner(loggedinUser.username === conversation.member1.username ? conversation.member2 : conversation.member1)
        setMessages(conversation.messages)
    }

    // textarea ui
    useEffect(() => {
        getTextareaCSSHeight()
    }, [])

    function getTextareaCSSHeight() {
        const textarea = textareaRef.current

        if (textarea)
        {
            const computedStyles = window.getComputedStyle(textarea)
            setTextareaHeight({
                min: Number(computedStyles.getPropertyValue('min-height').replace("px", "")),
                max: Number(computedStyles.getPropertyValue('max-height').replace("px", ""))
            })
        } 
    }

    function fixMainCSSHeight() {
        const main = mainRef.current
        const textarea = textareaRef.current
        
        if (main && textarea)
        {
            const delta = textarea.style.height.replace("px", "") - textareaHeight.min
            setTextareaHeight((prevTextareaHeight) => { 
                return {
                    ...prevTextareaHeight,
                    delta: delta
                }
            })

            main.style.height = (textareaHeight.default - delta) + "px"
            
        }   
    }

    const handleTextareaHeight = () => {
        const textarea = textareaRef.current
    
        if (textarea) {

            setSendPostButton(textarea.value.length > 0)

            if (textarea.scrollHeight <= textareaHeight.min) {
                textarea.style.height = textareaHeight.min + 'px'
            } else if (textarea.value.length <= 30) {
                textarea.style.height = textareaHeight.min + 'px'
            } else {
                textarea.style.height = 'auto'
                textarea.style.height = `${Math.min(textarea.scrollHeight, textareaHeight.max)}px`
            }

            fixMainCSSHeight()
        }
    }

    const handlSendMessage = async () => {
        const textarea = textareaRef.current
    
        if (!textarea.value) {
            return
        }
        
        const from = loggedinUser.username
        const to = partner.username
       
        const msg = { from, to, txt: textarea.value, createdAt: new Date(), conversationId: selectedConversation.conversationId }
        socketService.emit(SOCKET_CHAT_NEW_PRIVATE_MESSAGE, msg)
        
        // add the message to the sending user messages state straight away.
        addNewMessage(msg)

        //await addComment(post, textarea.value)
        textarea.value = ""
    }

    useEffect(() => {
        if (!loggedinUser) {
            navigate("/")
        }

        //socketService.on(SOCKET_CHAT_NEW_PRIVATE_MESSAGE, addNewMessage)

        return () => {
        //    socketService.off(SOCKET_CHAT_NEW_PRIVATE_MESSAGE)
        }
    }, [])

    useEffect(() => {
        if (newMessage) {
            addNewMessage(newMessage)
            resetMessage()
        }
    }, [newMessage])

    useEffect(() => {
        // scroll down when a new message received
        mainRef.current.scrollTop = mainRef.current.scrollHeight
    }, [messages])

    function addNewMessage(msg) {
        setMessages(prevMessages => [...(prevMessages || []), msg])
    }

    function getMessageView(msg, index) {
        const isLessThanMinSecondsApart = (d1, d2) => {
            
            if (!d1 || !d2) {
                return false
            }

            const date1 = new Date(d1.createdAt)
            const date2 = new Date(d2.createdAt)

            const difference = Math.abs(date1 - date2)
        
            const thirtySecondsInMillis = 30 * 1000
        
            return difference < thirtySecondsInMillis
        }
        
        const isSameDay = (d1, d2) => {
            if (!d1 || !d2) {
                return false
            }

            const date1 = new Date(d1.createdAt)
            const date2 = new Date(d2.createdAt)

            return (
                date1.getFullYear() === date2.getFullYear() &&
                date1.getMonth() === date2.getMonth() &&
                date1.getDate() === date2.getDate()
            )
        }
          
        // from
        const isMe = msg.from === loggedinUser.username
        const from = isMe ? 'me' : ''

        // position
        const isPrevLessThanMinSeconds = isLessThanMinSecondsApart(msg, messages[index - 1])
        const isNextLessThanMinSeconds = isLessThanMinSecondsApart(msg, messages[index + 1])
        
        const isPrevSameUser = index > 0 && msg.from === messages[index-1].from
        const isNextSameUser = index < messages.length - 1 && msg.from === messages[index+1].from

        const position = (!isPrevLessThanMinSeconds || !isPrevSameUser) && (!isNextLessThanMinSeconds || !isNextSameUser)
                            ? "single"
                            : (!isPrevLessThanMinSeconds || !isPrevSameUser) && (isNextLessThanMinSeconds && isNextSameUser)
                                ? "top"
                                : (isPrevLessThanMinSeconds && isPrevSameUser) && (isNextLessThanMinSeconds && isNextSameUser)
                                    ? "middle"
                                    : (isPrevLessThanMinSeconds && isPrevSameUser) && (!isNextLessThanMinSeconds || !isNextSameUser)
                                        ? "bottom"
                                        : ""
        const liClass = `${position} ${from}`

        /// show time
        const showTime = !isSameDay(msg, messages[index - 1])
        
        // show avatar
        const showAvatar = !isMe && (position === 'single' || position === 'bottom')

        return {
            liClass,
            showTime,
            showAvatar 
        }              
    }

    function getFormatTime(time) {
        const options = { 
            month: '2-digit',
            day: '2-digit',
            year: '2-digit',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true 
        }
    
        const formattedDate = new Date(time).toLocaleDateString('en-US', options)
        return `${formattedDate}`
    }

    const handleTextareaKeyDown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault()
                
            if (event.shiftKey) {
                const textarea = textareaRef.current
                const cursorPosition = textarea.selectionStart
                const textBeforeCursor = textarea.value.substring(0, cursorPosition)
                const textAfterCursor = textarea.value.substring(cursorPosition)
                textarea.value = textBeforeCursor + '\n' + textAfterCursor
            } else  {
                handlSendMessage()
            }
        }
    }

    if (!loggedinUser) {
        return <></>
    }

    return (<section className='messages-chat'>
        <header className="desktop">
            {selectedConversation && <Avatar size="medium" displayFullname={true} label={utilService.timeAgo(selectedConversation.lastSeen, false, true)} textPosition="right" hasBorder={false} user={selectedConversation} />}                    
        </header>
        <main ref={mainRef} >
            {partner && <div className="view-profile">
                <Avatar size="huge" textPosition="none" hasBorder={false} user={partner} />                    
                <div>{partner.fullname}</div>
                <div>{partner.username} · Instaglam</div>
                <NavLink to={`/${partner.username}/posts`}>View profile</NavLink>
            </div>}
            <ul className="conversation" ref={chatRef}>
                {messages && messages.map((msg, idx) => {
                    const messageView = getMessageView(msg, idx)
                    return (
                        <li key={idx} className={messageView.liClass}>
                            {messageView.showTime && <h2 className="datetime">{getFormatTime(msg.createdAt)}</h2>}
                            <div className="message">
                                {messageView.showAvatar && <Avatar size="tiny" textPosition="none" hasBorder={false} user={partner} navigateToProfile={false} />}
                                <div className="text">{msg.txt}</div>
                            </div>
                        </li>
                    )
                })}

                {/*<li className="datetime">8/12/19, 1:44 PM</li>
                <li className="single"><Avatar size="tiny" textPosition="none" hasBorder={false} user={loggedinUser} /><div>single</div></li>
                <li className="top"><div>top</div></li>
                <li className="middle"><div>middle</div></li>
                <li className="bottom"><Avatar size="tiny" textPosition="none" hasBorder={false} user={loggedinUser} /><div>bottom</div></li>
                <li className="datetime">8/12/19, 2:10 PM</li>
                <li className="single"><Avatar size="tiny" textPosition="none" hasBorder={false} user={loggedinUser} /><div>to lines<br />to lines</div></li>
                <li className="datetime">8/12/19, 2:16 PM</li>
                <li className="single me"><div>single</div></li>
                <li className="top me"><div>top</div></li>
                <li className="middle me"><div>middle</div></li>
                <li className="bottom me"><div>bottom</div></li>*/}
            </ul>
        </main>
        <footer>
            <div className="keyboard">
                <textarea placeholder="Message..." ref={textareaRef} onChange={handleTextareaHeight} onKeyDown={handleTextareaKeyDown}></textarea>
                {showSendButton && <button onClick={handlSendMessage}>Send</button>}
            </div>
        </footer>

        
    </section>)
}