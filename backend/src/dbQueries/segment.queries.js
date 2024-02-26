const db = require('../configs/db.config')

const getSegmentsDB = () => {
    const result = db.query('SELECT * FROM segment_version')
    .catch(error => 
        {
            return error.message;
        }
    ).then(results => 
        {
            if (results.rowCount > 0) {
                return {"resultsRows":results.rows};
            } else {
                return "Segments not found";
            }
        }
    );
    return result;
}
    

const getSegmentIdDB = async (id) => {
    const result = await db.query('SELECT * FROM segments_version WHERE id = $1', [id])
    .catch (error =>
        {
            return error.message;
        }
    ).then(results =>
        {
            if(results.rowCount > 0){
                return {"resultsRows":results.rows};
            }else{
                return "Segment with id:" + id + " not found";
            }
        }
    );

    return result;
}
    
const deleteSegmentDB = async (id) => {
    const result = await db.query('DELETE FROM segments_version WHERE id = $1', [id])
    .catch(error => 
        {
            return error.message;
        }
    ).then(results => 
        {
            if(results.rowCount > 0){
                return  "Segment with id:" + id + " deleted" ;
            }else{
                return "Segment with id:" + id + " not found" ;
            }
        }   
    );

    return result;
}

const createSegmentDB = async (name, start_Segment_id, end_Segment_id, seg_type_id, default_length, avg_duration, visible) => {
    const maxId =   await db.query('SELECT MAX(id) FROM segments_version')
    .then((results) => {
        return results.rows[0].max;
    });
    
    console.log("MAXID:" + maxId)
    const id = maxId + 1;

    const result  = await db.query('INSERT INTO segments_version (id, name, start_Segment_id, end_Segment_id, seg_type_id, default_length, avg_duration, visible, version) VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9) RETURNING *', [id, name, start_Segment_id, end_Segment_id, seg_type_id, default_length, avg_duration, visible, 0])
    .catch(
        async (error) => {
            return error.message;
        }
    ).then(
        async (results) => {
            if(results.rowCount > 0){
                return {"segmentInfo":results.rows.at(0)};
            }else{
                return results
            }
        }
    )
        
    return result;
}

const updateSegmentDB = async (id, name, start_Segment_id, end_Segment_id, seg_type_id, default_length, avg_duration, visible, version) => {
    const result = await db.query(
        'UPDATE Segments_version SET name = $1, start_Segment_id = $2, end_Segment_id = $3, seg_type_id = $4, default_length = $5, avg_duration = $6, visible = $7, version = $8 WHERE id = $9 RETURNING *', 
        [name, start_Segment_id, end_Segment_id, seg_type_id, default_length, avg_duration, visible, id]
        ).catch(
            (error) => {
                return error.message;
            }
        ).then(
            (results) => {
                if(results.rowCount > 0){
                    return {"segmentInfo":results.rows.at(0)};
                }else{
                    return "Segment with id:" + id + " not found";
                }
            }
        )

    return result;
}


const getSegmentVersionDB = async (id) => {
    const result = await db.query(
        'Select version from segments_version where id =$1' ,[id]
    ).catch(
        (error) => {
            return error.message;
        }
    ).then(
        (results) =>{
            return results.rows.at(0).version
        }
    )

    return result;
}
module.exports = {
    getSegmentsDB,
    getSegmentIdDB,
    deleteSegmentDB,
    createSegmentDB,
    updateSegmentDB,
    getSegmentVersionDB
};