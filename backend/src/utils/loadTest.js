const cluster = require("cluster");
const numCPUs = require("os").cpus().length;
const redis = require('redis')
const url = 'redis://@redis:6379'



const URL = "http://localhost:3001"; 

const nodeInfo = {
  "name": "dadad",
  "short_name": "ddddd",
  "latitude": "123",
  "longitude": "321",
  "label_pos": "F",
  "visible": false,
  "is_depot": false,
  "version": 0
};

function generateRandomFloatInRange(min, max) {
  return (Math.random() * (max - min + 1)) + min;
}

function generateRandomBoolean() {
  return Math.random() < 0.5;
}

function generateRandomIntInRange(min, max){
  return Math.floor(generateRandomFloatInRange(min, max))
}

const nodesCreated = 0;

function createClients() {
  const clients = [];
  for (let i = 0; i < numCPUs; i++) {
    //const socket = io(URL);

    const client = redis.createClient({
      'url':'redis://@localhost:6379'
    });
    client.connect()

    //socket.emit("AUTH:setUsername", `TESTTT:${i}`);
    //socket.on("NODE:updateSuccess", (response) => {
      //console.log("Update Success")
    //})
    
    // socket.on("NODE:updateError", (response) => {
    //   console.log("Update Error")
    // })

    socket.on("NODE:sendMaxKey", (maxKey)=> {
      // Update the nodeInfo data for each interval
      nodeInfo.latitude = generateRandomFloatInRange(40.82, 41.213);
      nodeInfo.longitude = generateRandomFloatInRange(-8.75, -8.11);
      nodeInfo.visible = generateRandomBoolean();

      if(maxKey < 10){
        //create
        socket.emit("NODE:create", nodeInfo);
      }
    })
    setInterval(() => {
      socket.emit("NODE:maxKey")
      //socket.emit("NODE:update", nodeInfo); // Emit an update event
    }, 1000);
  }
}


if (cluster.isPrimary) {
  console.log(`Master ${process.pid} is running`);
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
  });
} else {
  console.log(`Worker ${process.pid} started`);
  createClients();
}
