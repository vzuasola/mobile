declare var navigator: any;

import * as utility from "@core/assets/js/components/utility";

import {GameLauncher} from "@app/src/Module/GameIntegration/scripts/game-launcher";
import {ComponentManager, ComponentInterface} from "@plugins/ComponentWidget/asset/component";

import {Loader} from "@app/assets/script/components/loader";
import {GamesSearch} from "./scripts/games-search";
import {GamesFilter} from "@app/assets/script/components/games-filter";
import {VirtualsPreference} from "./scripts/virtuals-preference";

/**
 *
 */
export class VirtualsLobbyComponent implements ComponentInterface {
    private element: HTMLElement;
    private attachments: any;
    private response: any;
    private isLogin: boolean;
    private gameLauncher;
    private gamesSearch: GamesSearch;
    private gamesFilter: GamesFilter;
    private virtualsPreference: VirtualsPreference;
    private product: any[];
    private loader: Loader;
    private lobbyProducts: any[] = ["mobile-virtuals", "mobile-virtuals-gold"];

    constructor() {
        this.loader = new Loader(document.body, true);
        this.gameLauncher = GameLauncher;
        this.gamesSearch = new GamesSearch();
        this.gamesFilter = new GamesFilter();
        this.virtualsPreference = new VirtualsPreference();
    }

    onLoad(element: HTMLElement, attachments: {
        authenticated: boolean,
        title_weight: number,
        keywords_weight: 0,
        search_no_result_msg: string,
        filter_no_result_msg: string,
        search_blurb: string,
        msg_recommended_available: string,
        msg_no_recommended: string,
        product: any[],
        infinite_scroll: boolean,
    }) {
        this.response = null;
        this.element = element;
        this.attachments = attachments;
        this.isLogin = attachments.authenticated;
        this.product = attachments.product;
        this.lobby();
    }

    onReload(element: HTMLElement, attachments: {
        authenticated: boolean,
        title_weight: number,
        keywords_weight: 0,
        search_no_result_msg: string,
        filter_no_result_msg: string,
        search_blurb: string,
        msg_recommended_available: string,
        msg_no_recommended: string,
        product: any[],
        infinite_scroll: boolean,
    }) {
        this.isLogin = attachments.authenticated;
    }

    private lobby() {
        this.setLobby();
    }

    /**
     * Populate lobby with the set response
     */
    private setLobby(key?: string) {
        alert("Virtuals Initial Script");
        this.loader.hide();
    }

}
