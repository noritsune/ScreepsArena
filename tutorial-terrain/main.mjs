import { prototypes, utils, constants } from '/game';

export function loop() {
    const creeps = utils.getObjectsByPrototype(prototypes.Creep);
    const flags  = utils.getObjectsByPrototype(prototypes.Flag);
    creeps.forEach(creep => {
        const closestFlag = creep.findClosestByPath(flags);
        creep.moveTo(closestFlag);
    });
}
