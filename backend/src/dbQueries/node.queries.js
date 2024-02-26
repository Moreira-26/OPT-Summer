const db = require('../configs/db.config')

const getNodesDB = () => {
    const result = db.query('Select * From nodes_version')
    .catch(error => 
        {
            return error.message;
        }
    ).then(results => 
        {
            if(results.rowCount > 0){
                return {"resultsRows":results.rows};
            }else{
                return "Nodes not found";
            }
        }
    );
    return result;
}
    

const getNodeIdDB = async (id) => {
    const result = await db.query('Select * From nodes_version where id = $1', [id])
    .catch (error =>
        {
            return error.message;
        }
    ).then(results =>
        {
            if(results.rowCount > 0){
                return {"resultsRows":results.rows};
            }else{
                return "Node with id:" + id + " not found";
            }
        }
    );

    return result;
}
    
const deleteNodeDB = async (id) => {
    const result = await db.query('DELETE FROM nodes_version WHERE id = $1', [id])
    .catch(error => 
        {
            return error.message;
        }
    ).then(results => 
        {
            if(results.rowCount > 0){
                return  "Node with id:" + id + " deleted" ;
            }else{
                return "Node with id:" + id + " not found" ;
            }
        }   
    );

    return result;
}

const createNodeDB = async (name, short_name, latitude, longitude, label_pos, visible, is_depot) => {
    const maxId =   await db.query('SELECT MAX(id) FROM nodes_version')
    .then((results) => {
        return results.rows[0].max;
    });
    
    console.log("MAXID:" + maxId)
    const id = maxId + 1;

    const result  = await db.query('INSERT INTO nodes_version (id, name, short_name, latitude, longitude, label_pos, visible, is_depot,version) VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9) RETURNING *', [id, name, short_name, latitude, longitude, label_pos, visible, is_depot,0])
    .catch(
        async (error) => {
            return error.message;
        }
    ).then(
        async (results) => {
            if(results.rowCount > 0){
                return {"nodeInfo":results.rows.at(0)};
            }else{
                return results
            }
        }
    )
        
    return result;
}

const updateNodeDB = async (id, name, short_name, latitude, longitude, label_pos, visible, is_depot, version) => {
    const result = await db.query(
        'UPDATE nodes_version SET name = $1, short_name = $2, latitude = $3, longitude = $4, label_pos = $5, visible = $6, is_depot = $7, version = $8 WHERE id = $9 RETURNING *', 
        [name, short_name, latitude, longitude, label_pos, visible, is_depot,version, id]
        ).catch(
            (error) => {
                return error.message;
            }
        ).then(
            (results) => {
                if(results.rowCount > 0){
                    return {"nodeInfo":results.rows.at(0)};
                }else{
                    return "Node with id:" + id + " not found";
                }
            }
        )

    return result;
}


const getNodeVersionDB = async (id) => {
    const result = await db.query(
        'Select version from nodes_version where id =$1' ,[id]
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

const updateDB = async (nodes) => {
    var result = false;
    //Transaction to update PostgreSQL with redis information
    //This query tries to insert the node if doesnt succeed (meaning the node already exists in PG) updates it
    const client = await db.connect()

    try{
        await client.query('BEGIN')
        nodes.forEach(async (node) => {
            await client.query('INSERT INTO nodes_version (id, name, short_name, latitude, longitude, label_pos, visible, is_depot, version) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (id) DO UPDATE SET name = $2, short_name = $3, latitude = $4, longitude=$5, label_pos=$6, visible=$7, is_depot=$8, version=$9',
            [node.id,node.name, node.short_name, node.latitude, node.longitude, node.label_pos, node.visible,node.is_depot, node.version])
        });
        await client.query('COMMIT')
        result = true;
    }catch(e){
        await client.query('ROLLBACK')
        console.log("Error PG transaction " +e)
    } finally{
        client.release()
        return result;
    }
}

module.exports = {
    getNodesDB,
    getNodeIdDB,
    deleteNodeDB,
    createNodeDB,
    updateNodeDB,
    getNodeVersionDB,
    updateDB
};