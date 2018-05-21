import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";
import * as Handlebars from "handlebars/runtime";

import {ComponentInterface, ComponentManager} from "@plugins/ComponentWidget/asset/component";

import * as promotionTemplate from "./handlebars/promotion.handlebars";

import Dropdown from "@app/assets/script/components/dropdown";

import {Router} from "@plugins/ComponentWidget/asset/router";

/**
 *
 */
export class PromotionsComponent implements ComponentInterface {
    private promotions;

    constructor() {
        Handlebars.registerHelper("equals", function(value, compare, options) {
            if (value === compare) {
                return options.fn(this);
            } else {
                return options.inverse(this);
            }
        });
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
            element.querySelector(".promotions-body").innerHTML =
                promotionTemplate({promotions: response[productFilter]});
        });

    }

    private activateDropdown() {
        const dropdown = new Dropdown();
        dropdown.init(".dropdown-trigger", 2, true, false, false);
    }

    private doRequest(callback) {
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
        } else {
            callback(this.promotions);
        }
    }

    private listenChangeDropdown(element) {
        ComponentManager.subscribe("click", (event, src) => {
            if (utility.hasClass(src, "product-link")) {
                event.preventDefault();
                const prevFilter = element.querySelector(".active-filter").getAttribute("data-current-filter");
                const prevFilterEl = element.querySelector(".filter-" + prevFilter);

                // remove active previous
                utility.removeClass(utility.findParent(prevFilterEl, "li"), "active");

                // set new active filter
                utility.addClass(utility.findParent(src, "li"), "active");
                element.querySelector(".current-filter").innerHTML =
                    src.getAttribute("data-product-filter-name");
                element.querySelector(".active-filter")
               .setAttribute("data-current-filter", src.getAttribute("data-product-filter-id"));

                this.doRequest((response) => {
                    const productFilter = src.getAttribute("data-product-filter-id");

                    element.querySelector(".promotions-body").innerHTML =
                        promotionTemplate({promotions: response[productFilter]});
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
            element.querySelector(".current-filter").innerHTML =
                currentFilter.getAttribute("data-product-filter-name");
            element.querySelector(".active-filter")
               .setAttribute("data-current-filter", currentFilter.getAttribute("data-product-filter-id"));
        });
    }
}
