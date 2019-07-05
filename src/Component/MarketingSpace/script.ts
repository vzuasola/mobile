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
    private activeTopLeaderboardLSKey = "ActiveTopLeaderboardID";
    private defaultActive: number = 0;

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
        const topLeadeboardEl: HTMLElement = this.element.querySelector("#marketing-space");
        const topLeaderboard: any = this.filterTopLeaderboard();
        if (topLeaderboard.hasOwnProperty("id")) {
            const template = topLeaderboardTemplate({
                topLeadeboardData: topLeaderboard,
            });

            topLeadeboardEl.innerHTML = template;
            this.bindDismissButton(this.element);
        }
    }

    private filterTopLeaderboard() {
        const unreadTopLeaderboards: any = this.getUnreadTopLeaderboard();
        // check if multiple top leaderboard
        if (unreadTopLeaderboards.length > 1) {
            const activeIndex = this.getActiveTopLeaderboardIndex();
            if (unreadTopLeaderboards.hasOwnProperty(activeIndex)) {
                let nextActiveIndex: number = activeIndex + 1;
                // check if the active top leaderboard id is the last item and reset to first index
                if (activeIndex === unreadTopLeaderboards.length - 1) {
                    nextActiveIndex = this.defaultActive;
                }

                this.setActiveTopLeaderboardIndex(nextActiveIndex);
                return unreadTopLeaderboards[activeIndex];
            }
        }

        return unreadTopLeaderboards.hasOwnProperty(this.defaultActive)
        ? unreadTopLeaderboards[this.defaultActive] : [];
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
                this.setActiveTopLeaderboardIndex(this.defaultActive);
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

    /**
     * Get all marked as Read Top Leaderboard Item
     */
    private getActiveTopLeaderboardIndex() {
        let activeLeaderboardIndex: number = this.defaultActive;

        if (this.storage.get(this.activeTopLeaderboardLSKey)) {
            const activeIndex = this.storage.get(this.activeTopLeaderboardLSKey);
            activeLeaderboardIndex = parseInt(activeIndex, 10);
        }

        return activeLeaderboardIndex;
    }

    /**
     * Mark Top Leaderboard Item as Read
     */
    private setActiveTopLeaderboardIndex(topLeaderboardIndex) {
        this.storage.set(this.activeTopLeaderboardLSKey, topLeaderboardIndex);
    }
}
