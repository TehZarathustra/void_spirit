import {reloadable} from "./lib/tstl-utils";
import {RemnantTraining} from "./RemnantTraining";
import {ComboTraining} from "./ComboTraining";

declare global {
    interface CDOTAGameRules {
        Addon: GameMode;
    }
}

@reloadable
export class GameMode {
    public static Precache(this: void, context: CScriptPrecacheContext) {
        // PrecacheResource("particle", "particles/units/heroes/hero_meepo/meepo_earthbind_projectile_fx.vpcf", context);
        PrecacheUnitByNameSync('npc_dota_hero_queenofpain', context)
        PrecacheUnitByNameSync('npc_dota_hero_voidspirit', context)
        // PrecacheResource("soundfile", "soundevents/game_sounds_heroes/game_sounds_meepo.vsndevts", context);
    }

    public static Activate(this: void) {
        // When the addon activates, create a new instance of this GameMode class.
        GameRules.Addon = new GameMode();
    }

    constructor() {
        this.configure();

        const OnUpdateSelectedUnit = () => {
            print('kekekes s>>>>> ')
        }

        // Register event listeners for dota engine events
        ListenToGameEvent("game_rules_state_change", () => this.OnStateChange(), undefined);
        // ListenToGameEvent( "dota_player_update_query_unit", () => OnUpdateSelectedUnit(), undefined);
        // ListenToGameEvent( "dota_player_update_selected_unit", () => OnUpdateSelectedUnit(), undefined);
    }

    private configure(): void {
        GameRules.SetCustomGameTeamMaxPlayers(DotaTeam.GOODGUYS, 3);
        GameRules.SetCustomGameTeamMaxPlayers(DotaTeam.BADGUYS, 3);
        // 
        GameRules.EnableCustomGameSetupAutoLaunch(true)
        GameRules.SetCustomGameSetupAutoLaunchDelay(0)
        GameRules.SetHeroSelectionTime(10)
        GameRules.SetStrategyTime(0)
        GameRules.SetPreGameTime(0)
        GameRules.SetShowcaseTime(0)
        GameRules.SetPostGameTime(5)

        const GameMode = GameRules.GetGameModeEntity()

        // hide time
        // GameMode.SetHUDVisible(0, false);
        // hide heroes bar
        GameMode.SetHUDVisible(1, false);
        // hide score board
        GameMode.SetHUDVisible(2, false);

        GameMode.SetCustomGameForceHero("void_spirit")
    }

    public OnStateChange(): void {
        const state = GameRules.State_Get();

        if (state === GameState.CUSTOM_GAME_SETUP) {
            // Automatically skip setup in tools
            if (IsInToolsMode()) {
                Timers.CreateTimer(3, () => {
                    GameRules.FinishCustomGameSetup();
                });
            }
        }

        // Start game once pregame hits
        if (state === GameState.PRE_GAME) Timers.CreateTimer(0.2, this.StartGame);
    }

    private StartGame(): void {
        print("Game starting!");
        
        // const remTraining = new RemnantTraining();
        const comboTraining = new ComboTraining();
    }

    public Reload() {
        print("Script reloaded!");
    }
}
