import { randomCirclePosition } from "./utils"
import { actions as remStateActions } from './reducers/remnantReducer'

const REMNANT_HP_THRESHOLD = 65;
const getPlayer =  () => PlayerResource.GetPlayer(0);
const getPlayerHero = () => getPlayer()?.GetAssignedHero();

function selfDestructTime(creep: CDOTA_BaseNPC) {
    Timers.CreateTimer(2, () => {
        if (creep.IsNull()) return

        const forceKill = () => {
            if (creep.GetHealth() === REMNANT_HP_THRESHOLD) {
                const player = getPlayerHero();
                player?.SetMana(player?.GetMana() - 10);
            }

            creep.ForceKill(true)
        }

        return creep.IsIdle() ? forceKill() : selfDestructTime(creep)
    })
}

export class RemnantTraining {
  constructor() {
    this.onInit()
  }

  private onInit() {
    this.subscribe()

    // show panorama panel
    CustomGameEventManager.Send_ServerToPlayer(getPlayer()!, 'remnant_training_started', {score: 0} as never);
  }

  private subscribe() {
    // Register event listeners for dota engine events
    ListenToGameEvent("npc_spawned", event => this.OnNpcSpawned(event), undefined);
    ListenToGameEvent("dota_player_used_ability", event => this.OnAbilityUsed(event), undefined);
    ListenToGameEvent("entity_hurt", event => this.OnEntityHurt(event), undefined);

    CustomGameEventManager.RegisterListener("ui_restart_remnant", () => {
        const hero = getPlayerHero();

        if (!hero) return;

        this.start(hero);
    });
  }

  private unSubscribe() {
    // StopListeningToGameEvent
  }

  public start(hero: CDOTA_BaseNPC_Hero) {
    // preconfigure
    Entities.FindAllByName('npc_dota_creep_lane').forEach(ent => ent.RemoveSelf());
    remStateActions.reset();
    remStateActions.start();
    hero.SetMana(hero.GetMaxMana());

    interface Opt {
        creepSpeed?: number;
        creepHp?: number;
        creepType?: string;
        incSpeed?: boolean;
        modifiers?: string[];
    }

    const creepCrowdConfig: Opt = {
        creepSpeed: 150,
        creepType: 'npc_dota_creep_goodguys_melee',
        modifiers: ['modifier_phased']
    };

    const creepTargetConfig: Opt = {
        creepHp: REMNANT_HP_THRESHOLD,
        creepSpeed: 200,
        incSpeed: true,
        modifiers: ['modifier_phased']
    };

    const spawnWave = ({crowdCount, targetCount, targetSpeed}: any) => {
        for (let i = 0; i < crowdCount; i++) {
            Timers.CreateTimer((i * .2) + .1, () => this.spawnCreepOutward()(hero, {
                ...creepCrowdConfig,
                creepSpeed: targetSpeed / 2
            }));
        }

        for (let i = 0; i < targetCount; i++) {
            Timers.CreateTimer((i * 1.5) + 1, () => this.spawnCreepOutward()(hero, {
                ...creepTargetConfig,
                creepSpeed: targetSpeed
            }));
        }
    }

    const mainLoop = () => {
        const limit = 30;
        let timer = 1;

        const timerId = Timers.CreateTimer('remnant_waves', {
            endTime: 1,
            callback: () => {
                print('running timerId >', timerId)

                spawnWave({
                    crowdCount: 3 + Math.floor(timer/6),
                    targetCount: 2 + Math.floor(timer/15),
                    targetSpeed: 220 + Math.floor(timer/6) * 50
                });

                timer++;

                if (timer >= limit) {
                    print('limit finish >', timerId);
                    Timers.CreateTimer(13, this.FinishRemnantTraining);
                    return;
                }

                return 6;
            }
        });
    }

    mainLoop();
  }

  private FinishRemnantTraining() {
    print('FinishRemnantTraining >>>', !remStateActions.isRunning());

    if (!remStateActions.isRunning()) return;

    remStateActions.stop();
    print('removing timers >>>');
    Timers.RemoveTimer('remnant_waves');
    CustomGameEventManager.Send_ServerToPlayer(getPlayer()!, 'remnant_training_finished', {
        score: remStateActions.getScore()
    });
  }

