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

export function Tags() {
    const [taggedPosts, setTaggedPosts] = useState()
    const loggedinUser = useSelector(storeState => storeState.userModule.loggedinUser)
    const urlParams = useParams()
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)
    const [sideMenuExpand, setSideMenuExpand] = useState('wide')

    const PAGING_SIZE = 30

    useEffect(() => {
        fetchPosts()
    }, [urlParams.tag])

    const fetchPosts = async () => {
        if (!loggedinUser || isLoading) {
            return
        }
        
        try {
            const posts = await postService.getByTag(urlParams.tag, PAGING_SIZE)
            setTaggedPosts(posts)
        } catch (error) {
            console.error(`Error fetching posts by tag #${urlParams.tag}:`, error)
            showErrorAlert({
                title: "Error",
                message: "Sorry, there was a problem with your request.",
                closeButton: { show: false }, 
                okButton: { show: true, text: "OK", onPress: null, closeAfterPress: true }, 
                cancelButton: { show: false }, 
            })
        } 
    }

    if (!taggedPosts) return <></>

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

    function TaggedPosts(props) {
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

    if (taggedPosts.list.length === 0) {
        return (<section className='tag container mobile-full error'>
                <AlertIcon.errorPage />
                <h2>Something went wrong</h2>
                <h3>There's an issue and the page could not be loaded.</h3>
                <button onClick={() => window.location.reload()}><span>Reload page</span></button>
            </ section>)
    }
    
    const tagImage = taggedPosts.list[Math.floor(Math.random() * taggedPosts.list.length)].media[0]
    
    return (<>
        <aside className={`sidenav desktop ${sideMenuExpand}`}>
            <Logo />    
            <Menu position="sidenav" onExpandingChanged={handleExpandingChanged} />
        </aside>
        <main className="tag container mobile-full">
            <header className='inner-page mobile'>
                <BackIcon.mobile onClick={handlelBack} />
                <h2>#{urlParams.tag}</h2>
                <div onClick={handleOpenMoreOptionsMenu}>&nbsp;{/*<MoreIcon.post  />*/}</div>
            </header>  
            <section className='basic-info'>
                <div className='desktop'>
                    <Media media={tagImage} isMediaPreview={true} isRound={true} />
                </div>
                <div className='mobile'>
                    <Media media={tagImage} isMediaPreview={true} isRound={true} />
                </div>
                <div className='desktop'>
                    <span>#{urlParams.tag}</span>
                </div>
                <div>
                    {<div><span>{taggedPosts.paging.totalCount}</span></div>}
                    {<div><span>posts</span></div>}
                    {/*{!profileInfo.info.canEdit && <button className={profileInfo.info.isFollowing ? 'following' : 'follow'} onClick={() => handelOnFollow()}>
                        {profileInfo.info.canFollow && !isLoading && <span>Follow</span>}
                        {profileInfo.info.isFollowing && !isLoading && <span>Following</span>}
                        {isLoading && <LoadingIcon.button />}
                    </button>}*/}
                </div>
            </section>
            <section className='main'>
                <h3>Top posts</h3>
                <article className='posts'>
                    <TaggedPosts posts={taggedPosts.list} />
                </article>
            </section>
        </main>
        <footer className='mobile full'>
            <Menu position="footer" />
        </footer>
        <Outlet context={{ }} />
    </>)
}
