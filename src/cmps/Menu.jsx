import { NavLink } from "react-router-dom"
import { HomeIcon, ExploreIcon, MessagesIcon, NotificationsIcon, CreateIcon, MoreIcon } from "../assets/icons"
import { onToggleModal } from "../store/actions/app.actions"
import { useEffect, useState } from "react"

import { Avatar } from "./Avatar"
import { showMenuMoreOptions } from "./MenuMoreOptions"

import { useSelector } from "react-redux"
import { showMenuNotifications } from "./MenuNotifications"
import { PostCreate } from "./PostCreate"
import { loadNotifications, isNotificationsVisible } from "../store/actions/user.actions"

export function Menu({position, onExpandingChanged}) {
    const [menuClass, setMenuClass] = useState('')
    const [notificationsClass, setNotificationsClass] = useState('')
    const loggedinUser = useSelector(storeState => storeState.userModule.loggedinUser)
    const hasNewNotification = useSelector(storeState => storeState.userModule.notifications?.hasNewNotification)
    const unreadMessagesCount = loggedinUser.unreadMessages?.length ?? 0

    // create post   
    const handleOpenCreatePostModal = () => {
        onToggleModal({
            cmp: PostCreate,
            props: {
                onCloseModal() {
                    onToggleModal(null)
                },
                type: "create-post"
            }
        })
    }   

    useEffect(() => {
        if (onExpandingChanged) {
            onExpandingChanged(notificationsClass === "active" ? "narrow" : "wide")
        }
    }, [notificationsClass])

    const handleOpenMoreOptionsMenu = () => {
        setMenuClass((prevNotificationsClass) => {
            if (prevNotificationsClass === "active") {
                return ""
            }
            else {
                showMenuMoreOptions({
                    onClosed: { callback: async () => { 
                        setMenuClass("")
                    } }, 
                }) 

                return "active"
            }
        })
    }

    const handleOpenNotifications = () => {
        setNotificationsClass((prevNotificationsClass) => {
            if (prevNotificationsClass === "active") {
                return ""
            }
            else {
                showMenuNotifications({
                    onClosed: { callback: async () => { 
                        setNotificationsClass("")
                    } }, 
                }) 

                fetchNotifications()
                isNotificationsVisible(false)
                return "active"
            }
        })
    }

    async function fetchNotifications() {
        try {
            await loadNotifications(loggedinUser)
        } catch (error) {
            console.error('Error fetching notifications:', error)
        }
    }
   
    const navClass = `menu ${position}`
    
    return (<>
        <nav className={navClass}>
            <ul>
                <li className="desktop footer-mobile"><NavLink to="/"><HomeIcon.menuOff /><HomeIcon.menuOn /><span>Home</span></NavLink></li>
                {/*TODO<li className="desktop footer-mobile"><NavLink to="/search/"><SearchIcon.menuOff /><SearchIcon.menuOn /><span>Search</span></NavLink></li>*/}
                <li className="desktop footer-mobile"><NavLink to="/explore/"><ExploreIcon.menuOff /><ExploreIcon.menuOn /><span>Explore</span></NavLink></li>
                {/*TODO<li className="desktop footer-mobile"><NavLink to="/reels/"><MovieIcon.menuOff /><MovieIcon.menuOn /><span>Reels</span></NavLink></li>*/}
                <li className="desktop header-mobile"><NavLink to="/direct/inbox/"><MessagesIcon.menuOff /><MessagesIcon.menuOn />{unreadMessagesCount > 0 && <span className="new-message">{unreadMessagesCount}</span>}<span>Messages</span></NavLink></li>
                <li className="desktop header-mobile"><div className={notificationsClass} onClick={handleOpenNotifications}><NotificationsIcon.menuOff  /><NotificationsIcon.menuOn />{hasNewNotification && <span className="new-notification"></span>}<span>Notifications</span></div></li>
                <li className="desktop footer-mobile"><div onClick={handleOpenCreatePostModal}><CreateIcon.menu /><span>Create</span></div></li>
                <li className="desktop footer-mobile"><NavLink to={`${loggedinUser ? `/${loggedinUser.username}/posts/` : '/'}`}><Avatar size="tiny" textPosition="none" hasBorder={false} blackBorder={true} user={loggedinUser} navigateToProfile={false} /><span>Profile</span></NavLink></li>
            </ul>
            <ul className="bottom desktop">
                <li><div onClick={handleOpenMoreOptionsMenu} className={menuClass}><MoreIcon.menu /><span>More</span></div></li>
            </ul>
        </nav>
    </>
        
    )
}


//#endregion == Create Post Modal ================