import {randomCirclePosition} from './utils';
import {
  BaseModifier,
  registerModifier,
} from './lib/dota_ts_adapter';
import {
  getPlayer,
  getPlayerHero
} from './apiHelpers';

const dummyAIHeroes = new Set<number>();

@registerModifier()
export class modifierQueenOfPainBlinkAI extends BaseModifier {
  // Keep this modifier hidden from the UI
  IsHidden(): boolean {
    return true;
  }

  // Listen to the OnTakeDamage event
  DeclareFunctions(): ModifierFunction[] {
    return [ModifierFunction.ON_TAKEDAMAGE];
  }

  // Called whenever the unit takes damage
  OnTakeDamage(event: ModifierInstanceEvent): number {
    const parent = this.GetParent();

    // Ensure the event is for our Queen of Pain and that the attacker is an enemy
    if (
      event.unit === parent &&
      event.attacker &&
      event.attacker.GetTeamNumber() !== parent.GetTeamNumber()
    ) {
      const blinkAbility = parent.FindAbilityByName("queenofpain_blink");
      print('looking for ability....', blinkAbility)
      if (blinkAbility && blinkAbility.IsFullyCastable()) {
        // Calculate a safe position: move from the attacker toward the opposite direction
        const parentOrigin = parent.GetAbsOrigin();
        const attackerOrigin = event.attacker.GetAbsOrigin();
        const direction = parentOrigin.__sub(attackerOrigin).Normalized();
        const blinkRange = blinkAbility.GetSpecialValueFor("blink_range") as number;
        const targetPos = parentOrigin.__add(direction.__mul(blinkRange));

        // Order Queen of Pain to cast blink toward targetPos
        ExecuteOrderFromTable({
          UnitIndex: parent.entindex(),
          OrderType: 5,
          AbilityIndex: blinkAbility.entindex(),
          Position: targetPos,
          Queue: false,
        });
      }
    }
    return 0;
  }
}

export class ComboTraining {
  constructor() {
    this.onInit()
  }

  private onInit() {
    this.subscribe()

    // show panorama panel
    CustomGameEventManager.Send_ServerToPlayer(getPlayer()!, 'combo_training_started', {score: 0} as never);

    // with this thing i can cancel player order
    // before i happened
    GameRules.GetGameModeEntity().SetExecuteOrderFilter((event) => {
        return true;
    }, {});

    // this thing will work in panorama
    ListenToGameEvent('dota_player_update_selected_unit', (event: any) => {
      // i'd need it to reset accidental enemy selection
      // and select the main hero
    }, undefined);
  }

  private subscribe() {
    // Register event listeners for dota engine events
    ListenToGameEvent("npc_spawned", event => this.OnNpcSpawned(event), undefined);

    // i'd need them later
    // ListenToGameEvent("dota_player_used_ability", event => this.OnAbilityUsed(event), undefined);
    // ListenToGameEvent("entity_hurt", event => this.OnEntityHurt(event), undefined);


    // i should wrap it after i build panorama message
    // CustomGameEventManager.RegisterListener("ui_start_combo", startTrainingWrapper);
    const startTrainingWrapper = (() => Timers.CreateTimer(2, () => {
      const hero = getPlayerHero();

      if (!hero) return;

      this.start(hero);
    }))()  
  }

  private unSubscribe() {
    // here i should unsubscribe i guess, in case i would want to hot-swap scenarios
  }

  public start(hero: CDOTA_BaseNPC_Hero) {
    print('this start inner >>>');
    this.spawnCreepInvard()(getPlayerHero()!);
  }

  public spawnCreep(spawnVector: Vector, opt?: Record<any, any>) {
    const creep = CreateUnitByName(
        opt?.creepType || 'npc_dota_hero_queenofpain',
        spawnVector,
        true,
        undefined,
        undefined,
        DotaTeam.BADGUYS
    );

    // creep.SetAttackCapability(0)
    // creep.SetMoveCapability(1)
    // creep.SetBaseHealthRegen(0)
    // creep.SetDeathXP(0)

    // if (Array.isArray(opt?.modifiers)) {
    //     opt.modifiers.forEach((modifier: string) =>
    //         creep.AddNewModifier(undefined, undefined, modifier, undefined));
    // }

    // if (opt?.creepHp) creep.SetHealth(opt.creepHp)
    // if (opt?.creepSpeed) creep.SetBaseMoveSpeed(opt.creepSpeed)

    // print('creeep >>>', creep);

    return creep;
  }

  public spawnCreepInvard() {
    print('spawnCreepInvard outer >>>')
    return (hero: CDOTA_BaseNPC_Hero, opt = {}) => {
        print('invoking >>>>>')
        const spawnVector = randomCirclePosition(RandomInt(200, 300), hero);
        const vectorToHero = hero.GetOrigin() - spawnVector as Vector;

        print('in spawnCreepInvard >>>')
        
        const spawnCb = () => {
            const creep = this.spawnCreep(spawnVector, opt);
            // const directionVector = vectorToHero * -1;
            const id = getPlayerHero()?.GetPlayerOwnerID();

            creep.SetControllableByPlayer(id!, true);
            // creep.SetOwner(undefined);
            // creep.SetTeam(DotaTeam.BADGUYS);
            // creep.Hold();
            // creep.AddNewModifier(creep, undefined,'modifier_dominated', undefined)
            const blink = creep.FindAbilityByName("queenofpain_blink");
            print('has bl?', blink);
            blink!.SetLevel(1);
            // creep.SetAbilityByIndex(blink!, 1)
            creep.AddNewModifier(creep, undefined, "modifierQueenOfPainBlinkAI", {})

            dummyAIHeroes.add(creep.entindex());

            print('spawning >>>>')

            // creep.SetForwardVector(directionVector as Vector);
        }

        spawnCb();
    }
  }

  private OnNpcSpawned(event: NpcSpawnedEvent) {
    const unit = EntIndexToHScript(event.entindex) as CDOTA_BaseNPC; // Cast to npc since this is the 'npc_spawned' event

    // print('NPC SPAWNED >>>', unit.GetUnitName())
    if (unit.IsRealHero()) {
        // this is way better
        // const remnantAb = unit.GetAbilityByIndex(0)
        // unit.SetDayTimeVisionRange(2000)
        // unit.SetNightTimeVisionRange(2000)

        // unit.AddExperience(3000, 0, false, false)

        // print(' >>>', unit.GetAbilityByIndex(3))
        // const ab = unit.GetAbilityByIndex(4);
        // ab?.SetOverrideCastPoint(1)
        // ab?.SetLevel(1)
        // unit.SetAbilityByIndex(unit.GetAbilityByIndex(0)!, 0)


        // if (remnantAb) unit.UpgradeAbility(remnantAb)
    }
  }

  private OnAbilityUsed({PlayerID, abilityname}: DotaPlayerUsedAbilityEvent) {
    const player = PlayerResource.GetPlayer(PlayerID)
    const ability = player?.GetAssignedHero().FindAbilityByName(abilityname);
  }

  private OnEntityHurt(hurtEvent: EntityHurtEvent) {
    // const attacker = EntIndexToHScript(hurtEvent.entindex_attacker);
    const victim = EntIndexToHScript(hurtEvent.entindex_killed);
    const ability = hurtEvent.entindex_inflictor !== null
        ? EntIndexToHScript(hurtEvent.entindex_inflictor) as CDOTABaseAbility
        : null;
  }
}