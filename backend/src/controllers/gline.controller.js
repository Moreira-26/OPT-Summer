const db = require('../configs/db.config');

const getGlines = (request, response) => {
    db.query('Select * From gistlines_version', (error, results) => {
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
                "glines":results.rows,
                "status" : "OK"
            }
          )
        }else{
          response.status(404).json(
            {
                "message": "Glines not found" ,
                "status" : "Not found"
            }
          )
        }
      }
    })
}


const getLines = (request, response) => {
    const id = parseInt(request.params.id)
    db.query('Select line_id From gistlines_lines where gline_version_id = $1', [id], (error, results) => {
      if(error){
        response.status(400).send(
          {
              "message":error.message,
              "status" : "Bad request"
          }
      )
      }else{
        if(results.rowCount > 0){
          lineIds = results.rows.map(row => row.line_id)
          response.status(200).json(
            {
              "glineId" : id,
              "lineIds": lineIds,
              "status" : "OK"
            }
          )
        }else{ 
          response.status(404).json(
            {
              "message" : "Gline with id:" + id + " not found or doesn't have paths",
              "status" : "Not found"
            }
          )
        }
      }
    })
}

const getSchedules = (request, response) => {
  const id = parseInt(request.params.id)
  db.query('Select id From planning_schedules where gistline_id = $1', [id], (error, results) => {
    if(error){
      response.status(400).send(
        {
            "message":error.message,
            "status" : "Bad request"
        }
    )
    }else{
      if(results.rowCount > 0){
        scheduleIds = results.rows.map(row => row.id)
        response.status(200).json(
          {
            "glineId" : id,
            "scheduleIds": scheduleIds,
            "status" : "OK"
          }
        )
      }else{ 
        response.status(404).json(
          {
            "message" : "Gline with id:" + id + " not found or doesn't have paths",
            "status" : "Not found"
          }
        )
      }
    }
  })
}


module.exports = {
    getGlines,
    getLines,
    getSchedules
}