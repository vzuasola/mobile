import {ComponentManager, ComponentInterface} from "@plugins/ComponentWidget/asset/component";
import {Router, RouterClass} from "@core/src/Plugins/ComponentWidget/asset/router";
import * as Handlebars from "handlebars/runtime";
import * as gameTemplate from "./handlebars/games.handlebars";
import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";
/**
 *
 */
export class LiveDealerLobbyComponent implements ComponentInterface {
    private groupedGames: any;
    private lobbyTabs: any = ["providers", "featured"];
    private element;

    onLoad(element: HTMLElement, attachments: {
            authenticated: boolean,
            product: any[],
        }) {
        this.element = element;
        this.doGetLobbyData(() => {
            this.setLobby();
        });
        this.listenHashChange();
    }

    onReload(element: HTMLElement, attachments: {
            authenticated: boolean,
            product: any[],
        }) {
        this.element = element;
    }

    /**
     * Request games list from cms
     */
    private doGetLobbyData(callback) {
        xhr({
            url: Router.generateRoute("live_dealer_lobby", "lobby"),
            type: "json",
        }).then((response) => {
            const groupedGames = this.groupGamesByTab(response);
            this.groupedGames = this.sortGamesByTab(groupedGames);
            console.log(this.groupedGames);
            console.log(this.groupedGames);
            if (callback) {
                callback();
            }
        }).fail((error, message) => {
            console.log(error);
        });
    }

    /**
     * Group games by lobby tab
     */
    private groupGamesByTab(games) {
        const groupedGames: any = [];
        for (const gameId in games) {
            if (games.hasOwnProperty(gameId)) {
                const game = games[gameId];
                if (!groupedGames.hasOwnProperty(game.lobby_tab)
                ) {
                    groupedGames[game.lobby_tab] = [];
                }

                if (typeof  groupedGames[game.lobby_tab] !== "undefined"
                ) {
                    groupedGames[game.lobby_tab].push(game);
                }
            }
        }

        return groupedGames;
    }

    /**
     * Sorts game thumbnails by sort weight
     */
    private sortGamesByTab(groupedGames) {
        const sortedGames: any = [];
        for (const tab in groupedGames) {
            if (groupedGames.hasOwnProperty(tab)) {
                let categoryGames = groupedGames[tab];
                categoryGames = categoryGames.sort((a, b) => {
                    return a.sort_weight - b.sort_weight;
                });
                sortedGames[tab] = categoryGames;
            }
        }

        return sortedGames;
    }

    /**
     * Initialized games lobby
     */
    private generateLobby(callback) {
        if (!this.groupedGames) {
            this.doGetLobbyData(callback);
        } else {
            this.setLobby();
        }
    }

    /**
     * Populate lobby with the response from cms
     */
    private setLobby() {
        this.populateGames(this.getActiveTab());
        this.toggleTabState();
    }

    /**
     * Gets current active tab from url, if none is found, use first tab as default.
     */
    private getActiveTab() {
        const hash = utility.getHash(window.location.href);

        if (this.groupedGames.hasOwnProperty(hash) && this.groupedGames[hash].length > 0) {
            return hash;
        }

        return this.lobbyTabs[0];
    }

    /**
     * Populate game thumbnails
     */
    private populateGames(activeTab) {
        const gamesEl = this.element.querySelector("#game-container");
        const template = gameTemplate({
            games: this.groupedGames[activeTab],
        });

        if (gamesEl) {
            gamesEl.innerHTML = template;
        }
    }

    /**
     * Toggles lobby tab state to active/inactive
     */
    private toggleTabState() {
        const tabsEl =  this.element.querySelector("#search-filter-transfer-container");
        const prevActiveTab = tabsEl.querySelector(".sft-list-menu a.active");
        const activeTab = this.element.querySelector(".tab-" + this.getActiveTab());

        if (prevActiveTab) {
            utility.removeClass(prevActiveTab, "active");
        }

        if (activeTab) {
            utility.addClass(activeTab, "active");
        }
    }

    /**
     * Event listener for url hash change
     */
    private listenHashChange() {
        utility.listen(window, "hashchange", (event, src: any) => {
            this.setLobby();
        });
    }
}
