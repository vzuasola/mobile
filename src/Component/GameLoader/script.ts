import * as utility from "@core/assets/js/components/utility";

import {GameLauncher} from "@app/src/Module/GameIntegration/scripts/game-launcher";

import {ComponentInterface, ComponentManager} from "@plugins/ComponentWidget/asset/component";

import {Router, RouterClass} from "@plugins/ComponentWidget/asset/router";
import { ProviderDrawer } from "../Main/Lobby/LiveDealerLobby/scripts/provider-drawer";

/**
 *
 */
export class GameLoaderComponent implements ComponentInterface {

    private element: HTMLElement;

    onLoad(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.launchGame();
        this.showMessage();
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.launchGame();
        this.showMessage();
    }

    /**
     * Launch game using game launcher
     */
    private launchGame() {
        const params = utility.getParameters(window.location.href);

        GameLauncher.launch(params.provider, params);
    }

    /**
     * Show message to the user after 5 secs
     */
    private showMessage() {
        setTimeout(() => {
            utility.removeClass(this.element.querySelector(".message"), "hidden");
            this.closeOnTimeout();
        }, 5 * 1000);
    }

    /**
     * Close self after 5 secs
     */
    private closeOnTimeout() {
        setTimeout(() => {
            window.close();
        }, 5 * 1000);
    }
}
