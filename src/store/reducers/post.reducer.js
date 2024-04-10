export const GET_POSTS = 'GET_POSTS'
export const OPEN_SINGLE_POST = 'OPEN_SINGLE_POST'
export const ADD_POST = 'ADD_POST'
export const LIKE_POST = 'LIKE_POST'
export const UNLIKE_POST = 'UNLIKE_POST'
export const SAVE_POST = 'SAVE_POST'
export const UNSAVE_POST = 'UNSAVE_POST'
export const ADD_COMMENT = 'ADD_COMMENT'
export const RESET_POSTS = 'RESET_POSTS'

const initialState = {
    posts: [],
    paging: null,
    singlePost: null
}

export function postReducer(state = initialState, action = {}) {
    
    switch (action.type) {
        case GET_POSTS:
            return {
                ...state,
                posts: [...state.posts, ...action.postsData.list],
                paging: action.postsData.paging
            }

        case OPEN_SINGLE_POST: 
            return {
                ...state,
                singlePost: action.post,
            }

        case ADD_POST:
            return {
                ...state,
                posts: [action.savedPost, ...state.posts],
                paging: { ...state.paging, pageNumber: action.pageNumber }
            }

        case LIKE_POST:
            return {
                ...state,
                singlePost: state.singlePost 
                    ? { ...state.singlePost,
                        likes: state.singlePost.likes
                                ? [...state.singlePost.likes, action.loggedinUser]
                                : [action.loggedinUser] }
                    : state.singlePost,
                posts: !state.singlePost 
                    ? state.posts.map(post =>
                        post._id === action.postToLike._id ? {
                            ...post,
                            likes: post.likes
                                    ? [...post.likes, action.loggedinUser]
                                    : [action.loggedinUser]
                        } : post)
                    : state.posts
            }

        case UNLIKE_POST:
            return {
                ...state,
                singlePost: state.singlePost 
                    ? {
                        ...state.singlePost,
                        likes: state.singlePost.likes.filter(like => like._id !== action.loggedinUser._id)
                    } : state.singlePost,
                posts: !state.singlePost 
                    ? state.posts.map(post =>
                        post._id === action.postToUnlike._id ? {
                            ...post,
                            likes: post.likes.filter(like => like._id !== action.loggedinUser._id)
                        } : post)
                    : state.posts
            }

        case SAVE_POST:
            return {
                ...state,
                posts: state.posts.map(post =>
                    post._id === action.postToSave._id ? {
                        ...post,
                        saves: post.saves
                                ? [...post.saves, action.loggedinUser]
                                : [action.loggedinUser]
                    } : post
                )
            }

        case UNSAVE_POST:
            return {
                ...state,
                posts: state.posts.map(post =>
                    post._id === action.postToUnsave._id ? {
                        ...post,
                        saves: post.saves.filter(save => save._id !== action.loggedinUser._id)
                    } : post
                )
            }

        case ADD_COMMENT:
            return {
                ...state,
                posts: state.posts.map(post =>
                    (post._id === action.post._id) && {
                      ...post,
                      comments: [...(post.comments || []), action.addedComment]
                    } || post),           
            }

        case RESET_POSTS:
            return {
                ...state,
                posts: [],
                paging: null
            }

        default:
            return state
    }
}