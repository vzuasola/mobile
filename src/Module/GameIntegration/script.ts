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
        this.gameLauncher.setProvider("pas", pas);
        this.gameLauncher.setProvider("micro_gaming", microGaming);
        this.gameLauncher.setProvider("voidbridge", voidbridge);
        this.gameLauncher.setProvider("skywind", skywind);

        setTimeout(() => {
            this.gameLauncher.init();
        }, 20);
    }
}
