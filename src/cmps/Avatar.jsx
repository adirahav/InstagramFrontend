import { NavLink } from "react-router-dom"
import missingAvatar from '../assets/images/missing-avatar.jpg'


export function Avatar({size = "big", textPosition = "right", displayFullname = false, hasBorder = true, blackBorder = false, bigLabel = false, label, isOnline = false, user, onPress = null, navigateToProfile = true}) {

    // size:         giant | huge | biggest | bigger | big | medium | small | tiny
    // textPosition: right | bottom | none
    
    const articleClass = `avatar size-${size} text-pos-${textPosition} ${hasBorder ? "border" : ""} ${blackBorder ? "black-border" : ""}`
    const labelClass = `${bigLabel ? "big-label" : ""}`
    const profilePicture = !user?.profilePicture ? missingAvatar : user.profilePicture
    
    const handleOnPress = (event) => {
        
        if (onPress != null) {
            event.preventDefault()
            
            onPress(event)
        }
    }

    function AvatarComponent() {
        return <article className="avatar">
            <div>
                <div>
                    <img src={profilePicture} alt={user?.username} />
                    {/*<LazyLoadMedia mediaUrl={profilePicture} isVideo={false} alt={user?.username} />*/}
                </div>   
            </div>
            <div>
                <span>{displayFullname ? user.fullname : user.username}</span>
                {label && <span className={labelClass}  dangerouslySetInnerHTML={{ __html: label }}></span>}
            </div>
            {isOnline && <span className="online"></span>}
        </article>
    }

    return (<>
        {navigateToProfile && <NavLink className={articleClass} to={`/${user.username}/posts`} onClick={handleOnPress}>
            <AvatarComponent />
        </NavLink>}
        {!navigateToProfile && <div className={articleClass} onClick={handleOnPress}>
            <AvatarComponent />
        </div>}
    </>)
}
