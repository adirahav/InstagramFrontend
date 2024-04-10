
import { userService } from "../../services/user.service.js"
import { postService } from "../../services/post.service.js"
import { GET_POSTS, ADD_POST, LIKE_POST, UNLIKE_POST, ADD_COMMENT, RESET_POSTS, UNSAVE_POST, SAVE_POST, OPEN_SINGLE_POST } from "../reducers/post.reducer.js"
import { LOADING_DONE, LOADING_START } from "../reducers/app.reducer.js"
import { store } from "../store.js"


export async function loadPosts(paging, pagingSize, variant) {
    try {
        store.dispatch({ type: LOADING_START })
        const pageNumber = paging && paging.pageNumber < paging.maxPages
                            ? +paging.pageNumber + 1 
                            : 1
                            
        if (+pageNumber !== +paging?.pageNumber) {
            const postsData = await postService.query(pageNumber, pagingSize, variant)
            store.dispatch({type: GET_POSTS, postsData})
        } 
        
    } catch(err) {
        console.log("Had issues loading posts")
        throw err
    } finally {
        store.dispatch({ type: LOADING_DONE })
    }
}

export async function openSinglePost(post) {
    try {
        store.dispatch({ type: OPEN_SINGLE_POST, post })
    } catch(err) {
        console.log("Had issues open single post")
        throw err
    } 
}

export async function addPost(text, mediaData, alt) {
    const loggedinUser = userService.getLoggedinUser()
    if (!loggedinUser) throw 'user error'
    
    const postToSave = { 
        media: [{url: mediaData.url, width: mediaData.width, height: mediaData.height, type: _getMediaType(mediaData.url), alt}],  
        text: text, 
    }

    try {   
        store.dispatch({ type: LOADING_START })
        const savedPost = await postService.save(postToSave)
        savedPost.likes = []
        savedPost.saves = []
        savedPost.comments = []
        savedPost.createdAt = new Date()
        savedPost.type = "new"
        
        store.dispatch({type: ADD_POST, savedPost, pageNumber: 1})
    } catch(err) {
        console.log("Had issues adding post")
        throw err
    } finally {
        store.dispatch({ type: LOADING_DONE })
    }
}

export async function likePost(post) {
    const loggedinUser = userService.getLoggedinUser()
    if (!loggedinUser) throw 'user error'

    const isLiked = post.likes && post.likes.some(like => like._id === loggedinUser._id)
    
    if (isLiked) {
        store.dispatch({type: UNLIKE_POST, postToUnlike: post, loggedinUser})

        try {
            await postService.unlike(post._id)
        }
        catch(err) {
            store.dispatch({type: LIKE_POST, postToLike: post, loggedinUser})
            console.log("Had issues unlike post")
            throw err
        }
    }
    else {
        store.dispatch({type: LIKE_POST, postToLike: post, loggedinUser})
        
        try {
            await postService.like(post._id)
        }
        catch(err) {
            store.dispatch({type: UNLIKE_POST, postToUnlike: post, loggedinUser})
            console.log("Had issues like post")
            throw err
        }
        
    }
}

export async function savePost(post) {
    const loggedinUser = userService.getLoggedinUser()
    if (!loggedinUser) throw 'user error'

    try {   
        const isSaved = post.saves && post.saves.some(save => save._id === loggedinUser._id)
        if (isSaved) {
            store.dispatch({type: UNSAVE_POST, postToUnsave: post, loggedinUser})
            await postService.unsaveByUser(post._id)
        }
        else {
            store.dispatch({type: SAVE_POST, postToSave: post, loggedinUser})
            await postService.saveByUser(post._id)
        }
    } catch(err) {
        console.log("Had issues save/unsave post")
        throw err
    }
}

export async function addComment(post, comment) {
    try {   
        store.dispatch({ type: LOADING_START })
        const addedComment = await postService.addComment(post._id, comment)
        store.dispatch({type: ADD_COMMENT, post, addedComment})
    } catch(err) {
        console.log("Had issues add comment")
        throw err
    } finally {
        store.dispatch({ type: LOADING_DONE })
    }
}

export function resetPosts() {
    try {   
        store.dispatch({ type: RESET_POSTS })
        
    } catch(err) {
        console.log("Had issues reset paging")
        throw err
    } 
}

function _getMediaType(fullURL) {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp']
    const videoExtensions = ['mp4', 'webm', 'ogg', 'avi', 'mov']

    const imageURL = fullURL.split('?')[0]
    const extension = imageURL.split('.').pop().toLowerCase()
  
    if (imageExtensions.includes(extension)) {
      return 'image'
    } else if (videoExtensions.includes(extension)) {
      return 'video'
    } else {
      return 'unknown'
    }
}


