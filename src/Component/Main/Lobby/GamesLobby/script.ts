import * as utility from "@core/assets/js/components/utility";

import * as xhr from "@core/assets/js/vendor/reqwest";

import {ComponentManager, ComponentInterface} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@core/src/Plugins/ComponentWidget/asset/router";

import {Loader} from "@app/assets/script/components/loader";

/**
 *
 */
export class GamesLobbyComponent implements ComponentInterface {
    onLoad(element: HTMLElement, attachments: {authenticated: boolean}) {
        this.generateLobby();
    }

    onReload(element: HTMLElement, attachments: {authenticated: boolean}) {
        this.generateLobby();
    }

    private generateLobby() {
        xhr({
            url: Router.generateRoute("games_lobby", "lobby"),
            type: "json",
        }).then((response) => {
            console.log(response);
        }).fail((error, message) => {
            console.log(error);
        });
    }
}
