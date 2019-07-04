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

    constructor() {
        this.storage = new Storage();
    }

    onLoad(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.getTopLeaderboard();
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.getTopLeaderboard();
    }

    private getTopLeaderboard() {
        xhr({
            url: Router.generateRoute("marketing_space", "marketingSpace"),
            type: "json",
        }).then((response) => {
            this.topLeadeboardData = response;
            this.generateTopleaderboardMarkup(this.topLeadeboardData);
        });
    }

    /**
     * Set the Marketing Space in the template
     *
     */
    private generateTopleaderboardMarkup(data) {
        const topLeadeboard: HTMLElement = this.element.querySelector("#marketing-space");
        const template = topLeaderboardTemplate({
            topLeadeboardData: data,
        });

        topLeadeboard.innerHTML = template;
        this.activateMarketingSpace(this.element);
        this.bindDismissButton(this.element);

        this.getUnreadMarketingSpace(this.element);
    }

    /**
     * Show Marketing Space
     */
    private activateMarketingSpace(element) {
        let readItems = [];
        let activeItem: any = element.querySelector(".marketing-space-top-leaderboard");
        if (activeItem) {
            readItems = this.getMarketingSpaceItems();
            activeItem = activeItem.getAttribute("data-top-leaderboard-id");

            if (readItems.length > 0 && readItems.indexOf(activeItem) > -1) {
                utility.addClass(element.querySelector(".marketing-space-top-leaderboard"), "hidden");
            } else {
                utility.removeClass(element.querySelector(".marketing-space-top-leaderboard"), "hidden");
            }
        }
    }

    /**
     * Mark Marketing Space as read
     */
    private bindDismissButton(element) {
        let activeItem = element.querySelector(".marketing-space-top-leaderboard");

        if (activeItem) {
            utility.delegate(element, ".btn-dismiss", "click", (event, src) => {
                activeItem = activeItem.getAttribute("data-top-leaderboard-id");
                this.setMarketingSpaceItems(activeItem);
                ComponentManager.refreshComponent("marketing_space");
            }, true);
        }
    }

    /**
     * Get number of unread Marketing Space and update Marketing Space
     */
    private getUnreadMarketingSpace(element) {
        let MarketingSpacereadItems = [];
        let counter = 0;

        for (const item of element.querySelectorAll(".counterarketing-space-top-leaderboard")) {
            const activeItem = item.getAttribute("data-top-leaderboard-id");

            MarketingSpacereadItems = this.getMarketingSpaceItems();

            if (MarketingSpacereadItems.indexOf(activeItem) < 0) {
                counter++;
            }
        }
    }

    /**
     * Get all Read Items
     */
    private getMarketingSpaceItems() {
        let data = [];

        if (this.storage.get("MarketingSpaceReadItems")) {
            data = JSON.parse(this.storage.get("MarketingSpaceReadItems"));
        }

        return data;
    }

    /**
     * Mark Marketing Space as Read
     */
    private setMarketingSpaceItems(newItem) {
        let prevMarketingSpaceReadItems = [];

        prevMarketingSpaceReadItems = this.getMarketingSpaceItems();

        if (prevMarketingSpaceReadItems.indexOf(newItem) < 0) {
            prevMarketingSpaceReadItems.push(newItem);
            this.storage.set("MarketingSpaceReadItems", JSON.stringify(prevMarketingSpaceReadItems));
        }
    }
}
