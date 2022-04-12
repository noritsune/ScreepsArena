import { getObjectsByPrototype } from '/game/utils';
import { Creep, Flag } from '/game/prototypes';

export function loop() {
    const creeps = getObjectsByPrototype(Creep);
    const flags = getObjectsByPrototype(Flag);
    for (let i = 0; i < Math.min(creeps.length, flags.length); i++) {
        creeps[i].moveTo(flags[i]);
    }
}
