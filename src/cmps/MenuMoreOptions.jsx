import { useEffect, useState, useRef } from "react"
import { eventBusService } from "../services/event-bus.service"
import { logout } from "../store/actions/user.actions"
import { NavLink, useNavigate } from "react-router-dom"
import { ActivityIcon, ReportProblemIcon, SavedIcon, SettingsIcon, SwitchAppearanceIcon } from "../assets/icons"
import { utilService } from "../services/util.service"
import { PLATFORM } from "../hooks/useEffectResize"
import { useSelector } from "react-redux"

window.showMenuMoreOptions = showMenuMoreOptions

export function MenuMoreOptions() {
    const [viewState, setViewState] = useState(
        utilService.getPlatform() === PLATFORM.MOBILE ? "hide" : "show") // hide | hiding | show | showing
    const [displayNav, setDisplayNav] = useState(false) 
    const [onClosed, setOnClosed] = useState({callback: null})
    const modalRef = useRef()
    const navigate = useNavigate()

    const loggedinUser = useSelector(storeState => storeState.userModule.loggedinUser)

    useEffect(() => {
        const unsubscribe = eventBusService.on('show-menu-more', (data) => {
            setViewState(utilService.getPlatform() === PLATFORM.MOBILE ? "showing" : "show")
            setDisplayNav(true)
            setOnClosed({ ...onClosed/*, ...data.onClosed */})
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
        if (onClosed.callback) {
            onClosed.callback()
        }
        
        if (utilService.getPlatform() === PLATFORM.MOBILE) {
            setViewState('hiding')
        } else {
            setDisplayNav(false)
        }
       
        setOnClosed(null)

        navigate("/")
    }

    function handleClickOutside(ev) {
        if (modalRef.current && !modalRef.current.contains(ev.target)) {
            onClose()
        }
    }

    const handleAnimationEnd = () => {
        setViewState((prevViewState) => {
            if (prevViewState === "hiding") {
                setDisplayNav(false)
            }

            return (prevViewState === "hiding")
                    ? "hide"
                    : "show"
        })
    }

    const onLogout = async () => {
        onClose()
        await logout()
        showMessageAlert({
            title: "Logging Out",
            message: "You need to log back in.",
            closeButton: { show: false, autoClose: true, autoCloseSeconds: 3 }, 
            okButton: { show: true, text: "Log in", onPress: null, closeAfterPress: true }, 
            cancelButton: { show: false }, 
        })
    }

    const navClass = `menu-more-options ${viewState}`

    if (!displayNav) return <></>
    
    return (
        <nav ref={modalRef} className={navClass} onAnimationEnd={handleAnimationEnd}>
            <ul>
                <li className="handle"><hr /></li>
                {/*TODO<li><NavLink to="/accounts/edit/" onClick={onClose}><SettingsIcon.menu /><span>Settings</span></NavLink></li>*/}
                {/*TODO<li><NavLink to="/your_activity/interactions/likes/" onClick={onClose}><ActivityIcon.menu /><span>Your activity</span></NavLink></li>*/}
                <li><NavLink to={`${loggedinUser ? `/${loggedinUser.username}/saved/` : '/'}`} onClick={onClose}><SavedIcon.menu /><span>Saved</span></NavLink></li>
                {/*TODO<li><SwitchAppearanceIcon.menu onClick={onClose} /><span>Switch appearance</span></li>*/}
                {/*TODO<li><ReportProblemIcon.menu onClick={onClose} /><span>Report a problem</span></li>*/}
                <li className="separetor"></li>
                <li onClick={onLogout}><span>Log out</span></li>
            </ul>
        </nav>
    )
}

export function showMenuMoreOptions(data) {
    eventBusService.emit('show-menu-more', data)
}
