import { reactive,ref } from "vue";
import { io } from "socket.io-client";
import { nodesGeoJson } from "../data/nodesGeoJson";
import { segmentsGeoJson } from "../data/segmentsGeoJson";
import { stopsGeoJson } from "../data/stopsGeoJson";
import { tracksGeoJson } from "../data/tracksGeoJson";
import { glinesData } from "../data/glinesData";
import { networksData } from "../data/networksData";
import { linesData } from "../data/linesData";
import { pathsData } from "../data/pathsData";

class SocketIOService {
    socket;
    usersConnected = ref([]);
    usersConnectedNetwork = ref({})
    username 
    state = reactive({
        connected:false
    })
    startTime
    endTime

    constructor() {
        this.setupConnection()
        this.setupConnectionEvents();
        this.setupNodeEvents();
        this.setupSegmentEvents();
        this.setupStopEvents();
        this.setupTrackEvents();
        this.setupNetworkEvents();
        this.setupPathEvents();
    }

    setupConnection(){
        this.socket = io('http://localhost:3001/',{autoConnect:false,reconnection:false,   query: {
            currentNetwork: 'network:1'
          }});
    }

    disconnect(){
        this.socket.disconnect();
        this.state.connected = false;
    }

    //Connection events
    setupConnectionEvents(){
        this.socket.on("connect", () => {
            this.state.connected = true;
        })

        this.socket.on("disconnect", () => {
            this.usersConnected.value = [];
            this.usersConnectedNetwork.value = {}
            this.state.connected = false;
        })

        this.socket.on("AUTH:currentState" , (users) => {
            this.usersConnected.value = users;
        })

        this.socket.on("clientConnected", (username) => {
            this.usersConnected.value.push(username);
        })

        this.socket.on("clientDisconnected", (username) => {
            const index = this.usersConnected.value.indexOf(username)
            if(index > -1){
                this.usersConnected.value.splice(index, 1)
            }
        })
    }

    //NODE EVENTS
    setupNodeEvents(){
        this.socket.on("NODE:setOpen", (nodeID) => {
            nodesGeoJson.updateFeatureStyle(nodeID, true);
        })

        this.socket.on("NODE:setClosed", (nodeID) => {
            nodesGeoJson.updateFeatureStyle(nodeID, false);
        })

        //NODE Create Success 
        this.socket.on("NODE:createSuccess", (nodeInfo) => {
            console.log("NODE SUCCESS")

            //Add node to mapbox
            nodesGeoJson.addNode(nodeInfo)
            //Logs 
            console.log("Node created Success, nodeInfo:")
            console.log(nodeInfo)
        })

        //NODE Create Error
        this.socket.on("NODE:createError", (error) => {
            //Display error to the user
            console.log("Error creating node: " + error)
        })

        //NODE Delete Success
        this.socket.on("NODE:deleteSuccess", (response) => {
            //Remove node from mapbox
            nodesGeoJson.deleteNode(response.nodeID)
            //Logs
            console.log("Node " + response.nodeID + " deleted" );
        })

        //NODE Delete Error
        this.socket.on("NODE:deleteError", (response) =>{
            alert(response)
            console.log("Error deleting node " + response)
        })

        //NODE Update Success
        this.socket.on("NODE:updateSuccess", (response) => {
            //Update node in mapbox
            nodesGeoJson.updateNode(response)
            segmentsGeoJson.updateSegsCoords(response)
            //Logs
            console.log("Node Updated Success, nodeInfo:")
            console.log(response)
        })

        //NODE Update Error
        this.socket.on("NODE:updateError", (response) => {
            console.log("Error updating node: " + response)
        })

        //NODE Update DB Success
        this.socket.on("NODE:updateDBSuccess",() => {
            console.log("Postgres updated with success")
        })

        //NODE Update DB Error
        this.socket.on("NODE:updateDBError", () => {
            console.log("Postgres update failed")
        })
    }

    //SEGMENT EVENTS
    setupSegmentEvents(){
           
        //SEG Create Success 
        this.socket.on("SEG:createSuccess", (segInfo) => {
            console.log("SEG SUCCESS")

            //Add seg to mapbox
            segmentsGeoJson.addSegment(segInfo)
            //Logs 
            console.log("SEG created Success, segInfo:")
            console.log(segInfo)
        })

        //SEG Create Error
        this.socket.on("SEG:createError", (error) => {
            //Display error to the user
            console.log("Error creating seg: " + error)
        })

        //SEG Delete Success
        this.socket.on("SEG:deleteSuccess", (segID) => {
            //Remove seg from mapbox
            segmentsGeoJson.deleteSegment(segID)
            //Logs
            console.log("Node " + segID + " deleted" );
        })

        //SEG Delete Error
        this.socket.on("SEG:deleteError", (response) =>{
            console.log("Error deleting seg " + response)
        })

        //SEG Update Success
        this.socket.on("SEG:updateSuccess", (segInfo) => {
            //Update seg in mapbox
            segmentsGeoJson.updateSegment(segInfo)
            //Logs
            console.log("Segment Updated Success, segInfo:")
            console.log(segInfo)
        })

        //SEG Update Error
        this.socket.on("SEG:updateError", (response) => {
            console.log("Error updating segment: " + response)
        })


        this.socket.on("SEG:updateDBSuccess",() => {
            console.log("Postgres updated with success")
        })

        this.socket.on("SEG:updateDBError", () => {
            console.log("Postgres update failed")
        })
    }

