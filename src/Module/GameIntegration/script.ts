import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";

import {ComponentManager, ModuleInterface} from "@plugins/ComponentWidget/asset/component";

import {GameLauncher} from "./scripts/game-launcher";
import {GameInterface} from "./scripts/game.interface";

import {PASModule} from "./PAS/script";

import {Router} from "@plugins/ComponentWidget/asset/router";

export class GameIntegrationModule implements ModuleInterface {
    private gameLauncher: GameLauncher;

    constructor() {
        this.gameLauncher = new GameLauncher();
    }
    onLoad(attachments: {}) {
        const pas: any = ComponentManager.getModuleInstance("pas_integration");
        console.log(pas);
        this.gameLauncher.setProvider("pas", pas);
        this.gameLauncher.init();
    }
}
