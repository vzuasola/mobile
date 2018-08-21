import * as utility from "@core/assets/js/components/utility";

import * as xhr from "@core/assets/js/vendor/reqwest";

import * as categoriesTemplate from "./handlebars/categories.handlebars";
import * as gameTemplate from "./handlebars/games.handlebars";

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
            const key = response.categories[0].field_games_alias;
            this.setCategories(response.categories);
            this.setGames(response.games[key]);
        }).fail((error, message) => {
            console.log(error);
        });
    }

    private setCategories(data) {
        const template = categoriesTemplate({
            categories: data,
        });

        const categoriesEl = this.element.querySelector("#game-categories");

        if (categoriesEl) {
            categoriesEl.innerHTML = template;
        }
    }

    private setGames(data) {
        const template = gameTemplate({
            games: data,
        });

        const gamesEl = this.element.querySelector("#game-container");

        if (gamesEl) {
            gamesEl.innerHTML = template;
        }
    }
}
