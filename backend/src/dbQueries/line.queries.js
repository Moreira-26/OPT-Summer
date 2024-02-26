const db = require('../configs/db.config')

const getLinesDB = () => {
    //Get all lines
    const result = db.query('Select * From lines_version')
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

const getLinePathsDB = (id) => {
    //Get lines of gline with Id received
    const result = db.query('Select paths_version.id,name,empty From lines_paths JOIN paths_version ON paths_version.id = path_id Where line_id = $1',[id])
    .catch(error => {
        console.log(error.message)
        return error.message;
    }).then(results => 
        {
            if(results.rowCount > 0){
                return {"resultsRows":results.rows}
            }else{
                return `Paths from line ${id} not found`
            }
        }
    )
    return result;
} 

module.exports = {
    getLinesDB,
    getLinePathsDB
}