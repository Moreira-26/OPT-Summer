const db = require('../configs/db.config');
const segmentQueries = require('../dbQueries/segment.queries')
const convertToGeoJson = require('../utils/convertToGeoJson.utils')

const getSegmentsGeoJson = async (request, response) => {
  const resultQuery = await segmentQueries.getSegmentsDB();
  
  const dataGeoJson = convertToGeoJson.serializeSegmentsAsGeoJson({"segments":resultQuery.resultsRows})

  response.status(200).json(
      dataGeoJson
  )

}
const getSegs = (request, response) => {
    db.query('Select * From segment_version', (error, results) => {
      if(error){
        response.status(400).send(
          {
              "message":error.message,
              "status" : "Bad request"
          }
        )
      }else{
        if(results.rowCount > 0){
          response.status(200).json(
            {
                "segs":results.rows,
                "status" : "OK"
            }
          )
        }else{
          response.status(404).json(
            {
                "message": "Segs not found" ,
                "status" : "Not found"
            }
          )
        }
      }
    })
}

const getSegId = (request, response) => {
    const id = parseInt(request.params.id)
    db.query('Select * From segment_version where id = $1', [id], (error, results) => {
      if(error){
        response.status(400).send(
          {
              "message":error.message,
              "status" : "Bad request"
          }
        )
      }else{
        if(results.rowCount > 0){
          response.status(200).json(
            {
              "segInfo" : results.rows.at(0),
              "status" : "OK"
            }
          )
        }else{
          response.status(404).json(
            {
                "message": "Segment with id:" + id + " not found" ,
                "status" : "Not found"
            }
          )
        }
      }
    })
}

module.exports = {
    getSegs,
    getSegId,
    getSegmentsGeoJson
}

  