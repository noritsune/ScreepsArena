import { prototypes, utils, constants } from '/game';

export function loop() {
    const creep = utils.getObjectsByPrototype(prototypes.Creep)[0];
    
    if(creep.store.getFreeCapacity() > 0) {
        const source = utils.getObjectsByPrototype(prototypes.Source)[0];
        if(creep.harvest(source) == constants.ERR_NOT_IN_RANGE) {
            creep.moveTo(source);
        }
    } else {
        const spawner = utils.getObjectsByPrototype(prototypes.StructureSpawn)[0];
        if(creep.transfer(spawner, constants.RESOURCE_ENERGY) == constants.ERR_NOT_IN_RANGE) {
            creep.moveTo(spawner);
        }
    }
}