import { getObjectsByPrototype } from '/game/utils';
import { Creep } from '/game/prototypes';
import { ERR_NOT_IN_RANGE, MOVE, ATTACK, RANGED_ATTACK, HEAL } from '/game/constants';

export function loop() {
    const myCreeps = getObjectsByPrototype(Creep).filter(creep => creep.my);
    const myCreepAttack = myCreeps.find(creep => creep.body.some(bodyPart => bodyPart.type === ATTACK));
    const myCreepRangedAttack = myCreeps.find(creep => creep.body.some(bodyPart => bodyPart.type === RANGED_ATTACK));
    const myCreepHeal = myCreeps.find(creep => creep.body.some(bodyPart => bodyPart.type === HEAL));
    const enemyCreep = getObjectsByPrototype(Creep).find(creep => !creep.my);

    console.log(`My creeps: ${myCreeps}`);

    if(myCreepAttack.attack(enemyCreep) === ERR_NOT_IN_RANGE) {
        myCreepAttack.moveTo(enemyCreep);
    }

    if(myCreepRangedAttack.rangedAttack(enemyCreep) === ERR_NOT_IN_RANGE) {
        myCreepRangedAttack.moveTo(enemyCreep);
    }

    if(myCreepHeal.heal(myCreepAttack) === ERR_NOT_IN_RANGE) {
        myCreepHeal.moveTo(myCreepAttack);
    }
}
