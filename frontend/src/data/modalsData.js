import {reactive} from 'vue'

let modalEnum = {
    M_CREATE_NODE: 'ModalCreateNode',
    M_CREATE_SEGMENT: 'ModalCreateSegment',
    M_CREATE_STOP: 'ModalCreateStop',
    M_CREATE_TRACK: 'ModalCreateTrack',
    M_UPDATE_NODE: 'ModalUpdateNode',
    M_UPDATE_SEGMENT: 'ModalUpdateSegment',
    M_UPDATE_STOP: 'ModalUpdateStop',
    M_UPDATE_TRACK: 'ModalUpdateTrack',
    M_UPDATE_PATH: 'ModalUpdatePath',
    M_ASK_CREATE_NODE_STOP: 'ModalAskCreateNodeStop',
    M_ASK_UPDATE_FEATURES: 'ModalAskUpdateMultipleFeatures',
    M_CREATE_NETWORK: 'ModalCreateNetwork',
    M_CREATE_PATH: 'ModalCreatePath',
    M_BROWSE_NODES: 'ModalBrowseNodes',
    M_BROWSE_PATHS: 'ModalBrowsePaths',
    M_NULL: null
}

export const modalsData = reactive({
    modalEnum : modalEnum,
    currentModal: null,
    nodeInfo :{
        id: -1,
        is_depot: false,
        label_pos: "F",
        latitude: "",
        longitude: "",
        name: "",
        short_name: "",
        visible: true,
        version:0
    },
    openModalBrowse(entity) {
        if (entity == 'Nodes') {
            this.currentModal = this.modalEnum.M_BROWSE_NODES
        }
        else if (entity == 'Paths') {
            this.currentModal = this.modalEnum.M_BROWSE_PATHS
        }
    },
    openModalUpdateNode(e) {
        this.nodeInfo.id = e.properties.id
        this.nodeInfo.name = e.properties.name
        this.nodeInfo.latitude = e.geometry.coordinates.at(1)
        this.nodeInfo.longitude = e.geometry.coordinates.at(0)
        this.nodeInfo.short_name = e.properties.short_name
        this.nodeInfo.visible = e.properties.visible
        this.nodeInfo.is_depot = e.properties.is_depot
        this.nodeInfo.version = e.properties.version

        this.currentModal = this.modalEnum.M_UPDATE_NODE
    },
    segmentInfo : {
        id: -1,
        name: "",
        start_node_id: -1,
        end_node_id: -1,
        default_length: 1,
        average_duration: 1,
        visible: true,
        segment_type: 1,
        version:0
    },
    openModalUpdateSegment(e) {
        this.segmentInfo.id = e.properties.id
        this.segmentInfo.name = e.properties.name
        this.segmentInfo.start_node_id = e.properties.start_node_id
        this.segmentInfo.end_node_id = e.properties.end_node_id
        this.segmentInfo.default_length = e.properties.default_length
        this.segmentInfo.average_duration = e.properties.average_duration
        this.segmentInfo.visible = e.properties.visible
        this.segmentInfo.segment_type = e.properties.segment_type
        this.segmentInfo.version = e.properties.version

        this.currentModal = this.modalEnum.M_UPDATE_SEGMENT
    },
    stopInfo : {
        id: -1,
        label_pos: "F",
        latitude: "",
        longitude: "",
        name: "",
        short_name: "",
        visible: true,
        active:false,
        code: "",
        version:0
    },
    openModalUpdateStop(e) {
        this.stopInfo.id = e.properties.id
        this.stopInfo.name = e.properties.name
        this.stopInfo.latitude = e.geometry.coordinates.at(1)
        this.stopInfo.longitude = e.geometry.coordinates.at(0)
        this.stopInfo.short_name = e.properties.short_name
        this.stopInfo.visible = e.properties.visible
        this.stopInfo.active = e.properties.active
        this.stopInfo.code = e.properties.code
        this.stopInfo.version = e.properties.version

        this.currentModal = this.modalEnum.M_UPDATE_STOP
    },
    trackInfo :{
        id:-1,
        name:"",
        start_stop:-1,
        end_stop:-1,
        visible:true,
        length:0,
    },
    openModalUpdateTrack(e) {
        this.trackInfo.id = e.properties.id
        this.trackInfo.name = e.properties.name
        this.trackInfo.start_stop = e.properties.start_stop
        this.trackInfo.end_stop = e.properties.end_stop
        this.trackInfo.visible = e.properties.visible
        this.trackInfo.length = e.properties.length

        this.currentModal = this.modalEnum.M_UPDATE_TRACK
    },
    pathInfo: {
        id: -1,
        name: "",
        empty: false
    },
    openModalUpdatePath(e) {
        this.pathInfo.id = e.id
        this.pathInfo.name = e.name,
        this.pathInfo.empty = e.empty,
        this.currentModal = this.modalEnum.M_UPDATE_PATH
    },
    openModalCreatePath(){
        this.currentModal = this.modalEnum.M_CREATE_PATH
    },  
    openModalCreateSegment(){
        this.currentModal = this.modalEnum.M_CREATE_SEGMENT
    },
    openModalCreateTrack(){
        this.currentModal = this.modalEnum.M_CREATE_TRACK
    },
    coords : [0,0],
    openModalCreateNodeStop(rxCoords){
        this.currentModal = this.modalEnum.M_ASK_CREATE_NODE_STOP
        this.coords = [rxCoords.lng, rxCoords.lat]
    },
    openModalCreateNetwork(){
        this.currentModal = this.modalEnum.M_CREATE_NETWORK   
    },
    closeModalAskCreateNodeStop(choice) {
        switch (choice) {
          case 'node':
            this.currentModal = this.modalEnum.M_CREATE_NODE
            break
          case 'stop':
            this.currentModal = this.modalEnum.M_CREATE_STOP
            break
          default:
            break
        }
    },
    features : [],
    handleClickSingleFeature(feature) {
        switch (feature.layer.id) {
          case 'nodesLayer':
            this.openModalUpdateNode(feature)
            break
          case 'segmentsLayer':
            this.openModalUpdateSegment(feature)
            break
          case 'stopsLayer':
            this.openModalUpdateStop(feature)
            break
          case 'tracksLayer':
            this.openModalUpdateTrack(feature)
            break
          default:
            console.error('Feature does not belong to any layer. The programmer must sleep.')
        }
    },
    openModalAskUpdateFeatures(features){
        this.features = features
        this.currentModal = this.modalEnum.M_ASK_UPDATE_FEATURES;
    },
    isBrowseNodesOpen(){
        return this.currentModal === this.modalEnum.M_BROWSE_NODES;
    },
    isBrowsePathsOpen(){
        return this.currentModal === this.modalEnum.M_BROWSE_PATHS;
    },
    isUpdateNodeOpen(){
        return this.currentModal === this.modalEnum.M_UPDATE_NODE;
    },
    isUpdateSegmentOpen(){
        return this.currentModal === this.modalEnum.M_UPDATE_SEGMENT;
    },
    isUpdateStopOpen(){
        return this.currentModal === this.modalEnum.M_UPDATE_STOP;
    },
    isUpdateTrackOpen(){
        return this.currentModal === this.modalEnum.M_UPDATE_TRACK;
    },
    isUpdatePathOpen(){
        return this.currentModal === this.modalEnum.M_UPDATE_PATH;
    },
    isCreateNodeStopOpen(){
        return this.currentModal === this.modalEnum.M_ASK_CREATE_NODE_STOP;
    },
    isAskUpdateFeaturesOpen(){
        return this.currentModal === this.modalEnum.M_ASK_UPDATE_FEATURES;
    },
    isCreateNodeOpen(){
        return this.currentModal === this.modalEnum.M_CREATE_NODE;
    },
    isCreateStopOpen(){
        return this.currentModal === this.modalEnum.M_CREATE_STOP;
    },
    isCreateSegmentOpen(){
        return this.currentModal === this.modalEnum.M_CREATE_SEGMENT;
    },
    isCreateTrackOpen(){
        return this.currentModal === this.modalEnum.M_CREATE_TRACK;
    },
    isCreateNetworkOpen(){
        return this.currentModal === this.modalEnum.M_CREATE_NETWORK
    },
    isCreatePathOpen(){
        return this.currentModal === this.modalEnum.M_CREATE_PATH
    },
    isAnyModalOpen(){
        return this.currentModal !== this.modalEnum.M_NULL
    },
    closeModal(){
        this.currentModal = this.modalEnum.M_NULL
    }
    


})