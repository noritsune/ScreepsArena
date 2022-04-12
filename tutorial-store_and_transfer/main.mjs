import { prototypes, utils, constants } from '/game';

const neededEnegyForTowerShot = 10;

export function loop() {
    const tower = utils.getObjectsByPrototype(prototypes.StructureTower)[0];

    if(tower.store[constants.RESOURCE_ENERGY] < neededEnegyForTowerShot) {
        // エネルギーが足りないので補充する
        const myCreep = utils.getObjectsByPrototype(prototypes.Creep).find(creep => creep.my);
        if(myCreep.store[constants.RESOURCE_ENERGY] == 0) {
            // Creepがエネルギーを持っていないので持つ
            const container = utils.getObjectsByPrototype(prototypes.StructureContainer)[0];
            myCreep.withdraw(container, constants.RESOURCE_ENERGY);
        } else {
            // Creepが持っているエネルギーをタワーに渡す
            myCreep.transfer(tower, constants.RESOURCE_ENERGY);
        }
    } else {
        const enemy = utils.getObjectsByPrototype(prototypes.Creep).find(creep => !creep.my);
        tower.attack(enemy);
    }
}
