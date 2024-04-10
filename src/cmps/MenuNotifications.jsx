import { useEffect, useState, useRef } from "react"
import { eventBusService } from "../services/event-bus.service"
import { BackIcon, LoadingIcon } from "../assets/icons"
import { utilService } from "../services/util.service"
import { PLATFORM } from "../hooks/useEffectResize"
import { Avatar } from "./Avatar"
import { useSelector } from "react-redux"   
import { followUser, loadNotifications, isNotificationsVisible, unfollowUser } from "../store/actions/user.actions"
import { Media } from "./Media"
import { NavLink } from "react-router-dom"

window.showMenuNotifications = showMenuNotifications

export function MenuNotifications({onCloseCallback}) {
    const [viewState, setViewState] = useState("show") // hide | hiding | show | showing
    const [onClosed, setOnClosed] = useState({callback: null})
    const modalRef = useRef()

    const loggedinUser = useSelector(storeState => storeState.userModule.loggedinUser)
    const notifications = useSelector(storeState => storeState.userModule.notifications)

    // -------------------
    // modal logic
    // -------------------

    useEffect(() => {
        const unsubscribe = eventBusService.on('show-menu-notifications', (data) => {
            setViewState(utilService.getPlatform() === PLATFORM.MOBILE ? "show" : "showing")
            isNotificationsVisible(true)
            setOnClosed({ ...onClosed, ...data.onClosed })
        })

        return unsubscribe
    }, [viewState, onClosed])

    useEffect(() => {
        if (viewState || onClosed) {
            setTimeout(() => {
                document.addEventListener('click', handleClickOutside)
            }, 0)
        }

        return () => {
            document.removeEventListener('click', handleClickOutside)
        }

    }, [viewState, onClosed])


    function onClose() {
        if (onClosed.callback !== null) {
            onClosed.callback()
        }
        
        isNotificationsVisible(false)
       
        setOnClosed(null)
    }

    function handleClickOutside(ev) {
        if (modalRef.current && !modalRef.current.contains(ev.target)) {
            const rootParent = utilService.findRootParent(ev.target)
            if (rootParent.className.includes("alert")) {
                return 
            }

            onClose()
        }
    }

    const handleAnimationEnd = () => {
        setViewState((prevViewState) => {
            if (prevViewState === "hiding") {
                isNotificationsVisible(false)
            }

            return (prevViewState === "hiding")
                    ? "hide"
                    : "show"
        })
    }

    // -------------------
    // notifications
    // -------------------
    const navClass = `menu-notifications ${viewState}`

    if (!notifications?.isVisible) return <></>
    
    return (<div ref={modalRef} className={navClass} onAnimationEnd={handleAnimationEnd}>
        <div>
            <header className="inner-page">
                <BackIcon.mobile onClick={onClose} className='mobile' />
                <h2>Notifications</h2>
                <span></span>
            </header>
            <ul>
                {notifications && notifications.list && notifications.list.map((notification, index) => (
                    <Notification 
                        key={index} 
                        prevNotification={index === 0 ? null : notifications.list[index - 1]} 
                        currNotification={notification}
                        onClose={onClose} />
                ))}
            </ul>
        </div>
    </div>
        
    
    )
}

export function showMenuNotifications(data) {
    eventBusService.emit('show-menu-notifications', data)
}

