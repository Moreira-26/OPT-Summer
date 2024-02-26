const allHandlers = require('../handlers/all.handlers')

// This object keeps track of all entities currently owned ("clicked") by users.
const ownedEntities = {
    _entities: new Map(),
  
    get entities() {
      return Set.from(this._entities.keys()) 
    },
    
    set addOwnedEntity(ownership) {
      this._entities.set(ownership.entity, ownership.owner) 
    },
  
    set deleteOwnedEntity(entity) {
      this._entities.delete(entity) 
    },
  
    set deleteOwnedEntitiesFromOwner(owner) {
      for (const [_entity, _owner] of this._entities) {
        if (_owner === owner) {
          this._entities.delete(_entity) 
        }
      }
    },
  
    hasEntity(entity) {
      return this._entities.get(entity) != undefined ? true : false
    },
  
    getOwner(entity) {
      if (this.hasEntity(entity)) {
        return this._entities.get(entity)
      }
    }
  }

function setupEvents(socket, io) {
    socket.on("Network:getNetworks", () => allHandlers.handleGetNetworks(socket))
    socket.on("ALL:getCurrentState", (networkId) => allHandlers.handleGetNetworkCurrentState(networkId,socket))
    socket.on("ALL:claimEntity", entity => allHandlers.handleClaimEntity(socket, io, ownedEntities, entity))
    socket.on("ALL:disclaimEntity", entity => allHandlers.handleDisclaimEntity(socket, io, ownedEntities, entity))
}

module.exports = { 
  setupEvents,
  ownedEntities
}