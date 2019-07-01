import * as utility from "@core/assets/js/components/utility";
import * as Handlebars from "handlebars/runtime";

import * as xhr from "@core/assets/js/vendor/reqwest";

import * as topLeaderboardTemplate from "./handlebars/top-leaderboard.handlebars";

import { ComponentInterface, ComponentManager } from "@plugins/ComponentWidget/asset/component";
import { Router, RouterClass } from "@plugins/ComponentWidget/asset/router";

/**
 *
 */
export class MarketingSpaceComponent implements ComponentInterface {
    private element: HTMLElement;
    private topLeadeboardData: any;

    onLoad(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.getTopLeaderboard();
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.getTopLeaderboard();
    }

    private getTopLeaderboard() {
        const topleaderboard = ComponentManager.getAttribute("marketing-space");

        xhr({
            url: Router.generateRoute("marketing_space", "marketing-space"),
            type: "json",
            data: {
                topleaderboard,
            },
        }).then((response) => {
            this.topLeadeboardData = response;
            this.generateTopleaderboardMarkup(this.topLeadeboardData);
        });
    }

    /**
     * Set the download in the template
     *
     */
    private generateTopleaderboardMarkup(data) {
        const topLeadeboard: HTMLElement = this.element.querySelector("#marketing-space");
        const template = topLeaderboardTemplate({
            topLeadeboardData: data,
        });

        topLeadeboard.innerHTML = template;
    }
}
