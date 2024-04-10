import { useEffect, useState } from "react"
import { PLATFORM, useEffectResize } from "../hooks/useEffectResize"
import { useSelector } from "react-redux"
import { SuggestedUser } from "./SuggestedUser"
import { loadSuggestions } from "../store/actions/user.actions"

export function SuggestedUsersList() {

    const [isMobile, setIsMobile] = useState("desktop")
    const loggedinUser = useSelector(storeState => storeState.userModule.loggedinUser)
    const suggestions = useSelector(storeState => storeState.userModule.suggestions)
    
    const fetchSuggestions = async () => {
        try {
            await loadSuggestions()
        } catch (error) {
            console.error('Error fetching suggestions:', error)
        } 
    }
    
    useEffect(() => {
        if (loggedinUser) {
            fetchSuggestions()
        }
    }, [loggedinUser])

    useEffectResize((platform) => {
        setIsMobile(platform === PLATFORM.MOBILE)
    }, [])

    return (<>
        <ul className="suggested-users">
            {suggestions && suggestions.map((suggestion, index) => (
                <SuggestedUser key={index} isMobile={isMobile} suggestion={suggestion} />
            ))}
        </ul>
    </>)
}
