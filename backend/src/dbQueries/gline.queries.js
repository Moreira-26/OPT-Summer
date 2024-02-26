const db = require('../configs/db.config')

const getGlinesDB = () => {
    //Get all glines
    const result = db.query('Select * From gistlines_version')
    .catch(error => {
        return error.message;
    }).then(results => 
        {
            if(results.rowCount > 0){
                return {"resultsRows":results.rows}
            }else{
                return "Glines not found"
            }
        }
    )
    return result;
}

const getGlineLinesDB = (id) => {
    //Get lines of gline with Id received
    const result = db.query('Select id,name,active From gistlines_lines JOIN lines_version ON id = line_id Where gline_version_id = $1',[id])
    .catch(error => {
        console.log(error.message)
        return error.message;
    }).then(results => 
        {
            if(results.rowCount > 0){
                return {"resultsRows":results.rows}
            }else{
                return `Lines from gline ${id} not found`
            }
        }
    )
    return result;
}

const getGlinePathsDB = (id) => {
    //Get paths of gline with Id received
    const result = db.query('Select paths_version.id,name,empty From glines_paths JOIN paths_version ON paths_version.id = path_id Where gline_version_id = $1',[id])
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
    getGlinesDB,
    getGlineLinesDB,
    getGlinePathsDB
}