import React, { useState } from 'react'
import { useEffect, useRef } from "react"
import { Menu } from '../cmps/Menu'
import { Avatar } from '../cmps/Avatar'
import { Logo } from '../cmps/Logo'
import { FollowingsUsers } from '../cmps/FollowingsUsers'
import { SuggestedUsersList } from '../cmps/SuggestedUsersList'
import { PostsList } from '../cmps/PostsList'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Login } from '../cmps/Login'
import { useSelector } from 'react-redux'
import { loadPosts, resetPosts} from '../store/actions/post.actions'
import { loadFollowings } from '../store/actions/user.actions'
import { BackIcon } from '../assets/icons'
import { SOCKET_NOTIFICATION_POST_ADDED } from '../services/socket.service'
import promoImage1 from '../assets/images/promo-1.png'
import promoImage2 from '../assets/images/promo-2.png'
import promoImage3 from '../assets/images/promo-3.png'
import promoImage4 from '../assets/images/promo-4.png'
    
export function Home() {
    const [loadingMorePosts, setLoadingMorePosts] = useState(false)
    const [promoCounter, setPromoCounter] = useState(1)
    const [promoClasses, setPromoClasses] = useState(1)
    const [sideMenuExpand, setSideMenuExpand] = useState('wide')
    const [variant, setVariant] = useState('')
    const [showNewPostsIndication, setShowNewPostsIndication] = useState(false)
    const loadingRef = useRef(null)
    const navigate = useNavigate()

    const location = useLocation()
    const searchParams = new URLSearchParams(location.search)
    
    const loggedinUser = useSelector(storeState => storeState.userModule.loggedinUser)
    const followings = useSelector(storeState => storeState.userModule.followings)
    const postModule = useSelector(storeState => storeState.postModule)
    const isLoading = useSelector(storeState => storeState.appModule.isLoading)
    
    const POSTS_PAGING_SIZE = 4
    const PROMO_IMAGES_SIZE = 4
    
    const fetchPosts = async () => {
        if (!loggedinUser || isLoading) {
            return
        }
        
        try {
            await loadPosts(postModule.paging, POSTS_PAGING_SIZE, searchParams.get('variant'))
            setLoadingMorePosts(false)
        } catch (error) {
            console.error('Error fetching posts:', error)
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
        resetPosts()
        fetchPosts()
    }, [loggedinUser, searchParams.get('variant')])

    useEffect(() => {
        setVariant(searchParams.get('variant'))
    }, [searchParams.get('variant')])
    
    useEffect(() => {
        /*setTimeout(() => {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            })
        }, 2000)*/
    }, [postModule.posts])
    
    useEffect(() => {
        if (loggedinUser && !isLoading && !loadingMorePosts) {
            const observer = new IntersectionObserver(async (entries) => {
                const entry = entries[0]
                if (entry.isIntersecting) {
                    setLoadingMorePosts(true)
                }
            }, { root: null, margin: '30px' })
    
            if (observer) {
                observer.observe(loadingRef.current)
            }
    
            return () => {
                if (observer) {
                    observer.disconnect()
                }
            }
        }  
    }, [fetchPosts])

    useEffect(() => {
        if (loadingMorePosts) {
            fetchPosts()
        }
    }, [loadingMorePosts])

    // post details
    async function onPostDetailsPress(pressedPost) {
        navigate(`/p/${pressedPost._id}`)  
    }

    // followings
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
    
        fetchFollowings()
    }, [])   

    // login
    useEffect(() => {
        if (!loggedinUser) {
            const intervalId = setInterval(() => {
                setPromoCounter((prevPromoCounter) => prevPromoCounter == PROMO_IMAGES_SIZE ? 1 : prevPromoCounter + 1)
            }, 4000)
        
            return () => clearInterval(intervalId)
        }
    }, [loggedinUser])

    useEffect(() => {
        if (!loggedinUser) {
            setPromoClasses(
                (promoClasses) => {
                    return Array.from({ length: PROMO_IMAGES_SIZE }, (_, index) =>
                        promoCounter === index + 1 ? "show" : "hide"
                    )
                }
            )
        }
    }, [promoCounter])
    
    if (!loggedinUser) return (
        <main className='home-login'> 
            <section className='promo'>
                <div>
                    <img src={promoImage1} className={promoClasses[0]} />
                    <img src={promoImage2} className={promoClasses[1]} />
                    <img src={promoImage3} className={promoClasses[2]} />
                    <img src={promoImage4} className={promoClasses[3]} />
                </div>
            </section>
            <Login />
        </main>
    )

    const handleExpandingChanged = (menuExpand) => {
        setSideMenuExpand(menuExpand)
    }

    const handelPressNewPostIndications = async () => {
        resetPosts()
        await fetchPosts()
        //setShowNewPostsIndication(false)
    }

    return (<>
        <header className="main-page mobile">
            <Logo />
            <Menu position="header" />
        </header>
        
        <aside className={`sidenav desktop ${sideMenuExpand}`}>
            <Logo />    
            <Menu position="sidenav" onExpandingChanged={handleExpandingChanged} />
        </aside>
        <main className="home container mobile-full">
            <section className='center'>
                {showNewPostsIndication && <div className="new-post-indication"><span onClick={handelPressNewPostIndications}>New Posts</span></div>}
                {variant !== 'past_posts' && followings && followings.length > 0 && <section className='followings'>
                    <FollowingsUsers followings={followings} />
                </section>}
                <section className='suggestion mobile'>
                    <h2>Suggested for you</h2>
                    <SuggestedUsersList />
                </section>
                {variant === 'past_posts' && <section className='past-posts'><NavLink to="/"><BackIcon.desktop /><BackIcon.mobile /><h1>Past Posts</h1></NavLink></section>}
                <PostsList posts={postModule.posts} onPostDetailsPress={onPostDetailsPress} variant={variant} />
                <Outlet context={{ }} />
                <div id="loading" style={{ height: '1px', backgroundColor: 'transparent' }} ref={loadingRef}></div>
            </section>
            <section className='side'>
                <section className='user-profile'>
                    <div>
                        <Avatar size="medium" textPosition="right" hasBorder={false} label={loggedinUser.Fullname} bigLabel={true} user={loggedinUser} />
                        {/*<button>Switch</button>TODO*/}
                    </div>
                </section>
                <section className='suggestion desktop'>
                    <div>
                        <h2>Suggested for you</h2>
                        {/*<button>See All</button>TODO*/}
                    </div>
                    <SuggestedUsersList />
                </section>
            </section>    
        </main>
        <footer className='mobile full'>
            <Menu position="footer" />
        </footer>
    </>)
}
