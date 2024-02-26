const db = require('../configs/db.config')

const getVehicleDuties = (request, response) => {
    db.query('Select * From vehicle_duties', (error, results) => {
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
                "vehicleDuties":results.rows,
                "status" : "OK"
            }
          )
        }else{
          response.status(404).json(
            {
                "message": "Vehicle duties not found" ,
                "status" : "Not found"
            }
          )
        }
      }
    })
}

const getVehicleDutyId = (request, response) => {
    const id = parseInt(request.params.id)
    db.query('Select * From vehicle_duties where id = $1', [id], (error, results) => {
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
              "vehicleDutyInfo" : results.rows.at(0),
              "status" : "OK"
            }
          )
        }else{
          response.status(404).json(
            {
                "message": "Vehicle duty with id:" + id + " not found" ,
                "status" : "Not found"
            }
          )
        }
      }
    })
}

module.exports = {
    getVehicleDuties,
    getVehicleDutyId

}