  public spawnCreep(spawnVector: Vector, opt?: Record<any, any>) {
    const creep = CreateUnitByName(
        opt?.creepType || 'npc_dota_creep_badguys_melee',
        spawnVector,
        true,
        undefined,
        undefined,
        DotaTeam.BADGUYS
    );

    creep.SetAttackCapability(0)
    creep.SetMoveCapability(1)
    creep.SetBaseHealthRegen(0)
    creep.SetDeathXP(0)

    if (Array.isArray(opt?.modifiers)) {
        opt.modifiers.forEach((modifier: string) =>
            creep.AddNewModifier(undefined, undefined, modifier, undefined));
    }

    if (opt?.creepHp) creep.SetHealth(opt.creepHp)
    if (opt?.creepSpeed) creep.SetBaseMoveSpeed(opt.creepSpeed)

    return creep;
  }

  public spawnCreepInvard() {
    return (hero: CDOTA_BaseNPC_Hero, opt = {}) => {
        const spawnVector = randomCirclePosition(RandomInt(200, 300), hero);
        const vectorToHero = hero.GetOrigin() - spawnVector as Vector;
        
        const spawnCb = () => {
            const creep = this.spawnCreep(spawnVector, opt);
            const directionVector = vectorToHero * -1;

            creep.SetForwardVector(directionVector as Vector);

            Timers.CreateTimer(.2, () => {
                creep.MoveToPosition((directionVector * 4) + spawnVector as Vector)
                
                selfDestructTime(creep);
            })
            
        }

        Timers.CreateTimer(0.3, spawnCb)
    }
  }

  public spawnCreepOutward() {
    return (hero: CDOTA_BaseNPC_Hero, opt = {}) => {
        const spawnVector = randomCirclePosition(1200, hero);
        const vectorToHero = hero.GetOrigin() - spawnVector as Vector;
        
        const spawnCb = () => {
            const creep = this.spawnCreep(spawnVector, opt);
            const directionVector = vectorToHero;

            const offset = randomCirclePosition(RandomInt(200, 900), hero) - spawnVector;
            const withOffset = vectorToHero + offset as Vector;

            creep.SetForwardVector(directionVector as Vector);

            Timers.CreateTimer(.2, () => {
                if (creep.IsNull()) return;

                creep.MoveToPosition((withOffset * 3) + spawnVector as Vector);

                selfDestructTime(creep);
            })
            
        }

        Timers.CreateTimer(0.3, spawnCb)
    }
  }

  private OnNpcSpawned(event: NpcSpawnedEvent) {
    const unit = EntIndexToHScript(event.entindex) as CDOTA_BaseNPC; // Cast to npc since this is the 'npc_spawned' event

    // print('NPC SPAWNED >>>', unit.GetUnitName())
    if (unit.IsRealHero()) {
        // this is way better
        const remnantAb = unit.GetAbilityByIndex(0)
        unit.SetDayTimeVisionRange(1000)
        unit.SetNightTimeVisionRange(1000)

        if (remnantAb) unit.UpgradeAbility(remnantAb)
    }

    if (unit.GetUnitName() === 'npc_dota_aether_remnant') {
        Timers.CreateTimer(0.8, () => {
            if (!unit.IsNull()) unit.ForceKill(true)
        })
    }
  }

  private OnAbilityUsed({PlayerID, abilityname}: DotaPlayerUsedAbilityEvent) {
    const player = PlayerResource.GetPlayer(PlayerID)
    const ability = player?.GetAssignedHero().FindAbilityByName(abilityname);

    // allow different abilities in future
    if (abilityname !== 'void_spirit_aether_remnant') return;

    const remnantHandler = () => {
        ability?.EndCooldown();

        Timers.RemoveTimer('remnantOOMcheck');
        Timers.CreateTimer('remnantOOMcheck', {
            endTime: 3,
            callback: () => {
                const player = getPlayerHero();

                if (!player) return;

                if (player.GetMana() < 75) this.FinishRemnantTraining();
            }
        });
    }

    remnantHandler();
  }

  private OnEntityHurt(hurtEvent: EntityHurtEvent) {
    // const attacker = EntIndexToHScript(hurtEvent.entindex_attacker);
    const victim = EntIndexToHScript(hurtEvent.entindex_killed);
    const ability = hurtEvent.entindex_inflictor !== null
        ? EntIndexToHScript(hurtEvent.entindex_inflictor) as CDOTABaseAbility
        : null;

    // void_spirit_aether_remnant
    // npc_dota_creep_lane

    if (ability?.GetName() === 'void_spirit_aether_remnant') {
        if (victim?.GetName() === 'npc_dota_creep_lane' && victim?.GetHealth() === 0) {
            remStateActions.increment()
            ability?.RefundManaCost()
        }
    }

    // GetUnitName
    // GetHealth
  }
}