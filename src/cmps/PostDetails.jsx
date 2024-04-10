import React from 'react'
import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate, NavLink } from "react-router-dom"
import { onToggleModal } from '../store/actions/app.actions'
import { postService } from '../services/post.service'
import { Avatar } from './Avatar'
import { BackIcon, CommentsIcon, LoadingIcon, NotificationsIcon, SavedIcon, ShareIcon } from '../assets/icons'
import { utilService } from '../services/util.service'
import { userService } from '../services/user.service'
import { addComment, likePost, openSinglePost, savePost } from '../store/actions/post.actions'
import { Media } from './Media'
import { useSelector } from 'react-redux'
import { followUser, loadFollowings } from '../store/actions/user.actions'
import { useEffectOnChange } from '../hooks/useEffectOnChange'

export function PostDetails() {
    const urlParams = useParams()
    const navigate = useNavigate()

    const posts = useSelector(storeState => storeState.postModule.posts)
    
    // load email
    useEffect(() => {
        loadPost()
    }, [urlParams.postId, posts])

    const openPostDetailsModal = () => {
        onToggleModal({
            cmp: PostDetailsModal,
            props: {
                onCommentAdded() {
                    //loadPost()
                },
                onCloseModal(navigateBack) {
                    if (navigateBack) {
                        navigateBack()
                    }
                    onToggleModal(null)
                    openSinglePost(null)
                },
                type: "post-details"
            }
        })   
    }

    async function loadPost() {
        
        try {
            var selectedPost
            
            if (posts && posts.length > 0) {
                selectedPost = posts.find(post => post._id === urlParams.postId) 
            }
            
            if (!selectedPost) {
                selectedPost = await postService.getById(urlParams.postId)
            }
             

            if (selectedPost) {
                openSinglePost(selectedPost)
                openPostDetailsModal(selectedPost)
            }
            else {
                console.log('Had issues loading post comments', err)
            }
            
        } catch (err) {
            console.log('Had issues loading post comments', err)
            
            showErrorAlert({
                title: "Error",
                message: "Sorry, there was a problem with your request.",
                closeButton: { show: false }, 
                okButton: { show: true, text: "OK", onPress: null, closeAfterPress: true }, 
                cancelButton: { show: false }, 
            })

            navigateBack()
        }
    }

    function navigateBack() {
        navigate('../')
    }
    
    return null
}

