const express = require('express')
const bodyParser = require('body-parser')
const client = require('./configs/redis.config')
const cors = require('cors')
const app = express()
const http = require('http')
const server = http.createServer(app) 
const port = 3001

app.use(cors({
  origin: 'http://localhost:3001/'
}))

const io = require("socket.io")(server, {
  cors: {
    origin : "http://localhost:3000",
    methods: ["GET", "POST", "PUT"]
  }
});

const auth = require("./socketIO/events/auth.events")
const nodes = require("./socketIO/events/node.events")
const all = require("./socketIO/events/all.events")
const segments = require("./socketIO/events/segment.events")
const stops = require("./socketIO/events/stop.events")
const tracks = require("./socketIO/events/track.events")
const network = require("./socketIO/events/network.events")
const path = require("./socketIO/events/path.events")

const nodeRedis = require("./redisQueries/nodes.queries")
const segmentRedis = require("./redisQueries/segments.queries")
const stopsRedis = require("./redisQueries/stops.queries")
const tracksRedis = require("./redisQueries/tracks.queries")
const glinesRedis = require("./redisQueries/glines.queries")
const linesRedis = require("./redisQueries/lines.queries")
const pathsRedis = require("./redisQueries/paths.queries")
const networkRedis = require("./redisQueries/network.queries")
const setOps = require("./utils/setOps.utils")


io.on('connection', (socket) => {

  all.setupEvents(socket, io)

  auth.setupEvents(socket,io);

  nodes.setupEvents(socket,io);
  segments.setupEvents(socket, io);
  stops.setupEvents(socket,io)
  tracks.setupEvents(socket, io)
  network.setupEvents(socket,io)
  path.setupEvents(socket,io)

  //LOAD TEST
  socket.on("client to server event", () => {
    socket.emit("server to client event")
  })

  socket.once('disconnect', () => {
    all.ownedEntities.deleteOwnedEntitiesFromOwner = socket.id
  })

});

const glinesRouter = require('../src/routes/gline.route')
const linesRouter = require('../src/routes/line.route')
const pathsRouter = require('../src/routes/path.route')
const tripsRouter = require('../src/routes/trip.route')
const scheduleRouter = require('../src/routes/schedule.route')
const nodesRouter = require('../src/routes/node.route')
const workBlocksRouter = require('../src/routes/workBlocks.route')
const vehicleDutiesRouter = require('../src/routes/vehicleDuties.route')
const segsRouter = require('../src/routes/segs.route')

app.use(bodyParser.json())

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)



app.get('/', async (req, res) => {

    nodeRedis.populateRedis();
    segmentRedis.populateRedis();
    stopsRedis.populateRedis();
    tracksRedis.populateRedis();
    glinesRedis.populateRedis();
    pathsRedis.populateRedis();
    linesRedis.populateRedis();
    networkRedis.populateRedis()
   
    const nodeInfo = {
      "name": "test123",
      "short_name" : "test",
      "latitude":123,
      "longitude":321,
      "label_pos": "F",
      "visible": true,
      "is_depot":false
    }


    const segmentInfo = {
      "id":808142,
      "name": "SegmentTestUPDATE",
      "start_node_id": 4,
      "end_node_id" : 7,
      "segment_type" : 1,
      "default_lenght": 2000,
      "average_duration": 8,
      "visible": false
    }

    const pathInfo = {
      "id":"path:4006020",
      "name": "TestUpdate",
      "empty" : true,
      "segs": [
        {
          "id":'segment:933',
          "order":1
        },
        {
          "id":'segment:1008',
          "order":2
        },
        {
          "id":'segment:405',
          "order":3
        }
      ]
    }
    res.status(200).json(
      {
        "message": "Welcome to the OPT Dashboard API. Find more info at: https://github.com/Moreira-26/OPT_Dashboard",
        "status" : "OK"
      }
    );
})

app.get('/test', async(req,res) => {

  const pathInfoUpdate = {
    "id":"path:4006020",
    "name": "TestUpdate",
    "empty" : true,
    "segs": [
      {
        "id":'segment:933',
        "order":1
      },
      {
        "id":'segment:1008',
        "order":2
      },
      {
        "id":'segment:405',
        "order":3
      }
    ]
  }

  const pathInfoCreate= {
    "name": "TestUpdate",
    "empty" : true,
    "segs": [
      {
        "id":'segment:933',
        "order":1
      },
      {
        "id":'segment:1008',
        "order":2
      },
      {
        "id":'segment:405',
        "order":3
      }
    ]
  }

  const pathInfoDelete= {
    "id":"path:4003620",
    "name": "TestUpdate",
    "empty" : true,
    "segs": [
      {
        "id":'segment:933',
        "order":1
      },
      {
        "id":'segment:1008',
        "order":2
      },
      {
        "id":'segment:405',
        "order":3
      }
    ]
  }
  const updatePath =  pathsRedis.updatePathRedis(pathInfoUpdate, 'network:2').then((result) => {console.log(result)})
  //const createPath =  pathsRedis.createPathRedis(pathInfoCreate, 'network:2').then((result) => {console.log(result)})
  //pathsRedis.deletePathRedis(pathInfoDelete, 'network:2').then((result) => console.log(result))

  res.status(200).json(
    {
      "message": "TEST",
      "status" : "OK"
    }
  );

})

app.get('/merge', async (req, res) => {
  const result = await networkRedis.mergeDrafts('network:2', 'network:3')
  res.status(200).json(
    {
      'result':result
    }
  )
})

app.use('/glines',glinesRouter)
app.use('/lines',linesRouter)
app.use('/paths',pathsRouter)
app.use('/trips',tripsRouter)
app.use('/schedules',scheduleRouter)
app.use('/nodes',nodesRouter)
app.use('/workBlocks',workBlocksRouter)
app.use('/vehicleDuties', vehicleDutiesRouter)
app.use('/segs',segsRouter)


app.get('*', (req, res) => {
  res.status(404).json(
    {
        "message": "Page not found" ,
        "status" : "Not found"
    }
  )
})

server.listen(port, () => {

    console.log(`Example app listening at http://localhost:${port}`)

})