const regex = /(\w*:\d*:)?(\w*):(\d*)/

/**
 * Match regex returns an array
 * 0 - entire string 
 * 1 - undefined if string hasnt net:{networkId}, net:{networkId} otherwise
 * 2 - type
 * 3 - id
*/
const parser = {
    parse (str){
        return str.match(regex)
    },
    isFromActive (str){
        return this.parse(str).at(1) == undefined
    },
    getType(str){
        return this.parse(str).at(2)
    },
    getId(str){
        return this.parse(str).at(3)
    },
    getOriginalId(str){
        return `${this.getType(str)}:${this.getId(str)}`
    }
}


module.exports = {
    parser
}