    //STOP EVENTS
    setupStopEvents(){
        this.socket.on("STOP:setOpen", (stopID) => {
            stopsGeoJson.updateFeatureStyle(stopID, true);
        })

        this.socket.on("STOP:setClosed", (stopID) => {
            stopsGeoJson.updateFeatureStyle(stopID, false);
        })

        //STOP Create Success 
        this.socket.on("STOP:createSuccess", (stopInfo) => {
            //Add stop to mapbox
            stopsGeoJson.addStop(stopInfo)
            //Logs 
            console.log("Stop created Success, stopInfo:")
            console.log(stopInfo)
        })

        //STOP Create Error
        this.socket.on("STOP:createError", (error) => {
            //Display error to the user
            console.log("Error creating node: " + error)
        })

        //STOP Delete Success
        this.socket.on("STOP:deleteSuccess", (response) => {
            //Remove node from mapbox
            stopsGeoJson.deleteStop(response.stopID)
            //Logs
            console.log("Stop " + stopID + " deleted" );
        })

        //STOP Delete Error
        this.socket.on("STOP:deleteError", (response) =>{
            alert(response)
            console.log("Error deleting stop " + response)
        })

        //STOP Update Success
        this.socket.on("STOP:updateSuccess", (response) => {
            console.log(response)
            //Update stop in mapbox and tracks affected
            stopsGeoJson.updateStop(response)
            if(response.affectedTracks){
                tracksGeoJson.updateTracksCoords(response)
            }
    
            //Logs
            console.log("Stop Updated Success, stopInfo:")
            console.log(response)
        })

        //STOP Update Error
        this.socket.on("STOP:updateError", (response) => {
            console.log("Error updating stop: " + response)
        })
    }

    //TRACK EVENTS
    setupTrackEvents(){
        //TRACK Create Success 
        this.socket.on("TRACK:createSuccess", (trackInfo) => {
            //Add track to mapbox
            tracksGeoJson.addTrack(trackInfo)
            //Logs 
            console.log("Track created Success, stopInfo:")
            console.log(trackInfo)

        })

        //TRACK Create Error
        this.socket.on("TRACK:createError", (error) => {
            //Display error to the user
            console.log("Error creating seg: " + error)
        })

        //TRACK Delete Success
        this.socket.on("TRACK:deleteSuccess", (trackID) => {
            //Remove track from mapbox
            tracksGeoJson.deleteTrack(trackID)
            //Logs
            console.log("Track " + trackID + " deleted" );
        })

        //TRACK Delete Error
        this.socket.on("TRACK:deleteError", (response) =>{
            console.log("Error deleting track " + response)
        })

        //TRACK Update Success
        this.socket.on("TRACK:updateSuccess", (trackInfo) => {
            //Update track in mapbox
            tracksGeoJson.updateTrack(trackInfo)
            //Logs
            console.log("Track Updated Success, trackinfo:")
            console.log(trackInfo)
        })

        //TRACK Update Error
        this.socket.on("TRACK:updateError", (response) => {
            console.log("Error updating TRACK: " + response)
        })
    }

    setupPathEvents(){
        //Path create success
        this.socket.on("PATH:createSuccess", (pathInfo) => {
            pathsData.createPath(pathInfo)
            console.log("CREATE PATH")
            console.log(pathInfo)
        })

        //Path update success
        this.socket.on("PATH:updateSuccess", (response) => {
            pathsData.updatePath(response)
            console.log("UDPATE path")
            console.log(response)
        })

        this.socket.on("PATH:updateError", (response) => {
            console.log(response)
        })

        //Path Delete success
        this.socket.on("PATH:deleteSuccess", (response) => {
            console.log("Delete path success")
            console.log(response)
            pathsData.deletePath(response)
        })

        this.socket.on("PATH:deleteError", (response) => {
            alert(response)
        })
    }

