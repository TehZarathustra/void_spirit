import {InternalHero} from './types/InternalHero';
import {InternalUnit} from './types/InternalUnit';

export const getPlayer =  () => PlayerResource.GetPlayer(0);
export const getPlayerHero = () => getPlayer()?.GetAssignedHero();

interface createEntityOpts {
  name: InternalHero & InternalUnit;
}

export const createEntity = (vector: Vector, {name}: createEntityOpts) => {
  return CreateUnitByName(
    name,
    vector,
    true,
    undefined,
    undefined,
    DotaTeam.BADGUYS
  );
}