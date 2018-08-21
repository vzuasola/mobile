import * as utility from "@core/assets/js/components/utility";

import * as xhr from "@core/assets/js/vendor/reqwest";

import * as categoriesTemplate from "./handlebars/categories.handlebars";

import {ComponentManager, ComponentInterface} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@core/src/Plugins/ComponentWidget/asset/router";

import {Loader} from "@app/assets/script/components/loader";

/**
 *
 */
export class GamesLobbyComponent implements ComponentInterface {
    private element: HTMLElement;

    onLoad(element: HTMLElement, attachments: {authenticated: boolean}) {
        this.element = element;
        this.generateLobby();
    }

    onReload(element: HTMLElement, attachments: {authenticated: boolean}) {
        this.element = element;
        this.generateLobby();
    }

    private generateLobby() {
        xhr({
            url: Router.generateRoute("games_lobby", "lobby"),
            type: "json",
        }).then((response) => {
            console.log(response);
            this.setCategories(response.categories);
        }).fail((error, message) => {
            console.log(error);
        });
    }

    private setCategories(response) {
        const template = categoriesTemplate({
            categories: response,
        });
        const categoriesEl = this.element.querySelector("#game-categories");
        if (categoriesEl) {
            categoriesEl.innerHTML = template;
        }
    }
}
