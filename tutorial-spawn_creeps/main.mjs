import { prototypes, utils, constants } from '/game';

export function loop() {
    const creeps = utils.getObjectsByPrototype(prototypes.Creep);

    if(creeps.length < 2) {
        const structureSpawn = utils.getObjectsByPrototype(prototypes.StructureSpawn)[0];
        structureSpawn.spawnCreep([constants.MOVE]);
    }

    const flags = utils.getObjectsByPrototype(prototypes.Flag);
    
    creeps.forEach((creep, i) => creep.moveTo(flags[i]));
}
