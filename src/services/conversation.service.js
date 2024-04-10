import { httpService } from './http.service.js'

const BASE_URL = 'conversation/'

export const conversationService = {
    query
}

async function query(conversationId) {
    const conversation = await httpService.get(BASE_URL + conversationId)
    return conversation
}

