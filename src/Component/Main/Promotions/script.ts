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
            }

            return options.inverse(this);
        });
    }

    onLoad(element: HTMLElement, attachments: {}) {
        this.promotions = undefined;
        this.element = element;

        this.init();
        this.listenChangeDropdown();
        this.activateDropdown();
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.promotions = undefined;
        this.element = element;

        this.init();
        this.listenChangeDropdown();
        this.activateDropdown();

    }

    init() {
        this.doRequest((response) => {
            const filter: any = this.getDefaultFilter();

            this.setActiveFilter(filter);
            this.removeUnusedFilters(response);

            if (response) {
                if (typeof response[filter] !== "undefined") {
                    const template = promotionTemplate({
                        promotions: response[filter],
                    });

                    this.element.querySelector(".promotions-body").innerHTML = template;
                }
            }

            // error handling here
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

    private doRequest(callback, errorCallback?) {
        if (!this.promotions) {
            xhr({
                url: Router.generateRoute("promotions", "promotions"),
                type: "json",
            }).then((response) => {
                this.promotionLoader();
                this.promotions = response;

                callback(response);
            }).fail((error, message) => {
                if (errorCallback) {
                    errorCallback(error, message);
                }
            });
        } else {
            this.promotionLoader();
            callback(this.promotions);
        }
    }

    private listenChangeDropdown() {
        utility.listen(this.element, "click", (event, src) => {
            if (utility.hasClass(src, "product-link")) {
                const filter = src.getAttribute("data-product-filter-id");

                if (filter) {
                    this.doRequest((response) => {
                        this.setActiveFilter(filter);
                        // this.removeUnusedFilters(response);

                        if (response && typeof response[filter] !== "undefined") {
                            const productFilter = src.getAttribute("data-product-filter-id");
                            const template = promotionTemplate({
                                promotions: response[productFilter],
                            });

                            this.element.querySelector(".promotions-body").innerHTML = template;
                            return;
                        }

                        // error handling here
                    });
                }
            }
        });
    }

    private getDefaultFilter() {
        let result: any = false;

        const filters = this.getFilters();
        const hash = utility.getHash(window.location.href);

        if (hash && filters.indexOf(hash) !== -1) {
            result = hash;
        } else if (filters) {
            result = filters[0];
        }

        return result;
    }

    private getFilters() {
        const filters = [];

        for (const item of this.element.querySelectorAll(".product-link")) {
            filters.push(item.getAttribute("data-product-filter-id"));
        }

        return filters;
    }

    private setActiveFilter(filter: string) {
        if (this.getFilters().indexOf(filter) === -1) {
            filter = this.getDefaultFilter();
        }

        // remove active previous

        const prevFilter = this.element.querySelector(".active-filter").getAttribute("data-current-filter");
        const prevFilterEl = this.element.querySelector(".filter-" + prevFilter);

        if (prevFilterEl) {
            const filterList = utility.findParent(prevFilterEl, "li");

            if (filterList) {
                utility.removeClass(utility.findParent(prevFilterEl, "li"), "active");
            }

            utility.removeClass(this.element.querySelector(".active-filter"), prevFilter);
        }

        // set current filter element

        let currentFilterId: string;
        const currentFilter = this.element.querySelector(`[data-product-filter-id="${filter}"]`);

        if (currentFilter) {
            currentFilterId = currentFilter.getAttribute("data-product-filter-id");
        }

        utility.addClass(utility.findParent(currentFilter, "li"), "active");

        const currentFilterProduct = currentFilter.getAttribute("data-product-filter-name");
        this.element.querySelector(".current-filter").innerHTML = currentFilterProduct;

        this.element.querySelector(".active-filter").setAttribute(
            "data-current-filter",
            currentFilterId,
        );

        utility.addClass(
            this.element.querySelector(".active-filter"),
            currentFilterId,
        );
    }

    private removeUnusedFilters(response) {
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
    }
}
