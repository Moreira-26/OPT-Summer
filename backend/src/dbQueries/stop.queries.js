const db = require('../configs/db.config')


const getStopsDB = () => {
    const result = db.query('Select * From stops_version ')
    .catch(error => 
        {
            return error.message;
        }
    ).then(results => 
        {
            if(results.rowCount > 0){
                return {"resultsRows":results.rows};
            }else{
                return "Stops not found";
            }
        }
    );
    return result;
}

module.exports = {
    getStopsDB
}