export function Notification({prevNotification, currNotification, onClose}) {
    const [isLoading, setIsLoading] = useState(false)
    const [notification, setNotification] = useState(currNotification)
    
    const handelOnFollow = async (event) => {
        event.preventDefault()
        if (notification.following) {
            showWarningAlert({
                title: "",
                message: <Avatar size="biggest" textPosition="none" hasBorder={false} user={notification} />,
                closeButton: { show: false }, 
                okButton: { show: true, text: "Unfollow", onPress: async () => { 
                    setIsLoading(true)
                    await unfollowUser({_id: notification._id, username: notification.username, profilePicture: notification.profilePicture})
                    setNotification((prevNotification) => { return { ...prevNotification, following: !notification.following } })
                    setIsLoading(false)
                }, closeAfterPress: true }, 
                cancelButton: { show: true, text: "Cancel", onPress: null, closeAfterPress: true }, 
            })
        }
        else {
            setIsLoading(true)
            await followUser({_id: notification._id, username: notification.username, profilePicture: notification.profilePicture})
            setNotification((prevNotification) => { return { ...prevNotification, following: !notification.following } })
            setIsLoading(false)
        }

    }

    function generateMessage({handleOnNotificationPress}) {
        switch (notification.type) {
            case "follow":
                let followStr = notification.followBy.length === 1
                    ? `<a href=/#/${notification.username}/posts>${notification.username}</a>, who you might know, is on Instaglam. ` +
                      `<span>${utilService.timeAgo(notification.notifyAt)}</span>`  
                    : `<a href=/#/${notification.username}/posts>${notification.username}</a> is on Instaglam. <a href=/#/${notification.followBy[0]}>${notification.followBy[0]}</a> ` + 
                      `and ${notification.followBy.length-1} other follow them. ` + 
                      `<span>${utilService.timeAgo(notification.notifyAt)}</span>`

                return <>
                    <li>
                        <Avatar size="medium" hasBorder={false} textPosition="none" user={notification} /> 
                        <div className="message" dangerouslySetInnerHTML={{ __html: followStr }} ></div>
                        <button className={notification.following ? 'following' : 'follow'} onClick={(event) => handelOnFollow(event)}>
                            {!isLoading && !notification.following && <span>Follow</span>}
                            {!isLoading && notification.following && <span>Following</span>}
                            {isLoading && <LoadingIcon.button />}
                        </button>
                    </li>
                </>

            case "new_post":
                let postStr = notification.postedBy.length === 1
                    ? `<a href=/#/${notification.username}/posts>${notification.username}</a> recently shared new posts. ` +
                        `<span>${utilService.timeAgo(notification.notifyAt)}</span>`  
                    : `<a href=/#/${notification.postedBy[0]}/posts>${notification.postedBy[0]}</a> ` + 
                        `and ${notification.postedBy.length-1} other recently shared new posts. ` + 
                        `<span>${utilService.timeAgo(notification.notifyAt)}</span>`

                return <>
                    <li onClick={handleOnNotificationPress}>
                        <Avatar size="medium" hasBorder={false} textPosition="none" user={notification} /> 
                        <div className="message" dangerouslySetInnerHTML={{ __html: postStr }} ></div>
                        <a onClick={handleOnNotificationPress} href={`/#/p/${notification._id}`}><Media media={notification.media} isMediaPreview={true} /></a>
                    </li>
                </>

            case "new_post_like":
                let postLikeStr = notification.likes.length === 1
                    ? `<a href=/#/${notification.likes[0]}/posts>${notification.likes[0]}</a> liked your post: ${notification.text}` +
                        `<span>${utilService.timeAgo(notification.notifyAt)}</span>`  
                    : `<a href=/#/${notification.likes[0]}/posts>${notification.likes[0]}</a> ` + 
                        `and ${notification.likes.length-1} other liked your post: ${notification.text}` + 
                        `<span>${utilService.timeAgo(notification.notifyAt)}</span>`

                return <>
                    <li onClick={handleOnNotificationPress}>
                        <Avatar size="medium" hasBorder={false} textPosition="none" user={notification} /> 
                        <div className="message" dangerouslySetInnerHTML={{ __html: postLikeStr }} ></div>
                        <a onClick={handleOnNotificationPress} href={`/#/p/${notification._id}`}><Media media={notification.media} isMediaPreview={true} /></a>
                    </li>
                </>

            case "new_post_comment":
                let postCommentStr = notification.comments.length === 1
                    ? `<a href=/#/${notification.comments[0]}/posts>${notification.comments[0]}</a> commented on your post: ${notification.text}` +
                        `<span>${utilService.timeAgo(notification.notifyAt)}</span>`  
                    : `<a href=/#/${notification.comments[0]}/posts>${notification.comments[0]}</a> ` + 
                        `and ${notification.comments.length-1} other commented on your post: ${notification.text}` + 
                        `<span>${utilService.timeAgo(notification.notifyAt)}</span>`

                return <>
                    <li onClick={handleOnNotificationPress}>
                        <Avatar size="medium" hasBorder={false} textPosition="none" user={notification} /> 
                        <div className="message" dangerouslySetInnerHTML={{ __html: postCommentStr }} ></div>
                        <a onClick={handleOnNotificationPress} href={`/#/p/${notification._id}`}><Media media={notification.media} isMediaPreview={true} /></a>
                    </li>
                </>
        }

        return <></>
    }

    const handleOnNotificationPress = () => {
        onClose()
    }

    const timeRange = utilService.timeRangeAgo(notification.notifyAt)
    const prevTimeRange = prevNotification === null ? null : utilService.timeRangeAgo(prevNotification?.notifyAt)

    return (<>
        {timeRange !== prevTimeRange && <li className="title"><h3>{timeRange}</h3></li>}
        {generateMessage({handleOnNotificationPress})}
    </>)
}
