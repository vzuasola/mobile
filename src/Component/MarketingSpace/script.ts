import * as utility from "@core/assets/js/components/utility";
import Storage from "@core/assets/js/components/utils/storage";

import * as xhr from "@core/assets/js/vendor/reqwest";

import * as topLeaderboardTemplate from "./handlebars/top-leaderboard.handlebars";

import { ComponentInterface, ComponentManager } from "@plugins/ComponentWidget/asset/component";
import { Router, RouterClass } from "@plugins/ComponentWidget/asset/router";

/**
 *
 */
export class MarketingSpaceComponent implements ComponentInterface {
    private storage: Storage;
    private element: HTMLElement;
    private topLeadeboardData: any;
    private topLeaderboardLSKey = "TopLeaderboardReadItems";

    constructor() {
        this.storage = new Storage();
    }

    onLoad(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.getTopLeaderboard();

        Router.on(RouterClass.afterNavigate, (event) => {
            this.getTopLeaderboard();
        });
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.getTopLeaderboard();
    }

    private getTopLeaderboard() {
        xhr({
            url: Router.generateRoute("marketing_space", "topLeaderboard"),
            method: "post",
            type: "json",
            data: {
                currentProduct: ComponentManager.getAttribute("product"),
            },
        }).then((response) => {
            this.topLeadeboardData = response.top_leaderboard;
            this.generateTopleaderboardMarkup();
        });
    }

    /**
     * Set the Top Leaderboard Item in the template
     *
     */
    private generateTopleaderboardMarkup() {
        let template = "";
        const topLeadeboardEl: HTMLElement = this.element.querySelector("#marketing-space");
        const unreadTopLeaderboards: any = this.getUnreadTopLeaderboard();
        const topLeaderboard = (unreadTopLeaderboards[0]) ? unreadTopLeaderboards[0] : [];
        if (topLeaderboard.hasOwnProperty("id")) {
            template = topLeaderboardTemplate({
                topLeadeboardData: topLeaderboard,
            });

            this.setReadTopLeaderboard("tl-" + topLeaderboard.id);
            this.bindDismissButton(this.element);
        }

        topLeadeboardEl.innerHTML = template;
    }

    /**
     * Mark active Top Leaderboard Item as read
     */
    private bindDismissButton(element) {
        const activeItem = element.querySelector(".marketing-space-top-leaderboard");

        if (activeItem) {
            utility.delegate(element, ".btn-dismiss", "click", (event, src) => {
                const topLeaderboardId = activeItem.getAttribute("data-top-leaderboard-id");
                this.setReadTopLeaderboard(topLeaderboardId);
                const topLeadeboardEl: HTMLElement = this.element.querySelector("#marketing-space");
                topLeadeboardEl.innerHTML = "";
            }, true);
        }
    }

    /**
     * Get all unread Top Leaderboard Items
     */
    private getUnreadTopLeaderboard() {
        let readTopLeaderboards = [];
        const unreadTopLeaderboards = [];
        for (const item of this.topLeadeboardData) {
            readTopLeaderboards = this.getReadTopLeaderboard();
            if (readTopLeaderboards.indexOf("tl-" + item.id) === -1) {
                unreadTopLeaderboards.push(item);
            }
        }

        return unreadTopLeaderboards;
    }

    /**
     * Get all marked as Read Top Leaderboard Item
     */
    private getReadTopLeaderboard() {
        let data = [];

        if (this.storage.get(this.topLeaderboardLSKey)) {
            data = JSON.parse(this.storage.get(this.topLeaderboardLSKey));
        }

        return data;
    }

    /**
     * Mark Top Leaderboard Item as Read
     */
    private setReadTopLeaderboard(topLeaderboardId) {
        let readTopLeaderboards = [];

        readTopLeaderboards = this.getReadTopLeaderboard();

        if (readTopLeaderboards.indexOf(topLeaderboardId) === -1) {
            readTopLeaderboards.push(topLeaderboardId);
            this.storage.set(this.topLeaderboardLSKey, JSON.stringify(readTopLeaderboards));
        }
    }
}
