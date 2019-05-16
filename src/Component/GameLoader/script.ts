import * as utility from "@core/assets/js/components/utility";

import {GameLauncher} from "@app/src/Module/GameIntegration/scripts/game-launcher";

import {ComponentInterface, ComponentManager} from "@plugins/ComponentWidget/asset/component";

import {Router, RouterClass} from "@plugins/ComponentWidget/asset/router";
import { ProviderDrawer } from "../Main/Lobby/LiveDealerLobby/scripts/provider-drawer";

/**
 *
 */
export class GameLoaderComponent implements ComponentInterface {
    onLoad(element: HTMLElement, attachments: {}) {
        this.launchGame();
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.launchGame();
    }

    /**
     * Launch game using game launcher
     */
    private launchGame() {
        const params = utility.getParameters(window.location.href);

        GameLauncher.launch(params.provider, params);
    }
}
