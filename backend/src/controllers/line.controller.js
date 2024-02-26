const db = require('../configs/db.config')

const getLines = (request, response) => {
  db.query('Select * From lines_version', (error, results) => {
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
              "lines":results.rows,
              "status" : "OK"
          }
        )
      }else{
        response.status(404).json(
          {
              "message": "Lines not found" ,
              "status" : "Not found"
          }
        )
      }
    }
  })
}


const getLineCode = (request, response) => {
  const code = parseInt(request.params.code)
  db.query('Select * From lines_version where name = $1', [code], (error, results) => {
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
            "lineInfo" : results.rows.at(0),
            "status" : "OK"
          }
        )
      }else{
        response.status(404).json(
          {
              "message": "Line with code:" + code + " not found" ,
              "status" : "Not found"
          }
        )
      }
    }
  })
}


const getPaths = (request, response) => {
  const id = parseInt(request.params.id)
  db.query('Select path_id From lines_paths where line_id = $1', [id], (error, results) => {
    if(error){
      response.status(400).send(
        {
            "message":error.message,
            "status" : "Bad request"
        }
    )
    }else{
      if(results.rowCount > 0){
        pathIds = results.rows.map(row => row.path_id)
        response.status(200).json(
          {
            "lineId" : id,
            "pathIds": pathIds,
            "status" : "OK"
          }
        )
      }else{ 
        response.status(404).json(
          {
            "message" : "Line with id:" + id + " not found or doesn't have paths",
            "status" : "Not found"
          }
        )
      }
    }
  })
}

module.exports = {
    getLines,
    getPaths,
    getLineCode
}