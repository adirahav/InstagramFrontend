import { CommentsIcon, LoadingIcon, MoreIcon, NotificationsIcon, SavedIcon, ShareIcon } from "../assets/icons"
import { Avatar } from "./Avatar"
import { useEffect, useState, useRef } from "react"
import { utilService } from "../services/util.service"
import { Media } from "./Media"
import { useSelector } from "react-redux"
import { addComment, likePost, savePost, resetPosts } from "../store/actions/post.actions"
import { followUser, unfollowUser } from "../store/actions/user.actions"
import { NavLink } from "react-router-dom"
import allCaughtUpImage1 from '../assets/images//all-caught-up.png'

export function PostPreview({post, onPostDetailsPress, variant}) {
    const loggedinUser = useSelector(storeState => storeState.userModule.loggedinUser)
    const [liked, setLiked] = useState(post && post.likes && post.likes.some(like => like._id === loggedinUser._id))
    const [saved, setSaved] = useState(post && post.saves && post.saves.some(save => save._id === loggedinUser._id))
    const [isLiking, setIsLiking] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [textToDisplay, setTextToDisplay] = useState({
        text: post.text,
        shortTextWordsCount: 20,
        hasMore: false
    })
    const [textareaHeight, setTextareaHeight] = useState(null)
    const [showPostButton, setShowPostButton] = useState(false)
    const [isFollowing, setIsFollowing] = useState(post.createdBy?.following)
    const [isLoading, setIsLoading] = useState(false)
    const textareaRef = useRef(null)
    
    useEffect(() => {
        
        cutOffTextIfNeeded()
        getTextareaCSSHeight()
    }, [])

    useEffect(() => {
        setLiked(post && post.likes && post.likes.some(like => like._id === loggedinUser._id))
        setSaved(post && post.saves && post.saves.some(save => save._id === loggedinUser._id))
        
        cutOffTextIfNeeded()
    }, [post])

    // text
    function cutOffTextIfNeeded() {
        if (post.type === 'old_preview') {
            return     
        }
        
        setTextToDisplay((prevTextToDisplay) => {
            const words = post.text.split(' ')
            const slicedWords = words.slice(0, prevTextToDisplay.shortTextWordsCount)
            
            return {
                ...prevTextToDisplay,
                text: slicedWords.join(' '),
                hasMore: words.length > prevTextToDisplay.shortTextWordsCount
            }
        }) 
    }

    function foramttedText(text) {

       /* const formattedText = `@${post.createdBy.username} ${text}`
        
        //text = text.replace(/@(\w+)/g, '<a href="user">$1</a>')
        formattedText = formattedText.replace(/@(\w+)/g, '<a class="user-profile" href=/#/$1>$1</a>')
        //text = text.replace(/#(\w+)/g, '<a href="tag">#$1</a>')
        formattedText = formattedText.replace(/#(\w+)/g, '<a class="hashtag" href=/#/explore/tags/$1>#$1</a>')

        return formattedText*/
        if (!text) {
            text = post.text
        }

        const createdBy = "@" + post.createdBy.username
        const words = text.replace(/<br\s*\/?>/g, ' %BREAKLINE% ').split(/\s+/)
        words.unshift(createdBy)
        
        const space = (index) => {
            return (index + 1 == words.length ? '' : ' ')
        }
        
        return  words.map((word, index) => {
            if (word.startsWith('@')) {
                return (
                   `<a class="user-profile" href=/#/${word.slice(1)}/posts/>${word.slice(1)}</a>${space(index)}`
                )
            } else if (word.startsWith('#')) {
                return (
                    `<a class="hashtag" href=/#/explore/tags/${word.slice(1)}>#${word.slice(1)}</a>${space(index)}`
                )
            } else if (word === '%BREAKLINE%') {
                return (
                    `<br />`
                )
            } else {
                return `${word}` + space(index)
            }
        }).join('')

        
    }

    const handleShowMore = () => {
        setTextToDisplay((prevTextToDisplay) => {
            return {
                ...prevTextToDisplay,
                text: post.text,
                hasMore: false
            } 
        })
    }

    // like
    const handlLike = async () => {
        if (isLiking) {
            return
        }

        setLiked(!liked)
        setIsLiking(true)
        await likePost(post)
        setIsLiking(false)
    }

    // save
    const handlSave = async () => {
        if (isSaving) {
            return
        }

        setSaved(!saved)
        setIsSaving(true)
        await savePost(post)
        setIsSaving(false)
    }

    // post details 
    const handleOpenPostDetailsModal = () => {
        onPostDetailsPress(post) 
    }

    // add comment 
    function getTextareaCSSHeight() {
        if (post.type === 'old_preview') {
            return     
        }

        const textarea = textareaRef.current

        if (textarea)
        {
            const computedStyles = window.getComputedStyle(textarea)
            setTextareaHeight({
                min: Number(computedStyles.getPropertyValue('min-height').replace("px", "")),
                max: Number(computedStyles.getPropertyValue('max-height').replace("px", ""))
            })
        } 
    }

    const handlAddComment = async () => {
        const textarea = textareaRef.current
    
        if (textarea) {
            await addComment(post, textarea.value)
            textarea.value = ""
        }
    }

    const handleTextareaHeight = () => {
        const textarea = textareaRef.current
    
        if (textarea) {

            setShowPostButton(textarea.value.length > 0)

            if (textarea.scrollHeight <= textareaHeight.min) {
                textarea.style.height = textareaHeight.min + 'px'
            } else if (textarea.value.length <= 30) {
                textarea.style.height = textareaHeight.min + 'px'
            } else {
                textarea.style.height = 'auto'
                textarea.style.height = `${Math.min(textarea.scrollHeight, textareaHeight.max)}px`
            }
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

    const handelOnFollow = async () => {
        if (isLoading) {
            return
        }
        
        if (isFollowing) {
            showWarningAlert({
                title: "",
                message: <Avatar size="biggest" textPosition="none" hasBorder={false} user={post.createdBy} />,
                closeButton: { show: false }, 
                okButton: { show: true, text: "Unfollow", onPress: async () => { 
                    setIsLoading(true)
                    await unfollowUser(post.createdBy)
                    setIsFollowing((prevIsFollowing) => { return !prevIsFollowing })
                    setIsLoading(false)
                }, closeAfterPress: true }, 
                cancelButton: { show: true, text: "Cancel", onPress: null, closeAfterPress: true }, 
            })
        }
        else {
            setIsLoading(true)
            await followUser(post.createdBy)
            setIsFollowing((prevIsFollowing) => { return !prevIsFollowing })
            setIsLoading(false)
        }        
    }

    if (!loggedinUser) {
        return <></>
    }

    const followClass = isFollowing 
                            ? `following ${isLoading ? 'loading' : ''}` 
                            : `follow ${isLoading ? 'loading' : ''}`
              
    
    return (<>
        {(post.type === 'new' || post.type === 'old') && <article className="post-preview">
            <header>
                <div>
                    <Avatar size="small" textPosition="right" user={post.createdBy} hasBorder={false} />
                    <div>{utilService.timeAgo(post.createdAt)}</div>
                </div>
                {/*TODO<MoreIcon.post  />*/}
            </header>
            <main>
                <section className="content">
                    <Media media={post.media[0]} aspectRatio="original" />
                </section>
                <section className="actions">
                    <div>
                        {!liked && <NotificationsIcon.notSelected onClick={handlLike}  />}
                        {liked && <NotificationsIcon.selected onClick={handlLike} />}
                        <CommentsIcon.default onClick={handleOpenPostDetailsModal} />
                        {/*TODO<ShareIcon.default />*/}
                    </div>
                    <div>
                        {!saved && <SavedIcon.notSelected onClick={handlSave}  />}
                        {saved && <SavedIcon.selected onClick={handlSave} />}
                    </div>
                </section>
                <section className="details">
                    {post.likes && post.likes.length > 0 && <div className="likes">{Number(post.likes.length).toLocaleString()} {post.likes.length == 1 ? "like" : "likes"}</div>}
                    <span className="text has-more" dangerouslySetInnerHTML={{ __html: foramttedText(textToDisplay.text?.replace(/\n/g, "<br />")) }}></span>
                    {textToDisplay.hasMore && <span className="more" onClick={handleShowMore}>more</span>}
                    {post.comments && post.comments.length > 0 && <div className="view-all-comments" onClick={handleOpenPostDetailsModal}>{post.comments.length == 1 ? `View 1 comment` : `View all ${Number(post.comments.length).toLocaleString()} comments`}</div>}
                    <div className="add-comment">
                        <textarea placeholder="Add a comment" ref={textareaRef} onChange={handleTextareaHeight} onKeyDown={handleTextareaKeyDown}></textarea>
                        {showPostButton && <button onClick={handlAddComment}>Post</button>}
                    </div>
                </section>
            </main>
        </article>}
        {post.type === 'old_preview' && <article className="post-all-caught-up">
            <img src={allCaughtUpImage1} />
            <h2>You're all caught up</h2>
            <div>You've seen all new posts from the past 7 days.</div>
            <NavLink to="?variant=past_posts">View older posts</NavLink>
        </article>}
        {post.type === 'suggested' && post.isFirst && <h1 className="suggested-posts">Suggested Posts</h1>}
        {post.type === 'suggested' && <article className="post-preview">
            <header>
                <div>
                    <Avatar size="small" textPosition="right" user={post.createdBy} hasBorder={false} />
                    <div>
                        {utilService.timeAgo(post.createdAt)} 
                        <button className={followClass} onClick={() => handelOnFollow()}>
                            {!isLoading  && !isFollowing && <span>Follow</span>}
                            {!isLoading && isFollowing && <span>Following</span>}
                            {isLoading && <LoadingIcon.button />}
                        </button>
                    </div>
                </div>
                {/*TODO<MoreIcon.post  />*/}
            </header>
            <main>
                <section className="content">
                    <Media media={post.media[0]} aspectRatio="original" />
                </section>
                <section className="actions">
                    <div>
                        {!liked && <NotificationsIcon.notSelected onClick={handlLike}  />}
                        {liked && <NotificationsIcon.selected onClick={handlLike} />}
                        <CommentsIcon.default onClick={handleOpenPostDetailsModal} />
                        {/*TODO<ShareIcon.default />*/}
                    </div>
                    <div>
                        {!saved && <SavedIcon.notSelected onClick={handlSave}  />}
                        {saved && <SavedIcon.selected onClick={handlSave} />}
                    </div>
                </section>
                <section className="details">
                    {post.likes && post.likes.length > 0 && <div className="likes">{Number(post.likes.length).toLocaleString()} {post.likes.length == 1 ? "like" : "likes"}</div>}
                    <span className="text has-more" dangerouslySetInnerHTML={{ __html: foramttedText(textToDisplay.text?.replace(/\n/g, "<br />")) }}></span>
                    {textToDisplay.hasMore && <span className="more" onClick={handleShowMore}>more</span>}
                    {post.comments && post.comments.length > 0 && <div className="view-all-comments" onClick={handleOpenPostDetailsModal}>{post.comments.length == 1 ? `View 1 comment` : `View all ${Number(post.comments.length).toLocaleString()} comments`}</div>}
                    <div className="add-comment">
                        <textarea placeholder="Add a comment" ref={textareaRef} onChange={handleTextareaHeight} onKeyDown={handleTextareaKeyDown}></textarea>
                        {showPostButton && <button onClick={handlAddComment}>Post</button>}
                    </div>
                </section>
            </main>
        </article>}
    </>)
}
