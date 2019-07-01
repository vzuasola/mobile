import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";

import {LazyLoader} from "./scripts/lazy-loader";
import {ComponentManager, ComponentInterface} from "@plugins/ComponentWidget/asset/component";
import {Router, RouterClass} from "@core/src/Plugins/ComponentWidget/asset/router";

/**
 *
 */
export class LotteryLobbyComponent implements ComponentInterface {
    private element: HTMLElement;
    private attachments: any;
    private response: any;
    private isLogin: boolean;
    private product: any[];
    private configs: any[];
    private games: any;
    private lazyLoader: LazyLoader;

    constructor() {
        this.lazyLoader = new LazyLoader();
    }

    onLoad(element: HTMLElement, attachments: {
            authenticated: boolean,
            product: any[],
            configs: any[],
        }) {

        this.attachments = attachments;
        this.element = element;
        this.isLogin = attachments.authenticated;
        this.product = attachments.product;
        this.configs = attachments.configs;
        this.doGetLobbyData(() => {
            this.setLobby();
        });
    }

    onReload(element: HTMLElement, attachments: {
            authenticated: boolean,
            product: any[],
            configs: any[],
        }) {

        this.attachments = attachments;
        this.element = element;
        this.isLogin = attachments.authenticated;
        this.product = attachments.product;
        this.configs = attachments.configs;
        this.doGetLobbyData(() => {
            this.setLobby();
        });
    }

    /**
     * Request games list from cms
     */
    private doGetLobbyData(callback) {
        xhr({
            url: Router.generateRoute("lottery_lobby", "lobby"),
            type: "json",
        }).then((response) => {
            this.games = response;
            if (callback) {
                callback();
            }
        }).fail((error, message) => {
            console.log(error);
        });
    }

    /**
     * Populate lobby with the response from cms
     */
    private setLobby() {
        this.populateGames();
    }

    /**
     * Populate game thumbnails
     */
    private populateGames() {
        /* tslint:disable:no-string-literal */
        /*const enableLazyLoad = (this.configs.hasOwnProperty("lobby_infinite_scroll")) ?
            this.configs["lobby_infinite_scroll"] : false;*/
        const enableLazyLoad = false;
        /* tslint:disable:no-string-literal */
        this.lazyLoader.init(
            this.games,
            this.isLogin,
            this.element.querySelector("#game-container"),
            enableLazyLoad,
        );
    }
}
