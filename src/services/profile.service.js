import { storageService } from './async-storage.service.js'
import { httpService } from './http.service.js'
import { utilService } from './util.service.js'

const STORAGE_KEY = 'posts'
const BASE_URL = 'user/'

const tempUsers = [
    {_id: 'u101', username: 'adirahav', fullname: 'Adi Rahav', profilePicture: 'src/assets/images/avatar-example.jpg'},
    {_id: 'u102', username: 'maayanrahav', fullname: 'Maayan Rahav', profilePicture: 'src/assets/images/avatar-example.jpg'},
    {_id: 'u103', username: 'yuval.shvartsman', fullname: 'Yuval Shvartsman', profilePicture: 'src/assets/images/avatar-example.jpg'},
    {_id: 'u104', username: 'kathy_mohaban', fullname: 'Kathy Mohaban', profilePicture: 'src/assets/images/avatar-example.jpg'},
]

const loggedinUser = tempUsers.find(user => user._id === 'u101')

export const profileService = {
    query,
    loggedinUser
}

//_createPosts()

async function query(username) {
    try {
        const profile = await httpService.get(BASE_URL + username + "/profile")
        return profile
    } catch(err) {
        console.log("Had problems getting profile")
        throw err
    }
}

function getById(id) {
    return storageService.get(STORAGE_KEY, id)
}

function remove(id) {
    return storageService.remove(STORAGE_KEY, id)
}

async function save(postToSave) {
    if (postToSave._id) {
        return await storageService.put(STORAGE_KEY, postToSave)
    } else {
        return await storageService.post(STORAGE_KEY, postToSave)
    }
}

function getDefaultFilter() {
    return {
        createdBy: loggedinUser,
    }
}

async function createPost(text, mediaURL) {
    const post = { 
        createdBy: loggedinUser,
        createdAt: new Date().getTime(),
        media: [{url: mediaURL, type: _getMediaType(mediaURL)}], 
        text: text, 
        likes: [], 
        comments: [],
    }
    
    await save(post)
}

async function liked(post) {
    
    const isLiked = post.likes.some(like => like.user._id === loggedinUser._id)

    if (isLiked) {
        post.likes = post.likes.filter(like => like.user._id !== loggedinUser._id)
    } else {
        post.likes.push({user: loggedinUser})
    }
    
    save(post)
}

async function addComment(post, comment) {
    post.comments.push({
        createdAt: new Date().getTime(), 
        user: loggedinUser,
        comment
    })

    save(post)
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

function _createPosts() {
    let posts = utilService.loadFromStorage(STORAGE_KEY)
    if (!posts || !posts.length) {
        posts = [
            { 
                _id: 's201', 
                createdBy: tempUsers.find(user => user._id === 'u101'),
                createdAt: new Date().getTime(),
                media: [{url:"src/assets/images/avatar-example.jpg", type: "image"}], 
                text: '@maayanrahav post 201 post 201 post 201 post 201 post 201 post 201 post 201 post 201 #new_post_hashtag', 
                likes: [
                    {user: tempUsers.find(user => user._id === 'u101')}, 
                    {user: tempUsers.find(user => user._id === 'u102')}
                ], 
                comments: [
                    {user: tempUsers.find(user => user._id === 'u101'), comment: "comment 1 comment 1 comment 1 comment 1 "}, 
                    {user: tempUsers.find(user => user._id === 'u102'), comment: "comment 2 comment 2 comment 2 comment 2 comment 2"}
                ]
            },
            { 
                _id: 's202', 
                createdBy: {user: tempUsers.find(user => user._id === 'u102')},
                createdAt: new Date().getTime(),
                media: [{url:"src/assets/images/avatar-example.jpg", type: "image"}], 
                text: '@maayanrahav post 202 post 202 #new_post_hashtag', 
                likes: [
                    {user: tempUsers.find(user => user._id === 'u103')}, 
                    {user: tempUsers.find(user => user._id === 'u104')}
                ], 
                comments: [
                    {createdAt: new Date().getTime(), user: tempUsers.find(user => user._id === 'u103'), comment: "comment 1 comment 1 comment 1 comment 1 "}, 
                    {createdAt: new Date().getTime(), user: tempUsers.find(user => user._id === 'u102'), comment: "comment 2 comment 2 comment 2 comment 2 comment 2"}
                ]
            },
            { 
                _id: 's203', 
                createdBy: tempUsers.find(user => user._id === 'u101'),
                createdAt: new Date().getTime(),
                media: [{url:"https://res.cloudinary.com/dn4zdrszh/video/upload/v1705866537/samples/sea-turtle.mp4", type: "video"}], 
                text: 'post 203 post 203 post 203 post 203 post 203 post 203 post 203 post 203 post 203 post 203 post 203 post 203 post 203 post 203 post 203 post 203', 
                likes: [
                    {user: tempUsers.find(user => user._id === 'u101')}, 
                    {user: tempUsers.find(user => user._id === 'u102')}
                ], 
                comments: [
                    {createdAt: new Date().getTime(), user: tempUsers.find(user => user._id === 'u101'), comment: "comment 1 comment 1 comment 1 comment 1 "}, 
                    {createdAt: new Date().getTime(), user: tempUsers.find(user => user._id === 'u102'), comment: "comment 2 comment 2 comment 2 comment 2 comment 2"}
                ]
            },
            { 
                _id: 's204', 
                createdBy: tempUsers.find(user => user._id === 'u101'),
                createdAt: new Date().getTime(),
                media: [{url:"https://res.cloudinary.com/dn4zdrszh/video/upload/v1705866537/samples/sea-turtle.mp4", type: "video"}], 
                text: 'post 204 post 204 post 204 post 204 post 204 post 204 post 204 post 204', 
                likes: [
                    {user: tempUsers.find(user => user._id === 'u101')}, 
                ], 
                comments: [
                    {createdAt: new Date().getTime(), user: tempUsers.find(user => user._id === 'u101'), comment: "comment 1 comment 1 comment 1 comment 1 "}, 
                ]
            },
            { 
                _id: 's205', 
                createdBy: tempUsers.find(user => user._id === 'u101'),
                createdAt: new Date().getTime(),
                media: [{url:"https://res.cloudinary.com/dn4zdrszh/video/upload/v1705866537/samples/sea-turtle.mp4", type: "video"}], 
                text: 'post 205 post 205 post 205 post 205 post 205 post 205 post 205 post 205', 
                likes: [], 
                comments: []
            },
        ]
        utilService.saveToStorage(STORAGE_KEY, posts)
    }
}
