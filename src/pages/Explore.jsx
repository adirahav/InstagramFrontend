import React, { useEffect, useState } from 'react'
import { Menu } from '../cmps/Menu'
import { Avatar } from '../cmps/Avatar'
import { Logo } from '../cmps/Logo'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
import { AlertIcon, BackIcon, MoreIcon } from '../assets/icons'
import { Media } from '../cmps/Media'
import { showMenuMoreOptions } from '../cmps/MenuMoreOptions'
import { useSelector } from 'react-redux'
import { postService } from '../services/post.service'

export function Explore() {
    const [exploredPosts, setExploredPosts] = useState()
    const loggedinUser = useSelector(storeState => storeState.userModule.loggedinUser)
    const urlParams = useParams()
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)
    const [sideMenuExpand, setSideMenuExpand] = useState('wide')

    const PAGING_SIZE = 30

    useEffect(() => {
        fetchPosts()
    }, [])

    const fetchPosts = async () => {
        if (!loggedinUser || isLoading) {
            navigate('/')
            return
        }
        
        try {
            const posts = await postService.explore(1, PAGING_SIZE)
            setExploredPosts(posts)
        } catch (error) {
            console.error(`Error fetching explore posts:`, error)
            showErrorAlert({
                title: "Error",
                message: "Sorry, there was a problem with your request.",
                closeButton: { show: false }, 
                okButton: { show: true, text: "OK", onPress: null, closeAfterPress: true }, 
                cancelButton: { show: false }, 
            })
        } 
    }

    if (!exploredPosts) return <></>

    const handlelBack = () => {
        navigate(-1)
    }

    // post details
    async function handlePostPress(pressedPost) {
        navigate(`p/${pressedPost._id}`)  
    }

    const handleOpenMoreOptionsMenu = () => {
        showMenuMoreOptions()
    }

    function ExploredPosts(props) {
        return <>
            {props.posts.map((post, index) => (
                <div key={index} onClick={() => handlePostPress(post)}>
                    <section className="content">
                        <Media media={post.media[0]} isMediaPreview={true} />
                    </section>
                    <div className="info">
                        <div>
                            <span className='likes'></span> {post.likes?.length ?? 0}
                            <span className='comments'></span> {post.comments?.length ?? 0}
                        </div>
                    </div>
                </div>
            ))}
        </>
    }

    const handelOnFollow = async () => {
        //TODO     
    }

    const handleExpandingChanged = (menuExpand) => {
        setSideMenuExpand(menuExpand)
    }

    if (!loggedinUser) {
        navigate('/')
    }

    return (<>
        <aside className={`sidenav desktop ${sideMenuExpand}`}>
            <Logo />    
            <Menu position="sidenav" onExpandingChanged={handleExpandingChanged} />
        </aside>
        <main className="explore container mobile-full">
            <header className='inner-page mobile'>
                <BackIcon.mobile onClick={handlelBack} />
                <h2>Explore</h2>
                <span onClick={handleOpenMoreOptionsMenu}>&nbsp;{/*<MoreIcon.post  />*/}</span>
            </header>  
            <section className='main'>
                <article className='posts'>
                    <ExploredPosts posts={exploredPosts.list} />
                </article>
            </section>
        </main>
        <footer className='mobile full'>
            <Menu position="footer" />
        </footer>
        <Outlet context={{ }} />
    </>)
}
