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
    private response: any;

    onLoad(element: HTMLElement, attachments: {authenticated: boolean}) {
        this.element = element;
        this.generateLobby();
    }

    onReload(element: HTMLElement, attachments: {authenticated: boolean}) {
        this.element = element;
        this.generateLobby();
    }

    /**
     * Initialized games lobby
     */
    private generateLobby() {

        if (!this.response) {
            this.doRequest();
        } else {
            this.setLobby();
        }
    }

    /**
     * Request games lobby to games lobby component controller lobby method
     */
    private doRequest() {
        xhr({
            url: Router.generateRoute("games_lobby", "lobby"),
            type: "json",
        }).then((response) => {
            this.response = response;
            this.setLobby();
        }).fail((error, message) => {
            console.log(error);
        });
    }

    /**
     * Populate lobby with the set response
     */
    private setLobby() {
        let key = this.response.categories[0].field_games_alias;
        key = this.getActiveCategory(this.response.games, key);

        this.setCategories(this.response.categories);
        this.setGames(this.response.games[key]);
    }

    /**
     * Set the category in the template
     *
     */
    private setCategories(data) {
        const template = categoriesTemplate({
            categories: data,
        });

        const categoriesEl = this.element.querySelector("#game-categories");

        if (categoriesEl) {
            categoriesEl.innerHTML = template;
        }
    }

    /**
     * Get the hash in the url or the first returned category
     *
     */
    private getActiveCategory(gamesList, key) {
        const hash = utility.getHash(window.location.href);

        if (gamesList[hash]) {
            return hash;
        }

        return key;
    }

    /**
     * Set the games list in the template
     */
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
