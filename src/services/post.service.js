import { httpService } from './http.service.js'
import { userService } from './user.service.js'
import { utilService } from './util.service.js'

const BASE_URL = 'post/'

export const postService = {
    query,
    explore,
    save,
    remove,
    getByTag,
    getById,
    getDefaultFilter,
    createPost,
    like,
    unlike,
    saveByUser,
    unsaveByUser,
    addComment,
}

async function query(pageNumber, pagingSize, variant) {
    
    const loggedinUser = userService.getLoggedinUser()
    if (!loggedinUser) throw 'user error'
    
    const filter = { variant }
    const sort = { sortBy: 'createdAt', sortDir: -1 }
    const paging = { pageNumber, pagingSize }
    const params = { ...filter, ...sort, ...paging }

    try {
        const postsData = await httpService.get(BASE_URL, params)
        return postsData    
    } catch(err) {
        console.log("Had problems getting posts")
        throw err
    }
}

async function explore(pageNumber, pagingSize) {
    
    const loggedinUser = userService.getLoggedinUser()
    if (!loggedinUser) throw 'user error'
    
    const filter = { }
    const sort = { sortBy: 'createdAt', sortDir: -1 }
    const paging = { pageNumber, pagingSize }
    const params = { ...filter, ...sort, ...paging }

    try {
        const postsData = await httpService.get(BASE_URL + "/explore", params)
        return postsData    
    } catch(err) {
        console.log("Had problems getting explored posts")
        throw err
    }
}

async function getByTag(tag, pagingSize) {
    const paging = { pagingSize }
    const params = { ...paging }

    try {
        const postsData = await httpService.get(BASE_URL + tag + "/tag", params)
        return postsData    
    } catch(err) {
        console.log(`Had problems getting posts by tag #${tag}`)
        throw err
    }
}

async function getById(postId) {
    const post = await httpService.get(BASE_URL + postId)
    return post
}

function remove(postId) {
    //return storageService.remove(STORAGE_KEY, postId)
}

async function save(postToSave) {
    if (postToSave._id) {
        return await httpService.put(BASE_URL, postToSave)
    } else {
        return await httpService.post(BASE_URL, postToSave)
    }
}

function getDefaultFilter() {
    const loggedinUser = userService.getLoggedinUser()
    if (!loggedinUser) throw 'user error'

    return {
        createdBy: loggedinUser,
    }
}

async function createPost(text, mediaURL) {
    const loggedinUser = userService.getLoggedinUser()
    if (!loggedinUser) throw 'user error'

    const post = { 
        createdBy: loggedinUser,
        createdAt: new Date().getTime(),
        media: [{url: mediaURL, type: utilService.getMediaType(mediaURL)}], 
        text: text, 
        likes: [], 
        comments: [],
        saves: []
    }
    
    await save(post)
}

async function like(postId) {
    const loggedinUser = userService.getLoggedinUser()
    if (!loggedinUser) throw 'user error'

    return await httpService.put(BASE_URL + postId + "/like")
}

async function unlike(postId) {
    const loggedinUser = userService.getLoggedinUser()
    if (!loggedinUser) throw 'user error'

    return await httpService.put(BASE_URL + postId + "/unlike")
}

async function saveByUser(postId) {
    const loggedinUser = userService.getLoggedinUser()
    if (!loggedinUser) throw 'user error'

    return await httpService.put(BASE_URL + postId + "/save")
}

async function unsaveByUser(postId) {
    const loggedinUser = userService.getLoggedinUser()
    if (!loggedinUser) throw 'user error'

    return await httpService.put(BASE_URL + postId + "/unsave")
}

async function addComment(postId, comment) {
    const loggedinUser = userService.getLoggedinUser()
    if (!loggedinUser) throw 'user error'

    const commentToAdd = {
        comment
    }
    
    return await httpService.put(BASE_URL + postId + "/comment", commentToAdd)
}

async function savedByUser(postToSave) {
    httpService.put(BASE_URL + postToSave + '/save/')
    return postToSave
}

async function unsavedByUser(postToUnsave) {
    await httpService.put(BASE_URL + postToUnsave + '/unsave/')
    return postToUnsave
}