const db = require('../configs/db.config')

const getTrips = (request, response) => {
    db.query('Select * From trips', (error, results) => {
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
              "trips":results.rows,
              "status" : "OK"
            }
          )
        }else{
          response.status(404).json(
            {
              "message": "Trips not found" ,
              "status" : "Not found"
            }
          )
        }
      }
    })
}

const getTripId = (request, response) => {
    const id = parseInt(request.params.id)
    db.query('Select * From trips where id = $1', [id], (error, results) => {
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
              "tripInfo" : results.rows.at(0),
              "status" : "OK"
            }
          )
        }else{
          response.status(404).json(
            {
                "message": "Trip with id:" + id + " not found" ,
                "status" : "Not found"
            }
          )
        }
      }
    })
}

module.exports  = {
    getTrips,
    getTripId
}