function PostDetailsModal({ onCommentAdded, onCloseModal }) {
    const singlePost = useSelector(storeState => storeState.postModule.singlePost)

    const mainRef = useRef(null)
    const textareaRef = useRef(null)
    const [mainHeight, setMainHeight] = useState(null)
    const [textareaHeight, setTextareaHeight] = useState(null)
    const [disablePostButton, setDisablePostButton] = useState(true)
    const [liked, setLiked] = useState(singlePost && singlePost.likes && singlePost.likes.some(like => like._id === userService.getLoggedinUser()._id))
    const [isLiking, setIsLiking] = useState(false)
    const [saved, setSaved] = useState(singlePost && singlePost.saves && singlePost.saves.some(save => save._id === userService.getLoggedinUser()._id))
    const [isLoading, setIsLoading] = useState(false)

    const loggedinUser = useSelector(storeState => storeState.userModule.loggedinUser)
    const followings = useSelector(storeState => storeState.userModule.followings)
    
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
            navigateBack()
        }
    
        const fetchAndUpdateFollowings = async () => {
            await fetchFollowings()
        }
    
        fetchAndUpdateFollowings()
    }, []) 

    useEffectOnChange(() => {
        if (mainRef.current) {
            // scroll down when a new message received
            mainRef.current.scrollTop = mainRef.current.scrollHeight
        }
    }, [singlePost?.comments])

    useEffect(() => {
        getCSSHeight()
    }, [])

    function getCSSHeight() {
        const main = mainRef.current
        const textarea = textareaRef.current

        if (main)
        {
            const computedStyles = window.getComputedStyle(main)
            setMainHeight({
                default: Number(computedStyles.getPropertyValue('height').replace("px", "")),
                delta: 0
            })
        }

        if (textarea)
        {
            const computedStyles = window.getComputedStyle(textarea)
            setTextareaHeight({
                min: Number(computedStyles.getPropertyValue('min-height').replace("px", "")),
                max: Number(computedStyles.getPropertyValue('max-height').replace("px", ""))
            })
        }  
    }

    function fixMainCSSHeight() {
        const main = mainRef.current
        const textarea = textareaRef.current

        if (main && textarea)
        {
            const delta = textarea.style.height.replace("px", "") - textareaHeight.min
            setMainHeight((prevMainHeight) => { 
                return {
                    ...prevMainHeight,
                    delta: delta
                }
            })

            main.style.height = (mainHeight.default - delta) + "px"
            
        }   
    }

    const handleTextareaHeight = () => {
        const textarea = textareaRef.current
    
        if (textarea) {

            setDisablePostButton(textarea.value.length === 0)

            if (textarea.scrollHeight <= textareaHeight.min) {
                textarea.style.height = textareaHeight.min + 'px'
            } else if (textarea.value.length <= 30) {
                textarea.style.height = textareaHeight.min + 'px'
            } else {
                textarea.style.height = 'auto'
                textarea.style.height = `${Math.min(textarea.scrollHeight, textareaHeight.max)}px` 
            }

            fixMainCSSHeight()
        }
    }

    const handleTextareaKeyDown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault()
                
            if (event.shiftKey) {
                const textarea = textareaRef.current
                const cursorPosition = textarea.selectionStart
                const textBeforeCursor = textarea.value.substring(0, cursorPosition)
                const textAfterCursor = textarea.value.substring(cursorPosition)
                textarea.value = textBeforeCursor + '\n' + textAfterCursor
            } else  {
                handlAddComment()
            }
        }
    }

    // like
    const handlLike = async () => {
        if (isLiking) {
            return
        }

        setLiked(!liked)
        setIsLiking(true)
        await likePost(singlePost)
        
        setIsLiking(false)
    }
    
    // save
    const handlSave = async () => {
        setSaved(!saved)
        await savePost(singlePost)
    }

    // add comment 
    const handlFocusAddComment = () => {
        const textarea = textareaRef.current
        textarea.focus()
        
    }

    const handlAddComment = async () => {
        const textarea = textareaRef.current
        
        if (textarea) {
            setDisablePostButton(true)
            await addComment(singlePost, textarea.value)
            textarea.value = ""

            onCommentAdded()

            handleTextareaHeight()
        }
    }

    function foramttedText(text, showPostBy) {
        const words = text.split(/\s+/)
            
        if (showPostBy) {
            const createdBy = "@" + singlePost?.createdBy.username
            words.unshift(createdBy)
        }

        const space = (index) => {
            return (index + 1 == words.length ? '' : ' ')
        }
        
        return words.map((word, index) => {
            if (word.startsWith('@')) {
                return (
                   `<a class="user-profile" href=/#/${word.slice(1)}/posts/>${word.slice(1)}</a>${space(index)}`
                )
            } else if (word.startsWith('#')) {
                return (
                    `<a class="hashtag" href=/#/explore/tags/${word.slice(1)}>#${word.slice(1)}</a>${space(index)}`
                )
            } else {
                return `${word}` + space(index)
            }
        }).join('')
    }

    // following
    const isFollowing = singlePost && followings?.some(follower => follower._id === singlePost.createdBy._id)

    const handelOnFollow = async () => {
        if (isLoading || !singlePost) {
            return
        }
        
        setIsLoading(true)
        await followUser({_id: singlePost.createdBy._id, username: singlePost.createdBy.username, profilePicture: singlePost.createdBy.profilePicture})
        setIsLoading(false)
    }

    if (!singlePost) return <></>

    return (
      <>
        <header className='mobile'>
            <BackIcon.mobile onClick={onCloseModal} />
            <h2>Comments</h2>
            <span></span>
        </header>   
        <section className='media desktop'>
            <Media media={singlePost.media[0]} />
        </section>
        <section className={`comments ${singlePost.likes && singlePost.likes.length > 0 ? '' : 'no-likes'}`}>
            <header >
                <Avatar size="small" textPosition="right" hasBorder={false} user={singlePost.createdBy} />
                <button className={!followings || isFollowing ? 'following' : 'follow'} onClick={() => handelOnFollow()}>
                    {!isLoading && followings && !isFollowing && <span>Follow</span>}
                    {isLoading && <LoadingIcon.button />}
                </button>
            </header>
            <main ref={mainRef}>
                <div>
                    <Avatar size="small" textPosition="none" hasBorder={true} user={singlePost.createdBy} />
                    <div>
                        <NavLink className="user-profile" to={`/${singlePost.createdBy.username}/posts/`}>{singlePost.username}</NavLink>
                        <span className="text" dangerouslySetInnerHTML={{ __html: foramttedText(singlePost.text.replace("\n", "<br />"), true) }}></span>
                        <div><span>{utilService.timeAgo(singlePost.createdAt)}</span>{singlePost.likes && singlePost.likes.length > 0 && <span>{Number(singlePost.likes?.length).toLocaleString()} {singlePost.likes?.length == 1 ? "like" : "likes"}</span>}{/*TODO<span>Reply</span>*/}</div>
                    </div>
                </div>
                {singlePost.comments && singlePost.comments.map((comment, index) => (
                    <div key={index}>
                        <Avatar size="small" textPosition="none" hasBorder={true} user={comment.createdBy} />
                        <div>
                            <NavLink className="user-profile" to={`${comment.createdBy.username}/posts/`}>{comment.createdBy.username}</NavLink>
                            <span className="text" dangerouslySetInnerHTML={{ __html: foramttedText(' ' + comment.comment.replace("\n", "<br />"), false) }}></span>
                            <div><span>{utilService.timeAgo(comment.createdAt)}</span>{comment.likes && comment.likes.length > 0 && <span>{Number(comment.likes?.length).toLocaleString()} {comment.likes?.length == 1 ? "like" : "likes"}</span>}{/*TODO<span>Reply</span>*/}</div>
                        </div>
                    </div>
                ))}
            </main>
            <footer>
                <section className="actions desktop">
                    <div>
                        {!liked && <NotificationsIcon.notSelected onClick={handlLike}  />}
                        {liked && <NotificationsIcon.selected onClick={handlLike} />}
                        <CommentsIcon.default onClick={handlFocusAddComment} />
                        {/*TODO<ShareIcon.default />*/}
                    </div>
                    <div>
                        {!saved && <SavedIcon.notSelected onClick={handlSave}  />}
                        {saved && <SavedIcon.selected onClick={handlSave} />}
                    </div>
                </section>
                {singlePost.likes && singlePost.likes.length > 0 && <section className="likes desktop">
                    <div>{Number(singlePost.likes.length).toLocaleString()} {singlePost.likes.length == 1 ? "like" : "likes"}</div>
                </section>}
                <section className="posted-time desktop">
                    <div>{utilService.timeAgo(singlePost.createdAt, true)}</div>
                </section>
                <section className="add-comment">
                    <div className='mobile'>
                        <Avatar size="small" textPosition="none" hasBorder={false} user={userService.getLoggedinUser()} />                        
                    </div>
                    <div>
                        <textarea placeholder="Add a comment" ref={textareaRef} onChange={handleTextareaHeight} onKeyDown={handleTextareaKeyDown}></textarea>
                        <button onClick={handlAddComment} disabled={disablePostButton}>Post</button>

                        {/*<Textarea mainRef={mainRef} placeholder="Add a comment" button={{onClick: handlAddComment, text: 'Post'}} />*/}
                    </div>
                </section>
            </footer>
        </section>
      </>
    )
  }