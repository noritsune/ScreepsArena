import { prototypes, utils, constants } from '/game';

let myHealers;
let myRangedAttackers;

export function loop() {
    if(!myHealers) {
        myHealers = findMyHealers();
        findMyRangedAttackers().forEach((rangedAttacker, i) => myHealers[i].target = rangedAttacker);
    }

    findMyWorkers().forEach(worker => hervestEnergy(worker));
    findMyAttakers().forEach(attacker => attackEnemyNearMyFlag(attacker));
    myHealers.forEach(healer => healEachRangedAttacker(healer));
    findMyRangedAttackers().forEach(rangedAttacker => rangedAttackClosestEnemy(rangedAttacker));
    
    if(findEnemies().length > 0) {
        const myFlagCaptureCreep = utils.findClosestByPath(findFlag(false), findMyCreeps());
        captureFlag(myFlagCaptureCreep);
    } else {
        findMyCreeps().forEach(creep => captureFlag(creep));
    }

    const myTowers = utils.getObjectsByPrototype(prototypes.StructureTower).filter(tower => tower.my);
    myTowers.forEach(tower => useStructureTower(tower));
}

function captureFlag(creep) {
    const enemyFlag = findFlag(false);
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
 * @param {bool} isMy
 * @return {Flag}
 */
function findFlag(isMy) {
    return utils.getObjectsByPrototype(prototypes.Flag)
        .filter(flag => flag.my === isMy)[0];
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

function findEnemies() {
    return utils.getObjectsByPrototype(prototypes.Creep).filter(creep => !creep.my);
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
 * @param {Creep} attacker 
 */
function attackClosestEnemy(attacker) {
    const closestEnemy = findClosestEnemy(attacker);
    if(!closestEnemy) return;

    if(attacker.attack(closestEnemy) === constants.ERR_NOT_IN_RANGE) {
        attacker.moveTo(closestEnemy);
    }
}

/**
 * @param {Creep} attacker
 */
function attackEnemyNearMyFlag(attacker) {
    const enemysCloseToMyFlag = utils.findInRange(findFlag(true), findEnemies(), 5);
    if(enemysCloseToMyFlag.length === 0) return;

    const closestEnemy = enemysCloseToMyFlag[0];
    if(attacker.attack(closestEnemy) === constants.ERR_NOT_IN_RANGE) {
        attacker.moveTo(closestEnemy);
    }
}

function rangedAttackClosestEnemy(rangedAttacker) {
    const closestEnemy = findClosestEnemy(rangedAttacker);
    if(!closestEnemy) return;

    rangedAttackEfficiently(rangedAttacker);
}

/**
 * @param {Creep} rangedAttacker 
 */
function rangedAttackEfficiently(rangedAttacker) {
    const enemysInRange = utils.findInRange(rangedAttacker, findEnemies(), 3);
    if(enemysInRange.length > 0) {
        rangedAttacker.moveTo(findFlag(true));
    }
    
    if(enemysInRange.length === 0) {
        if(Array.isArray(rangedAttacker.healers) && rangedAttacker.healers.length > 0) {
            const obeyHealers = rangedAttacker.healers;
            const obeyHealersInRange = utils.findInRange(rangedAttacker, obeyHealers, 2);
            if(obeyHealersInRange.length < obeyHealers.length) return;
        }

        const closestEnemy = findClosestEnemy(rangedAttacker);
        rangedAttacker.moveTo(closestEnemy);
    } else if(enemysInRange.length === 1) {
        rangedAttacker.rangedAttack(enemysInRange[0]);
    } else {
        rangedAttacker.rangedMassAttack();
    }


}

function healClosestAttacker(healer) {
    const closestAttacker = findClosestAttacker(healer);
    if(!closestAttacker) return;

    if(healer.heal(closestAttacker) === constants.ERR_NOT_IN_RANGE) {
        healer.moveTo(closestAttacker);
    }
}

function healEachRangedAttacker(healer) {
    const rangedAttackers = findMyRangedAttackers();
    if(rangedAttackers.length === 0) return;

    if(!healer.target || !healer.target.hits) {
        healer.target = utils.findClosestByPath(healer, rangedAttackers);
    }

    if(!Array.isArray(healer.target.healers)) {
        healer.target.healers = [];
    }
    healer.target.healers.push(healer);

    healEfficiently(healer, healer.target);
}

/**
 * @param {Creep} healer 
 * @param {Creep} healed 
 */
function healEfficiently(healer, healed) {
    if(healer.heal(healed) === constants.ERR_NOT_IN_RANGE) {
        healer.moveTo(healed);
        healer.rangedHeal(healed);
    }
}

function calcDistance(posA, posB) {
    const dx = posA.x - posB.x;
    const dy = posA.y - posB.y;
    return Math.sqrt(dx * dx + dy * dy);
}