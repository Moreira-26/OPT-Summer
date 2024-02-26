const client = require('../configs/redis.config')
const {parser} = require('../utils/parserId.utils')

async function isEmpty(networkID,setId){
    const result = await client.SISMEMBER(`${networkID}:empty`, setId)
    return result == '1';
}

/**
 * Check if set/relation version is empty -> Return []
 * Check if set/relation version has something in redis -> Return elements
 * If none of the above conditions is true -> Return original
 * @param {*} networkID 
 * @param {*} setId -> Original set Id Ex: node:1:segs
 * @returns Array 
 */

const get = async (networkID, setId)=> {
    //Create setId version
    const setIdToCheck = `${networkID}:${setId}`
    //If setId is in empty set return empty array
    if(await isEmpty(networkID, setIdToCheck)){
        return []
    }

    //Check if version has something in redis
    const setToCheck = await client.SMEMBERS(setIdToCheck)
    if(Object.keys(setToCheck).length !== 0){
        return setToCheck
    }

    //Get original
    const original = await client.SMEMBERS(setId)
    if(Object.keys(original).length == 0){
        return []
    }
    return original
}

const zget = async (networkID, setId) => {
    //Create setId version
    const setIdToCheck = `${networkID}:${setId}`
    //If setId is in empty set return empty array
    if(await isEmpty(networkID, setIdToCheck)){
        return []
    }

    //Check if version has something in redis
    const setToCheck = await client.zRangeByScoreWithScores(setIdToCheck, -Infinity, +Infinity,)
    if(Object.keys(setToCheck).length !== 0){
        return setToCheck
    }
    //Get original
    const original = await client.zRangeByScoreWithScores(setId, -Infinity, +Infinity,)
    if(Object.keys(original).length == 0){
        return []
    }

    return original
}

/**
 * 
 * Check if set/relation version is empty -> Return []
 * Check if set/relation version has something in redis -> Return elements
 * If none of the above conditions is true -> Return null
 * @param {*} networkID 
 * @param {*} setId -> Original SetId
 * @returns 
 */
const getVersion = async (networkID, setId) => {
    //Create setId version
    const setIdToCheck = `${networkID}:${setId}`
    //If setId is in empty set return empty array
    if(await isEmpty(networkID, setIdToCheck)){
        return []
    }

    //Check if version has something in redis
    const setToCheck = await client.SMEMBERS(setIdToCheck)
    if(Object.keys(setToCheck).length !== 0){
        return setToCheck
    }

    return null
}

const zgetVersion = async (networkID, setId) => {
    //Create setId version
    const setIdToCheck = `${networkID}:${setId}`
    //If setId is in empty set return empty array
    if(await isEmpty(networkID, setIdToCheck)){
        return []
    }

    //Check if version has something in redis
    const setToCheck = await client.zRangeByScoreWithScores(setIdToCheck, -Infinity, +Infinity,)
    if(Object.keys(setToCheck).length !== 0){
        return setToCheck
    }

    return null
}

module.exports = {
    get,
    getVersion,
    zget,
    zgetVersion
}