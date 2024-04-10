import { useEffect, useState } from "react"

import { Avatar } from "../cmps/Avatar"
import { useSelector } from "react-redux"
import { Logo } from "../cmps/Logo"
import { Menu } from "../cmps/Menu"
import { Outlet, useNavigate, useOutlet, useParams } from "react-router-dom"
import { BackIcon, MessagesIcon } from "../assets/icons"
import { loadFollowings, unsaveReadMessage } from "../store/actions/user.actions"
import { utilService } from "../services/util.service"

export function Messages() {
    const [selectedConversation, setSelectedConversation] = useState(null)
    const [unreadMessages, setUnreadMessages] = useState(null)
    const loggedinUser = useSelector(storeState => storeState.userModule.loggedinUser)
    const followings = useSelector(storeState => storeState.userModule.followings)
    const navigate = useNavigate()
    const outlet = useOutlet()
    const urlParams = useParams()
    
    useEffect(() => {
        if (urlParams.conversationId && followings) {
            setSelectedConversation(followings.find(follow => follow.conversationId === urlParams.conversationId))
        }
    }, [urlParams.conversationId, followings])

    useEffect(() => {
        setUnreadMessages(loggedinUser.unreadMessages)
    }, [loggedinUser.unreadMessages])

    const fetchFollowings = async () => {
        if (!loggedinUser) {
            return
        }
        
        try {
            await loadFollowings()
        } catch (error) {
            console.error('Error fetching followings:', error)
            showErrorAlert({
                title: "Error",
                message: "Sorry, there was a problem with your request.",
                closeButton: { show: false }, 
                okButton: { show: true, text: "OK", onPress: null, closeAfterPress: true }, 
                cancelButton: { show: false }, 
            })
        } 
    }

    useEffect(() => {
        if (!loggedinUser) {
            navigate("/")
        }
    
        const fetchAndUpdateFollowings = async () => {
            await fetchFollowings()
        }
    
        fetchAndUpdateFollowings()
    }, [])   

    async function onConversationPress(follow, unreadMessage) {
        if (unreadMessage) {
              
            if (loggedinUser) {
                await unsaveReadMessage(loggedinUser, unreadMessage)
            }
        }

        setSelectedConversation(follow)
        navigate(`/direct/inbox/${follow.conversationId}/`)  
    }

    const handelnBack = () => {
        setSelectedConversation(null)
        navigate(-1)
    }
    
    const mainCLass = `messages container mobile-full ${outlet ? 'chat' : ''}`

    if (!loggedinUser) {
        return <></>
    }

    return (<>
        <aside className={`sidenav desktop narrow`}>
            <Logo />    
            <Menu position="sidenav" />
        </aside>
        <main className={mainCLass}>
            <header className="inner-page mobile">
                <BackIcon.mobile onClick={handelnBack} />
                {selectedConversation && <Avatar size="small" label={utilService.timeAgo(selectedConversation.lastSeen, false, true)} textPosition="right" hasBorder={false} user={selectedConversation} />}
                {!selectedConversation && <h2>{loggedinUser.username}</h2>}
                <span>&nbsp;</span>
            </header>
            
            <section className="followings">
                <h2 className="desktop">{loggedinUser.username}</h2>
                <h3 className="desktop">Messages</h3>
                {!followings && <ul className="no-messages"><li></li></ul>}
                {followings && followings.length === 0 && <ul className="no-messages"><li>No messages found.</li></ul>}
                {followings && followings.length > 0 && <ul>
                    {followings && followings.map((follow, idx) => {
                        var unreadMessage = unreadMessages && unreadMessages.length
                                                ? unreadMessages.find(message => message.from === follow.username)
                                                : null

                        if (unreadMessage) {
                            unreadMessage.to = loggedinUser.username
                        }
                        
                        const liClass = String(urlParams.conversationId) === String(follow.conversationId) 
                                            ? 'active' 
                                            : unreadMessage ? 'unread' : '' 
                        const label = !unreadMessage 
                                        ? utilService.timeAgo(follow.lastSeen, false, true)
                                        : `<span>${unreadMessage.txt}</span> • ${utilService.timeAgo(unreadMessage.createdAt, false, false)}`
                        return (
                            <li key={idx} onClick={() => onConversationPress(follow, unreadMessage)} className={liClass}>
                                <Avatar navigateToProfile={false} size="big" displayFullname={true} label={label} textPosition="right" hasBorder={false} user={follow} isOnline={follow.isOnline} />
                                {unreadMessage && <div><span /></div>}                  
                            </li>
                        )
                    })}
                </ul>}
            </section>
            {!outlet && <section className="introduction">
                <MessagesIcon.chat />
                <h2>Your messages</h2>
                <p>Send private photos and messages to a friend or group</p>
            </section>}
            <Outlet context={{selectedConversation}} /> 
        </main>
        <footer className='mobile full'>
            <Menu position="footer" />
        </footer>
    </>)
}