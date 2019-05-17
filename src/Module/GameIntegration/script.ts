import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";

import {ComponentManager, ModuleInterface} from "@plugins/ComponentWidget/asset/component";

import {GameLauncher} from "./scripts/game-launcher";
import {GameInterface} from "./scripts/game.interface";

import {PASModule} from "./PAS/script";

import {Router} from "@plugins/ComponentWidget/asset/router";

export class GameIntegrationModule implements ModuleInterface {
    private gameLauncher;

    constructor() {
        this.gameLauncher = GameLauncher;
    }

    onLoad(attachments: {}) {
        const pas: any = ComponentManager.getModuleInstance("pas_integration");
        const microGaming: any = ComponentManager.getModuleInstance("microgaming_integration");
        const voidbridge: any = ComponentManager.getModuleInstance("voidbridge_integration");
        const skywind: any = ComponentManager.getModuleInstance("skywind_integration");
        const solidgaming: any = ComponentManager.getModuleInstance("solidgaming_integration");
        const cq9: any = ComponentManager.getModuleInstance("cq9_integration");
        const flowGaming: any = ComponentManager.getModuleInstance("flowgaming_integration");
        const saGaming: any = ComponentManager.getModuleInstance("sagaming_integration");
        const pgSoft: any = ComponentManager.getModuleInstance("pgsoft_integration");
        const asiaGaming: any = ComponentManager.getModuleInstance("asiagaming_integration");
        const goldDeluxe: any = ComponentManager.getModuleInstance("gold_deluxe_integration");
        this.gameLauncher.setProvider("pas", pas);
        this.gameLauncher.setProvider("micro_gaming", microGaming);
        this.gameLauncher.setProvider("solid_gaming", solidgaming);
        this.gameLauncher.setProvider("cq9", cq9);
        this.gameLauncher.setProvider("voidbridge", voidbridge);
        this.gameLauncher.setProvider("skywind", skywind);
        this.gameLauncher.setProvider("flow_gaming", flowGaming);
        this.gameLauncher.setProvider("sa_gaming", saGaming);
        this.gameLauncher.setProvider("pg_soft", pgSoft);
        this.gameLauncher.setProvider("asia_gaming", asiaGaming);
        this.gameLauncher.setProvider("gold_deluxe", goldDeluxe);

        setTimeout(() => {
            this.gameLauncher.init();
        }, 20);
    }
}
