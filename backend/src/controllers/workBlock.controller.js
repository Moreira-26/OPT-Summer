const db = require('../configs/db.config')

const getWorkBLocks = (request, response) => {
    db.query('Select * From work_blocks', (error, results) => {
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
                "workBlocks":results.rows,
                "status" : "OK"
            }
          )
        }else{
          response.status(404).json(
            {
                "message": "Work blocks not found" ,
                "status" : "Not found"
            }
          )
        }
      }
    })
}

const getWorkBlockId = (request, response) => {
    const id = parseInt(request.params.id)
    db.query('Select * From work_blocks where id = $1', [id], (error, results) => {
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
              "workBlockInfo" : results.rows.at(0),
              "status" : "OK"
            }
          )
        }else{
          response.status(404).json(
            {
                "message": "Work block with id:" + id + " not found" ,
                "status" : "Not found"
            }
          )
        }
      }
    })
}


module.exports = {
    getWorkBLocks,
    getWorkBlockId
}