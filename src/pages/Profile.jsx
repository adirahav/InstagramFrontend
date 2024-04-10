import React, { useEffect, useState } from 'react'
import { Menu } from '../cmps/Menu'
import { Avatar } from '../cmps/Avatar'
import { Logo } from '../cmps/Logo'
import { NavLink, Outlet, useNavigate, useParams } from 'react-router-dom'
import { BackIcon, LoadingIcon, MoreIcon, PostsIcon, RealsIcon, SavedIcon, TagIcon } from '../assets/icons'
import { profileService } from '../services/profile.service'
import { Media } from '../cmps/Media'
import { showMenuMoreOptions } from '../cmps/MenuMoreOptions'
import { useSelector } from 'react-redux'
import { followUser, unfollowUser } from '../store/actions/user.actions'

export function Profile() {
    const [profileInfo, setProfileInfo] = useState()
    const [postsType, setPostsType] = useState()
    const loggedinUser = useSelector(storeState => storeState.userModule.loggedinUser)
    const urlParams = useParams()
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)
    const [sideMenuExpand, setSideMenuExpand] = useState('wide')
    
    useEffect(() => {
        if (!loggedinUser) {
            navigate('/')
            return
        }

        fetchProfileData()
    }, [urlParams.username])

    useEffect(() => {
        setPostsType(urlParams.type)
    }, [urlParams.type])

    // fetch profile data
    async function fetchProfileData() {
        setProfileInfo(await profileService.query(urlParams.username))
    }

    if (!profileInfo) return <></>

    const postsCount = profileInfo.posts.length == 1 ? `1 post` : `${Number(profileInfo.posts.length).toLocaleString()} posts`
    const followersCount = profileInfo.info.followersCount == 1 ? `1 follower` : `${Number(profileInfo.info.followersCount).toLocaleString()} followers`
    const followingCount = `${Number(profileInfo.info.followingCount).toLocaleString()} following`

    const handlelBack = () => {
        navigate(-1)
    }

    // dynamic icons
    function DynamicPostsIcon(props) {    
        return <>
            <span className="desktop"><PostsIcon.small {...props} /><span>Posts</span></span>
            <span className="mobile"><PostsIcon.gray {...props} /></span>
        </>
    }

    function DynamicRealsIcon(props) {    
        return <>
            <span className="desktop"><RealsIcon.small {...props} /><span>Reels</span></span>
            <span className="mobile"><RealsIcon.gray {...props} /></span>
        </>
    }

    function DynamicSavedIcon(props) {    
        return <>
            <span className="desktop"><SavedIcon.small {...props} /><span>Saved</span></span>
            <span className="mobile"><SavedIcon.gray {...props} /></span>
        </>
    }

    function DynamicTagIcon(props) {    
        return <>
            <span className="desktop"><TagIcon.small /><span>Tagged</span></span>
            <span className="mobile"><TagIcon.gray {...props} /></span>
        </>
    }

    // post details
    async function handlePostPress(pressedPost) {
        navigate(`p/${pressedPost._id}`)  
    }

    const handleOpenMoreOptionsMenu = () => {
        showMenuMoreOptions()
    }

    function UserPosts(props) {
        return <>
            {props.posts.map((post, index) => (
                <div key={index} onClick={() => handlePostPress(post)}>
                    <section className="content">
                        <Media media={post.media[0]} isMediaPreview={post.media[0].type === 'video'} />
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
        if (isLoading) {
            return
        }
        if (profileInfo.info.isFollowing) {
            showWarningAlert({
                title: "",
                message: <Avatar size="biggest" textPosition="none" hasBorder={false} user={profileInfo.user} />,
                closeButton: { show: false }, 
                okButton: { show: true, text: "Unfollow", onPress: async () => { 
                    setIsLoading(true)
                    await unfollowUser(profileInfo.user)
                    setProfileInfo((prevProfileInfo) => {
                        return { 
                            ...prevProfileInfo, 
                            info: { 
                                ...prevProfileInfo.info, 
                                followersCount: parseInt(prevProfileInfo.info.followersCount)        - 1,
                                isFollowing: false,
                                canFollow: true 
                            } 
                        }
                    })
                    setIsLoading(false)
                }, closeAfterPress: true }, 
                cancelButton: { show: true, text: "Cancel", onPress: null, closeAfterPress: true }, 
            })

            
        }
        else {
            setIsLoading(true)
            await followUser(profileInfo.user)
            setProfileInfo((prevProfileInfo) => {
                return { 
                    ...prevProfileInfo, 
                    info: { 
                        ...prevProfileInfo.info, 
                        followersCount:  parseInt(prevProfileInfo.info.followersCount) + 1,
                        isFollowing: true,
                        canFollow: false 
                    } 
                }
            })
            setIsLoading(false)
        }        
    }

    const handleExpandingChanged = (menuExpand) => {
        setSideMenuExpand(menuExpand)
    }

    if (!loggedinUser) {
        navigate(-1)
    }
    
    return (<>
        <aside className={`sidenav desktop ${sideMenuExpand}`}>
            <Logo />    
            <Menu position="sidenav" onExpandingChanged={handleExpandingChanged} />
        </aside>
        <main className="profile container mobile-full">
            <header className='inner-page mobile'>
                <span><BackIcon.mobile onClick={handlelBack} /></span>
                <h2>{profileInfo.user.username}</h2>
                <span onClick={handleOpenMoreOptionsMenu}><MoreIcon.menu /></span>
            </header>  
            <section className={`basic-info ${profileInfo.info.canEdit ? 'self' : ''}`}>
                <div className='desktop'>
                    <Avatar size="giant" hasBorder={false} textPosition="none" user={profileInfo.user} />
                </div>
                <div className='mobile'>
                    <Avatar size="bigger" hasBorder={false} textPosition="none" user={profileInfo.user} />
                </div>
                <div>
                    <span>{profileInfo.user.username}</span>
                    {/*{profileInfo.info.canEdit && <button className='self'>Edit profile</button>}TODO*/}
                    {!profileInfo.info.canEdit && <button className={profileInfo.info.isFollowing ? 'following' : 'follow'} onClick={() => handelOnFollow()}>
                        {profileInfo.info.canFollow && !isLoading && <span>Follow</span>}
                        {profileInfo.info.isFollowing && !isLoading && <span>Following</span>}
                        {isLoading && <LoadingIcon.button />}
                    </button>}
                    {/*<button>View archive</button>*/}
                </div>
                <div>
                    {<div><span>{postsCount}</span></div>}
                    {<div><NavLink >{followersCount}</NavLink></div>}
                    {<div><NavLink >{followingCount}</NavLink></div>}
                </div>
                <div>
                    <span>{profileInfo.user.fullname}</span>
                </div>
            </section>
            <section className='main'>
                <article className='tabs'>
                    <div>
                        {profileInfo.posts.length > 0 && <NavLink to={`/${loggedinUser.username}/posts`}><DynamicPostsIcon /></NavLink>}
                        {profileInfo.reels.length > 0 && <NavLink to={`/${loggedinUser.username}/reels/`}><DynamicRealsIcon /></NavLink>}
                        {profileInfo.saved.length > 0 && <NavLink to={`/${loggedinUser.username}/saved/`}><DynamicSavedIcon /></NavLink>}
                        {profileInfo.tagged.length > 0 && <NavLink to={`/${loggedinUser.username}/tagged/`}><DynamicTagIcon /></NavLink>}
                    </div>
                </article>
                <article className='posts'>
                    {postsType === 'posts' && <UserPosts posts={profileInfo.posts} />}
                    {postsType === 'reels' && <UserPosts posts={profileInfo.reels} />}
                    {postsType === 'saved' && <UserPosts posts={profileInfo.saved} />}
                    {postsType === 'tagged' && <UserPosts posts={profileInfo.tagged} />}
                </article>
            </section>
        </main>
        <footer className='mobile full'>
            <Menu position="footer" />
        </footer>
        <Outlet context={{ }} />
    </>)
}
