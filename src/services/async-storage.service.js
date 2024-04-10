export const storageService = {
    query,
    get,
    post,
    put,
    putList,
    remove,
    sort,
    paging/*,
    queryAndSort*/
} 

/*async function queryAndSort(entityType, filter, sort, delay = 200) {
    var entities = JSON.parse(localStorage.getItem(entityType)) || []

    entities = await entities.filter(filter)

    await entities.sort((a, b) => {
        if (sort.direction === 'asc') {
            return a[sort.by] - b[sort.by]
        } else if (sort.direction === 'desc') {
            return b[sort.by] - a[sort.by]
        }
    })

    return new Promise(resolve => setTimeout(() => resolve(entities), delay))
}*/

async function query(entityType, delay = 200) {
    const entities = JSON.parse(localStorage.getItem(entityType)) || []
    return new Promise(resolve => setTimeout(() => resolve(entities), delay))
}

async function get(entityType, entityId) {
    const entities = await query(entityType)
    const entity = entities.find(entity_1 => entity_1._id === entityId)
    if (!entity) throw new Error(`Get failed, cannot find entity with id: ${entityId} in: ${entityType}`)
    return entity
}

async function post(entityType, newEntity) {
    newEntity = { ...newEntity }
    newEntity._id = _makeId()
    const entities = await query(entityType)
    entities.push(newEntity)
    _save(entityType, entities)
    return newEntity
}

async function put(entityType, updatedEntity) {
    const entities = await query(entityType)
    const idx = entities.findIndex(entity => entity._id === updatedEntity._id)
    if (idx < 0) throw new Error(`Update failed, cannot find entity with id: ${updatedEntity._id} in: ${entityType}`)
    entities.splice(idx, 1, updatedEntity)
    _save(entityType, entities)
    return updatedEntity
}

async function putList(entityType, updatedEntities) {
    const entities = await query(entityType)

    updatedEntities.forEach(updatedEntity => {
        const idx = entities.findIndex(entity => entity._id === updatedEntity._id)
        if (idx >= 0) {
            entities.splice(idx, 1, updatedEntity)
        } else {
            console.warn(`Entity with id ${updatedEntity._id} not found in: ${entityType}`)
        }
    })

    _save(entityType, entities)
    return updatedEntities
}

async function remove(entityType, entityId) {
    const entities = await query(entityType)
    const idx = entities.findIndex(entity => entity._id === entityId)
    if (idx < 0) throw new Error(`Remove failed, cannot find entity with id: ${entityId} in: ${entityType}`)
    entities.splice(idx, 1)
    _save(entityType, entities)
}


/*async function paging(entityType, page, itemsPerPage) {
    try {
        var entities = await query(entityType)

        const startIndex = (page - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        const pagedEntities = entities.slice(startIndex, endIndex)
        
        const result = {
            pagedEntities,
            totalEntities: entities.length
        }
        return result
        
    } catch(err) {
        throw new Error(err)
    }
}*/

async function paging(entities, page, itemsPerPage) {
    try {
        const startIndex = (page - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        const pagedEntities = entities.slice(startIndex, endIndex)
        
        const result = {
            pagedEntities,
            totalEntities: entities.length
        }

        return result
        
    } catch(err) {
        throw new Error(err)
    }
}

/*async function sort(entityType, order, pagination) {
    var entities = await query(entityType)
    
    entities.sort((a, b) => {
        if (order.direction === 'asc') {
            return eval("a." + order.fieldName) < eval("b." + order.fieldName) ? -1 : 1
        } 
        else if (order.direction === 'desc') {
            return eval("a." + order.fieldName) > eval("b." + order.fieldName) ? -1 : 1
        }
    })

    _save(entityType, entities)
    
    return paging(entityType, pagination.pageNumber, pagination.itemsPerPage)
}*/

async function sort(entities, sortBy, orderDirection) {
    entities.sort((a, b) => {
        if (orderDirection === 'asc') {
            return a[sortBy] - b[sortBy]
        } 
        else if (orderDirection === 'desc') {
            return b[sortBy] - a[sortBy]
        }
    })

    return entities
}

async function group(entityType, fieldName) {
    var entities = await query(entityType)
    
    const groupedEntities = entities.reduce((result, entity) => {
        const key = eval("entity." + fieldName)
        if (!result[key]) {
            result[key] = []
        }
        result[key].push(entity)
        return result
    }, {})

    return groupedEntities
}

// Private functions
function _save(entityType, entities) {
    localStorage.setItem(entityType, JSON.stringify(entities))
}

function _makeId(length = 5) {
    var text = ''
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return text
}