import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";
import * as Handlebars from "handlebars/runtime";

import {ComponentInterface, ComponentManager} from "@plugins/ComponentWidget/asset/component";

import * as promotionTemplate from "./handlebars/promotion.handlebars";
import * as promotionFilterTemplate from "./handlebars/promotion-filter.handlebars";

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

        Handlebars.registerHelper("countdown", (endTime, countdownText, options) => {
            if (endTime) {
                const startTime =  new Date().getTime();
                const timeDiff = (new Date(endTime).getTime() - startTime) / 1000;

                if (timeDiff >= 0) {
                    const elapsed = {
                        days: Math.floor(timeDiff / 86400),
                        hours: Math.floor(timeDiff / 3600 % 24),
                    };
                    const elapsedStr = countdownText.replace("[days]", elapsed.days)
                        .replace("[hours]", elapsed.hours);
                    return elapsedStr;
                }
            }

            return "";
        });
    }

    onLoad(element: HTMLElement, attachments: {filterLabel: string, countdown: string}) {
        this.element = element;
        this.promotions = undefined;
        console.log(attachments.countdown);
        this.init(attachments.filterLabel, attachments.countdown);
        this.listenChangeDropdown(attachments.countdown);
    }

    onReload(element: HTMLElement, attachments: {filterLabel: string, countdown: string}) {
        this.element = element;
        this.promotions = undefined;

        this.init(attachments.filterLabel, attachments.countdown);
        this.listenChangeDropdown(attachments.countdown);

    }

    init(filterLabel, countdownFormat) {
        this.doRequest((response) => {
            this.setFilters(response.filters, filterLabel);

            const filter: any = this.getDefaultFilter();

            this.setActiveFilter(filter);

            if (response) {
                if (typeof response.promotions[filter] !== "undefined") {
                    this.resetError();
                    const template = promotionTemplate({
                        promotions: response.promotions[filter],
                        countdownText: countdownFormat,
                    });

                    this.element.querySelector(".promotions-body").innerHTML = template;
                } else {
                    this.handleError();
                }
            }
        }, () => {
            this.handleError();
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
        if (typeof this.promotions === "undefined" ) {
            xhr({
                url: Router.generateRoute("promotions", "promotions"),
                type: "json",
            }).then((response) => {
                this.promotionLoader();
                this.promotions = response;

                callback(response);
            }).fail((error, message) => {
                if (errorCallback) {
                    this.promotionLoader();
                    errorCallback(error, message);
                }
            });
        } else {
            this.promotionLoader();
            callback(this.promotions);
        }
    }

    private listenChangeDropdown(countdownFormat) {
        utility.listen(this.element, "click", (event, src) => {
            if (utility.hasClass(src, "product-link")) {
                const filter = src.getAttribute("data-product-filter-id");

                if (filter) {
                    this.doRequest((response) => {
                        this.setActiveFilter(filter);

                        if (response && typeof response !== "undefined") {
                            this.resetError();
                            const template = promotionTemplate({
                                promotions: response.promotions[filter],
                                countdownText: countdownFormat,
                            });

                            this.element.querySelector(".promotions-body").innerHTML = template;
                            return;
                        } else {
                            this.handleError();
                        }
                    }, () => {
                        this.handleError();
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
    }

    private setFilters(response, filterLabel) {
        const template = promotionFilterTemplate({
            filters: response,
            filter_text: filterLabel,
        });
        const filterEl = this.element.querySelector("#promotion-filters");

        filterEl.innerHTML = template;

        this.activateDropdown();
    }

    private handleError() {
        utility.addClass(this.element.querySelector(".promotions-body"), "hidden");
        utility.removeClass(this.element.querySelector(".promotions-no-available"), "hidden");
    }

    private resetError() {
        utility.removeClass(this.element.querySelector(".promotions-body"), "hidden");
        utility.addClass(this.element.querySelector(".promotions-no-available"), "hidden");
    }
}
