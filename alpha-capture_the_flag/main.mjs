import { prototypes, utils, constants } from '/game';

export function loop() {
    findMyWorkers().forEach(worker => hervestEnergy(worker));
    findMyAttakers().forEach(attacker => attackClosestEnemy(attacker));
    findMyRangedAttackers().forEach(rangedAttacker => rangedAttackClosestEnemy(rangedAttacker));
    findMyHealers().forEach(healer => healClosestDamagedCreep(healer));
    
    const myFirstCreep = findMyCreeps()[0];
    captureFlag(myFirstCreep);

    const myTowers = utils.getObjectsByPrototype(prototypes.StructureTower).filter(tower => tower.my);
    myTowers.forEach(tower => useStructureTower(tower));
}

function captureFlag(creep) {
    const enemyFlag = utils.getObjectsByPrototype(prototypes.Flag)
        .filter(flag => !flag.my)[0];
    if(creep && enemyFlag) {
        creep.moveTo(enemyFlag);
    }
}

function useStructureTower(tower) {
    const enemies = utils.getObjectsByPrototype(prototypes.Creep).filter(creep => !creep.my);
    const closestEnemy = utils.findClosestByRange(tower, enemies);
    if(closestEnemy) {
        tower.attack(closestEnemy);
    }
}

/**
 * @returns {Creep[]}
 */
function findMyCreeps() {
    return utils.getObjectsByPrototype(prototypes.Creep).filter(creep => creep.my);
}

/**
 * @returns {Creep[]}
 */
function findMyWorkers() {
    return findMyCreeps().filter(creep => creep.body.some(bodyPart => bodyPart.type === constants.WORK));
}

function findMyAttakers() {
    return findMyCreeps().filter(creep => creep.body.some(bodyPart => bodyPart.type === constants.ATTACK));
}

function findMyRangedAttackers() {
    return findMyCreeps().filter(creep => creep.body.some(bodyPart => bodyPart.type === constants.RANGED_ATTACK));
}

function findMyHealers() {
    return findMyCreeps().filter(creep => creep.body.some(bodyPart => bodyPart.type === constants.HEAL));
}

/**
 * @param {Creep} creep 
 */
function hervestEnergy(creep) {
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

/**
 * @param {{x: number, y: number}} position 
 * @returns {Creep}
 */
function findClosestEnemy(position) {
    const enemys = utils.getObjectsByPrototype(prototypes.Creep).filter(creep => !creep.my);
    return utils.findClosestByPath(position, enemys);
}

/**
 * @param {{x: number, y: number}} position 
 * @returns {Creep}
 */
function findClosestAttacker(position) {
    const attackers = findMyAttakers();
    return utils.findClosestByPath(position, attackers);
}

/**
 * @param {Creep} creep 
 */
function attackClosestEnemy(creep) {
    const closestEnemy = findClosestEnemy(creep);
    if(!closestEnemy) return;

    if(creep.attack(closestEnemy) === constants.ERR_NOT_IN_RANGE) {
        creep.moveTo(closestEnemy);
    }
}

function rangedAttackClosestEnemy(creep) {
    const closestEnemy = findClosestEnemy(creep);
    if(!closestEnemy) return;

    if(creep.rangedAttack(closestEnemy) === constants.ERR_NOT_IN_RANGE) {
        creep.moveTo(closestEnemy);
    }
}

function healClosestDamagedCreep(creep) {
    const closestAttacker = findClosestAttacker(creep);
    if(!closestAttacker) return;

    if(creep.heal(closestAttacker) === constants.ERR_NOT_IN_RANGE) {
        creep.moveTo(closestAttacker);
    }
}