import { prototypes, utils, constants } from '/game';

export function loop() {
    const spawner = utils.getObjectsByPrototype(prototypes.StructureSpawn)[0];
    spawnEveryCreepRotate(spawner);

    findMyWorkers().forEach(worker => hervestEnergy(worker));
    findMyAttakers().forEach(attacker => attackClosestEnemy(attacker));
    findMyRangedAttackers().forEach(rangedAttacker => rangedAttackClosestEnemy(rangedAttacker));
    findMyHealers().forEach(healer => healClosestDamagedCreep(healer));
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
 * @param {StructureSpawn} spawner 
 */
function spawnEveryCreepRotate(spawner) {
    const workerCnt = findMyWorkers().length;
    const attackerCnt = findMyAttakers().length;
    const rangedAttackerCnt = findMyRangedAttackers().length;
    const healerCnt = findMyHealers().length;

    if(workerCnt < 2) {
        spawner.spawnCreep([constants.MOVE, constants.WORK, constants.WORK, constants.WORK, constants.CARRY]);
    } else if(attackerCnt == 0 || attackerCnt < rangedAttackerCnt) {
        spawner.spawnCreep([constants.MOVE, constants.ATTACK, constants.ATTACK]);
    } else if(rangedAttackerCnt == 0 || rangedAttackerCnt <= healerCnt) {
        spawner.spawnCreep([constants.MOVE, constants.RANGED_ATTACK, constants.RANGED_ATTACK]);
    } else {
        spawner.spawnCreep([constants.MOVE, constants.HEAL]);
    }

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
function findClosestDamagesCreep(position) {
    const myCreeps = utils.getObjectsByPrototype(prototypes.Creep).filter(creep => creep.my);
    const damagedCreeps = myCreeps.filter(creep => creep.hits < creep.hitsMax);
    return utils.findClosestByPath(position, damagedCreeps);
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
    const closestDamagedCreep = findClosestDamagesCreep(creep);
    if(!closestDamagedCreep) return;

    if(creep.heal(closestDamagedCreep) === constants.ERR_NOT_IN_RANGE) {
        creep.moveTo(closestDamagedCreep);
    }
}