const { WatchError } = require('redis');
const client = require('../configs/redis.config')

const { getLinesDB, getLinePathsDB}  = require('../dbQueries/line.queries')

const populateRedis = async () => {
    //Get lines of DB
    const linesDB = await getLinesDB();
    if(linesDB.resultsRows == undefined){
        console.log("Error fetching lines from DB" + linesDB)
        return;
    }

    var maxID = 0;
    //Populate redis with node info
    linesDB.resultsRows.forEach(async (line) => {
        if(line.id > maxID){maxID = line.id}
        await client.hSet(`line:${line.id}`, "id", `line:${line.id}`);
        await client.hSet(`line:${line.id}`, "name", line.name);
        await client.hSet(`line:${line.id}`, "active", + line.active);
        await client.sAdd(`line:index`, `line:${line.id}`)

        //Get paths of line
        const pathsOfLine = await getLinePathsDB(line.id);
        if(pathsOfLine.resultsRows != undefined){
            //Add each path to line:{lineId}:paths set AND add line to path:{pathID}:lines set
            pathsOfLine.resultsRows.forEach(async (path) => {
                await client.sAdd(`line:${line.id}:paths`, `path:${path.id}`)
                await client.sAdd(`path:${path.id}:lines`, `line:${line.id}`)
            })
        }
    });
    await client.set('line:maxKey', maxID)
}

const getCurrentStateRedis = async () => {
    //Get line keys
    const lineKeys = await client.sMembers('line:index')
    let requests = []

    lineKeys.forEach(async (key) => {
        //Get info of each line
        requests.push(client.HGETALL(key))
    })

    return await Promise.all(requests)
}

const getLinesRedis = async (lineIds) => {
    let requests = []
    lineIds.forEach(async (key) => {
        requests.push(client.HGETALL(`line:${key}`))
    })

    return await Promise.all(requests)
}



module.exports = {
    populateRedis,
    getCurrentStateRedis,
    getLinesRedis
}