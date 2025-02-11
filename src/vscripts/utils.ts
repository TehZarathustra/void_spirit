export const randomCirclePosition = (range:any,hero:any) => {
  const x = RandomInt(-range, range)
  let znak=0;
  while (znak === 0) {
      const hui = RandomInt(-100,100)
      if (hui<0) {
          znak=-1
      }
      if (hui>0) {
          znak=1
      }
  }
  const y=(math.sqrt((range-x)*(range+x)))*znak
  const respawn_place = hero.GetAbsOrigin() + Vector(x, y, 0)
  return respawn_place
}