    setupNetworkEvents(){

          /*
        Receive current Redis State (nodes, segments, stops and tracks)
        */
        this.socket.on("NETWORK:sendCurrentState", (data) => {
            console.log(data)

            nodesGeoJson.clearData()
            nodesGeoJson.defineData(data.nodes)

            segmentsGeoJson.clearData()
            segmentsGeoJson.defineData(data.segments)

            stopsGeoJson.clearData()
            stopsGeoJson.defineData(data.stops)

            tracksGeoJson.clearData()
            tracksGeoJson.defineData(data.tracks)

            glinesData.clearData()
            glinesData.defineData(data.glines)

            linesData.clearData()
            linesData.defineData(data.lines)

            pathsData.clearData()
            pathsData.defineData(data.paths, data.pathSegs)
            this.endTime = performance.now()

            console.log(`Elapsed Time  ${this.endTime - this.startTime} miliseconds`)
            networksData.loadingComplete()
    
            
        })

        this.socket.on("NETWORK:sendCurrentNetworks", (networks) => {
            console.log(networks)
            networksData.defineData(networks)
        })

        this.socket.on("NETWORK:userJoinedNetwork", (usersConnectedNetwork) => {
            this.usersConnectedNetwork.value = usersConnectedNetwork
        })

        this.socket.on("NETWORK:createSuccess", (networkInfo) => {
            networksData.addNetwork(networkInfo)
        })

        this.socket.on("NETWORK:createError", (networkInfo) => {
            console.log("Error creating network")
        })

        this.socket.on('NETWORK:errorActiveNetwork', () => {
            alert("CANNOT UPDATE ACTIVE NETWORK")
        })
    }



    //EVENTS TO SEND AUTH
    connectAuth(username){
        this.socket.connect();
        this.socket.emit("AUTH:setUsername", username);
        this.username = username
    }

    //EVENTS TO SEND NETWORK
    getNetworks(){
        this.socket.emit("NETWORK:getNetworks", "")
    }

    getNetworkCurrenState(networkId){
        this.socket.emit("NETWORK:getCurrentState", networkId)
        networksData.loadingStart()
        this.startTime = performance.now()
    }

    getNetworkUsers(){
        this.socket.emit("NETWORK:getNetworkUsers", "")
    }

    joinNetwork(networkId){
        var oldNetworkId = -1
        const oldNetwork = this.usersConnectedNetwork.value[this.username]
        if(oldNetwork != undefined){
            oldNetworkId = oldNetwork.substring(oldNetwork.indexOf(':') + 1)
        }
        this.socket.emit('NETWORK:join', networkId,oldNetworkId)
    }

    createNetwork(networkInfo){
        this.socket.emit("NETWORK:create", networkInfo)
    }

    //EVENTS TO SEND NODE
    createNode(nodeInfo){
        this.socket.emit("NODE:create",nodeInfo)
        console.log("NODE CREATE")

    }

    setNodeOpen(nodeID){
        this.socket.emit("ALL:claimEntity", nodeID)
        this.socket.emit("NODE:setOpen", nodeID)
    }

    setNodeClosed(nodeID){
        this.socket.emit("ALL:disclaimEntity", nodeID)
        this.socket.emit("NODE:setClosed", nodeID)
    }

    updateNode(nodeInfo){
        this.socket.emit("NODE:update", nodeInfo)
    }

    deleteNode(nodeID,version){
        this.socket.emit("NODE:delete", nodeID,version)
    }
    
    requestNodesCurrentState(){
        const response = this.socket.emitWithAck("NODE:getCurrentState", "").then((data) => {console.log(data)});
        return response;
    }
    
    // EVENTS TO SEND TO SEGMENT

    createSegment(segmentInfo){
        this.socket.emit("SEG:create", segmentInfo)
    }

    updateSegment(segmentInfo){
        this.socket.emit("SEG:update", segmentInfo)
    }

    deleteSegment(segmentInfo){
        this.socket.emit("SEG:delete", segmentInfo)
    }

    requestSegmentsCurrentState(){
        const response = this.socket.emitWithAck("SEG:getCurrentState", "").then((data) => {console.log(data)});
        return response;
    }

    // EVENTS TO SEND TO STOP

    createStop(stopInfo){
        this.socket.emit("STOP:create", stopInfo)
    }

    setStopOpen(stopID){
        this.socket.emit("STOP:setOpen", stopID)
    }

    setStopClosed(stopID){
        this.socket.emit("STOP:setClosed", stopID)
    }

    updateStop(stopInfo){
        this.socket.emit("STOP:update", stopInfo)
    }

    deleteStop(stopID, version){
        this.socket.emit("STOP:delete", stopID, version)
    }

    //EVENTS TO SEND TO TRACK

    createTrack(trackInfo){
        this.socket.emit("TRACK:create", trackInfo)
    }

    updateTrack(trackInfo){
        this.socket.emit("TRACK:update",trackInfo)
    }

    deleteTrack(trackInfo){
        this.socket.emit("TRACK:delete", trackInfo)
    }

    //EVENTS TO SEND TO PATH
    createPath(pathInfo){
        this.socket.emit("PATH:create", pathInfo)
    }

    updatePath(pathInfo){
        this.socket.emit("PATH:update", pathInfo)
    }

    deletePath(pathInfo){
        this.socket.emit("PATH:delete", pathInfo)
    }
}



export default new SocketIOService();
