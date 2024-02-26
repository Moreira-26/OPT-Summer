const db = require('../configs/db.config')

const getPaths = (request, response) => {
    db.query('Select * From paths_version', (error, results) => {
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
                "paths":results.rows,
                "status" : "OK"
            }
          )
        }else{
          response.status(404).json(
            {
                "message": "Paths not found" ,
                "status" : "Not found"
            }
          )
        }
      }
    })
}

const getPathId = (request, response) => {
  const id = parseInt(request.params.id)
  db.query('Select * From paths_version where id = $1', [id], (error, results) => {
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
            "pathInfo" : results.rows.at(0),
            "status" : "OK"
          }
        )
      }else{
        response.status(404).json(
          {
              "message": "Path with id:" + id + " not found" ,
              "status" : "Not found"
          }
        )
      }
    }
  })
}

const getSegs = (request, response) => {
    db.query('Select * From paths_segs', (error, results ) => {
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
              "pathsSegs" : results.rows,
              "status" : "OK"
            }
        )
        }else{
          response.status(404).json(
            {
              "message" : "Paths segs not found",
              "status" : "Not found"
            }
          )
        }
      }
    })
}



module.exports = {
    getPaths,
    getSegs,
    getPathId
}