const db = require('../configs/db.config')

const getSchedules = (request, response) => {
    db.query('Select * From planning_schedules', (error, results) => {
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
                "schedules":results.rows,
                "status" : "OK"
            }
          )
        }else{
          response.status(404).json(
            {
                "message": "Schedules not found" ,
                "status" : "Not found"
            }
          )
        }
      }
    })
}

const getScheduleId = (request, response) => {
    const id = parseInt(request.params.id)
    db.query('Select * From planning_schedules where id = $1', [id], (error, results) => {
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
              "scheduleInfo" : results.rows.at(0),
              "status" : "OK"
            }
          )
        }else{
          response.status(404).json(
            {
                "message": "Schedule with id:" + id + " not found" ,
                "status" : "Not found"
            }
          )
        }
      }
    })
}

const getTrips = (request, response) => {
    const id = parseInt(request.params.id)
    db.query('Select trip_id From trips_schedules where planning_schedule_id = $1', [id], (error, results) => {
      if(error){
        response.status(400).send(
          {
              "message":error.message,
              "status" : "Bad request"
          }
        )
      }else{
        if(results.rowCount > 0){
          tripIds = results.rows.map(row => row.trip_id)
          response.status(200).json(
              {
                "scheduleId" : id,
                "tripIds" : tripIds,
                "status" : "OK"
              }
          )
        }else{
          response.status(404).json(
            {
              "message" : "Schedule with id:" + id + " not found or doesn't have trips",
              "status" : "Not found"
            }
          )
        }
      }
    })
}

const getWorkBlocks = (request, response) => {
  const id = parseInt(request.params.id)
  db.query('Select id From work_blocks where schedule_id = $1', [id], (error, results) => {
    if(error){
      response.status(400).send(
        {
            "message":error.message,
            "status" : "Bad request"
        }
      )
    }else{
      if(results.rowCount > 0){
        workBlockIds = results.rows.map(row => row.id)
        response.status(200).json(
            {
              "scheduleId" : id,
              "workBlockIds" : workBlockIds,
              "status" : "OK"
            }
        )
      }else{
        response.status(404).json(
          {
            "message" : "Schedule with id:" + id + " not found or doesn't have workBlocks",
            "status" : "Not found"
          }
        )
      }
    }
  })
}


module.exports = {
    getSchedules,
    getScheduleId,
    getTrips,
    getWorkBlocks
}