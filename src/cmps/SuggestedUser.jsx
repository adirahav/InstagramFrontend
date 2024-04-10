import { useState } from "react"
import { Avatar } from "./Avatar"
import { followUser, unfollowUser } from "../store/actions/user.actions"
import { LoadingIcon } from "../assets/icons"
import { showWarningAlert } from "./Alert"

export function SuggestedUser({isMobile, suggestion}) {
    const [isLoading, setIsLoading] = useState(false)
    
    const textPosition = isMobile ? "bottom" : "right"
    const size = isMobile ? "huge" : "medium"
    
    function getLabel(type) {
        switch(type) {
            case "followYou":
                return "Follows you"
            default:
                return isMobile ? "Popular" : "Suggested for you"
        }
    }

    const handelOnFollow = async () => {
        if (isLoading) {
            return
        }
        
        if (suggestion.following) {
            showWarningAlert({
                title: "",
                message: <Avatar size="biggest" textPosition="none" hasBorder={false} user={suggestion.follower} />,
                closeButton: { show: false }, 
                okButton: { show: true, text: "Unfollow", onPress: async () => { 
                    setIsLoading(true)
                    await unfollowUser(suggestion.follower)
                    setIsLoading(false)
                }, closeAfterPress: true }, 
                cancelButton: { show: true, text: "Cancel", onPress: null, closeAfterPress: true }, 
            })
        }
        else {
            setIsLoading(true)
            await followUser(suggestion.follower)
            setIsLoading(false)
        }

    }

    return (
        <li>
            <Avatar size={size} textPosition={textPosition} hasBorder={false} label={getLabel(suggestion.type)} user={suggestion.follower} />
            <button className={suggestion.following ? 'following' : 'follow'} onClick={() => handelOnFollow()}>
                {!isLoading && !suggestion.following && <span>Follow</span>}
                {!isLoading && suggestion.following && <span>Following</span>}
                {isLoading && <LoadingIcon.button />}
            </button>
        </li>
    )
}
