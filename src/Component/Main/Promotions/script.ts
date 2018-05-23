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
    private element;

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
        this.element = element;
        this.filterProductCategory();
        this.init();
        this.listenChangeDropdown();
        this.activateDropdown();
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.filterProductCategory();
        this.init();
        this.activateDropdown();

    }

    init() {
        this.doRequest((response) => {
            const productFilter = this.element.querySelector(".active-filter").getAttribute("data-current-filter");
            this.element.querySelector(".promotions-body").innerHTML =
                promotionTemplate({promotions: response[productFilter]});
        });

    }

    private activateDropdown() {
        const dropdown = new Dropdown({hideDropdownOnClick: true});
        dropdown.init();
    }

    private promotionLoader() {
        const wrapper = document.querySelector(".promotions-loader");

        if (wrapper) {
            const link = wrapper.querySelector(".promotions-body");
            const loader = wrapper.querySelector(".mobile-promotions-loader");

            utility.removeClass(link, "hidden");
            utility.addClass(loader, "hidden");
        }
    }

    private doRequest(callback) {
        if (!this.promotions) {
            xhr({
                url: Router.generateRoute("promotions", "promotions"),
                type: "json",
            }).then((response) => {
                this.promotionLoader();
                this.promotions = response;

                callback(response);
            }).fail((error, message) => {
                // do something
            });
        } else {
                this.promotionLoader();
                callback(this.promotions);
        }
    }

    private listenChangeDropdown() {
        ComponentManager.subscribe("click", (event, src) => {
            if (utility.hasClass(src, "product-link")) {
                const prevFilter = this.element.querySelector(".active-filter").getAttribute("data-current-filter");
                const prevFilterEl = this.element.querySelector(".filter-" + prevFilter);

                // remove active previous
                utility.removeClass(utility.findParent(prevFilterEl, "li"), "active");
                utility.removeClass(this.element.querySelector(".active-filter"), prevFilter);

                // set new active filter
                utility.addClass(utility.findParent(src, "li"), "active");
                this.element.querySelector(".current-filter").innerHTML =
                    src.getAttribute("data-product-filter-name");
                this.element.querySelector(".active-filter")
                    .setAttribute("data-current-filter", src.getAttribute("data-product-filter-id"));
                utility.addClass(this.element.querySelector(".active-filter"),
                    src.getAttribute("data-product-filter-id"));

                this.doRequest((response) => {
                    const productFilter = src.getAttribute("data-product-filter-id");
                    this.element.querySelector(".promotions-body").innerHTML =
                        promotionTemplate({promotions: response[productFilter]});
                });
            }
        });
    }

    private filterProductCategory() {
        this.doRequest((response) => {
            const categories = Object.keys(response);
            const activeCategories = [];

            for (const productCategoryEl of this.element.querySelectorAll(".product-link")) {
                // remove category filters that don't have promotion
                if (categories.indexOf(productCategoryEl.getAttribute("data-product-filter-id")) < 0) {
                    const disabledFilter = utility.findParent(productCategoryEl, "li");
                    disabledFilter.remove();
                }

                activeCategories.push(productCategoryEl.getAttribute("data-product-filter-id"));
            }

            // set active filter
            this.setInitialActiveFilter(this.element, activeCategories);
        });
    }

    private setInitialActiveFilter(element, activeCategories) {
        const hashParam = utility.getHash(window.location.href);
        let currentFilterId: string;
        let currentFilter: HTMLElement;

        if (hashParam && activeCategories.indexOf(hashParam) > 0) {
            currentFilterId = hashParam;
            currentFilter = element.querySelector(".filter-" + hashParam);
        } else {
            currentFilter = element.querySelectorAll(".product-link")[0];
            if (currentFilter) {
                currentFilterId = currentFilter.getAttribute("data-product-filter-id");
            }
        }
        utility.addClass(utility.findParent(currentFilter, "li"), "active");
        element.querySelector(".current-filter").innerHTML =
                    currentFilter.getAttribute("data-product-filter-name");
        element.querySelector(".active-filter")
            .setAttribute("data-current-filter", currentFilterId);
        utility.addClass(element.querySelector(".active-filter"),
             currentFilterId);

    }
}
