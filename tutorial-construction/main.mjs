import { prototypes, utils, constants } from '/game';

let constSite;
export function loop() {
    const container = utils.getObjectsByPrototype(prototypes.StructureContainer)[0];
    const buildPos = {x: container.x, y: container.y + 1};
    const creep = utils.getObjectsByPrototype(prototypes.Creep)[0];

    if(!constSite) constSite = utils.createConstructionSite(buildPos, prototypes.StructureTower).object;

    if(creep.store.getUsedCapacity() === 0) {
        console.log("エネルギー補充");
        if(creep.withdraw(container, constants.RESOURCE_ENERGY) === constants.ERR_NOT_IN_RANGE) {
            console.log("コンテナに移動");
            creep.moveTo(container);
        }
    } else {
        console.log("建築");
        console.log(constSite);
        if(creep.build(constSite) === constants.ERR_NOT_IN_RANGE) {
            console.log("建築地点に移動");
            creep.moveTo(constSite);
        }
    }
}
