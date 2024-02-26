const db = require('../configs/db.config')

const getPathsDB = () => {
    const result = db.query('Select * From paths_version')
    .catch(error => {
        return error.message;
    }).then(results => 
        {
            if(results.rowCount > 0){
                return {"resultsRows":results.rows}
            }else{
                return "Lines not found"
            }
        }
    )
    return result;
}

const getPathSegsDB = (id) => {
    //Get Segs of path with Id received
    const result = db.query('Select segment_version.id,name,ptsg_order From paths_segs JOIN segment_version ON segment_version.id = seg_id Where path_version_id = $1',[id])
    .catch(error => {
        console.log(error.message)
        return error.message;
    }).then(results => 
        {
            if(results.rowCount > 0){
                return {"resultsRows":results.rows}
            }else{
                return `Segs from path ${id} not found`
            }
        }
    )
    return result;
} 

const getPathSegTracksDB = (pathId, segID) => {
    //Get Segs of path with Id received
    const result = db.query('Select track_id as id FROM path_segs_tracks JOIN paths_segs ON path_seg_version_id = id Where path_version_id = $1 and seg_id=$2',[pathId, segID])
    .catch(error => {
        console.log(error.message)
        return error.message;
    }).then(results => 
        {
            if(results.rowCount > 0){
                return {"resultsRows":results.rows}
            }else{
                return `not found`
            }
        }
    )
    return result;
}

module.exports = {
    getPathsDB,
    getPathSegsDB,
    getPathSegTracksDB
}