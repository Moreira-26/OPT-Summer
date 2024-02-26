const db = require('../configs/db.config')

const getTracksDB = () => {
    const result = db.query('Select * FROM tracks_version')
    .catch(error => 
        {
            return error.message;
        }
    ).then(results => 
        {
            if (results.rowCount > 0) {
                return {"resultsRows":results.rows};
            } else {
                return "Tracks not found";
            }
        }
    );
    return result;
}

module.exports = {
    getTracksDB
}