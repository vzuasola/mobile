import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";

import {ComponentInterface, ComponentManager} from "@plugins/ComponentWidget/asset/component";

import * as promotionTemplate from "./handlebars/promotion.handlebars";

import * as productFeatured from "./handlebars/svg/product-featured.handlebars";
import * as productArcade from "./handlebars/svg/product-arcade.handlebars";
import * as productCasinoGold from "./handlebars/svg/product-casino-gold.handlebars";
import * as productCasino from "./handlebars/svg/product-casino.handlebars";
import * as productDafasports from "./handlebars/svg/product-dafasports.handlebars";
import * as productExchange from "./handlebars/svg/product-exchange.handlebars";
import * as productFishHunter from "./handlebars/svg/product-fish-hunter.handlebars";
import * as productGames from "./handlebars/svg/product-games.handlebars";
import * as productKeno from "./handlebars/svg/product-keno.handlebars";
import * as productLiveDealer from "./handlebars/svg/product-live-dealer.handlebars";
import * as productLiveChat from "./handlebars/svg/product-livechat.handlebars";
import * as productLottery from "./handlebars/svg/product-lottery.handlebars";
import * as productOWSports from "./handlebars/svg/product-owsports.handlebars";
import * as productPoker from "./handlebars/svg/product-poker.handlebars";
import * as productPromotions from "./handlebars/svg/product-promotions.handlebars";
import * as productVirtuals from "./handlebars/svg/product-virtuals.handlebars";

import Dropdown from "@app/assets/script/components/dropdown";

import {Router} from "@plugins/ComponentWidget/asset/router";

/**
 *
 */
export class PromotionsComponent implements ComponentInterface {
    private promotions;
    private productIcons;

    constructor() {
        this.productIcons = {
            featured: productFeatured(),
            arcade: productArcade(),
            casino: productCasino(),
        };
    }

    onLoad(element: HTMLElement, attachments: {}) {
        this.filterProductCategory(element);
        this.init(element);
        this.listenChangeDropdown(element);
        this.activateDropdown();
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.filterProductCategory(element);
        this.init(element);
        this.activateDropdown();

    }

    init(element) {
        this.doRequest((response) => {
            const productFilter = element.querySelector(".active-filter").getAttribute("data-current-filter");
            console.log(this.productIcons);
            console.log(response[productFilter]);
            element.querySelector(".promotions-body").innerHTML =
                promotionTemplate({ promotions: response[productFilter], productIcons: this.productIcons });
        });

    }

    private activateDropdown() {
        const dropdown = new Dropdown();
        dropdown.init();
    }

    private doRequest(callback) {
        console.log(this.promotions);
        if (!this.promotions) {
            xhr({
                url: Router.generateRoute("promotions", "list"),
                type: "json",
            }).then((response) => {
                this.promotions = response;

                callback(response);
            }).fail((error, message) => {
                // do something
            });
        }
    }

    private listenChangeDropdown(element) {
        ComponentManager.subscribe("click", (event, src) => {
            if (utility.hasClass(src, "product-link")) {
                event.preventDefault();
                utility.addClass(utility.findParent(src, "li"), "active");
                this.doRequest((response) => {
                    console.log(response);
                    const productFilter = src.getAttribute("data-product-filter-id");
                    console.log(productFilter);

                    element.querySelector(".promotions-body").innerHTML =
                        promotionTemplate({promotions: response[productFilter]});
                    console.log("change");
                });
            }
        });

    }

    private filterProductCategory(element) {
        this.doRequest((response) => {
            const categories = Object.keys(response);

            for (const productCategoryEl of element.querySelectorAll(".product-link")) {
                // remove category filters that don't have promotion
                if (categories.indexOf(productCategoryEl.getAttribute("data-product-filter-id")) < 0) {
                    const disabledFilter = utility.findParent(productCategoryEl, "li");
                    disabledFilter.remove();
                }
            }

            // set active filter
            const currentFilter = element.querySelectorAll(".product-link")[0];
            utility.addClass(utility.findParent(currentFilter, "li"), "active");
            element.querySelector(".current-filter").innerHTML = currentFilter.getAttribute("data-product-filter-name");
            element.querySelector(".active-filter")
               .setAttribute("data-current-filter", currentFilter.getAttribute("data-product-filter-id"));
        });
    }
}
