import { httpService } from './http.service.js'

const BASE_URL = 'openai/'

export const openaiService = {
    generatePost
}

async function generatePost(subject) {
    const params = { subject }

    try {
        const postsData = await httpService.get(BASE_URL + "/generatePost", params)
        return postsData.text    
    } catch(err) {
        console.error('Error retrieving openai text:', response.statusText)
        throw err
    }
}