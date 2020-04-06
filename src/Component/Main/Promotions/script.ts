import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";
import * as Handlebars from "handlebars/runtime";

import {ComponentInterface, ComponentManager} from "@plugins/ComponentWidget/asset/component";

import * as promotionTemplate from "./handlebars/promotion.handlebars";
import * as promotionFilterTemplate from "./handlebars/promotion-filter.handlebars";

import Dropdown from "@app/assets/script/components/dropdown";

import {Router} from "@plugins/ComponentWidget/asset/router";
import SyncEvents from "@core/assets/js/components/utils/sync-events";

/**
 *
 */
export class PromotionsComponent implements ComponentInterface {
    private promotions;
    private archivePromotions;
    private element;
    private sync: SyncEvents = new SyncEvents();
    private language;

    constructor() {
        Handlebars.registerHelper("equals", function(value, compare, options) {
            if (value === compare) {
                return options.fn(this);
            }

            return options.inverse(this);
        });

        Handlebars.registerHelper("countdown", (endTime, countdownText, options) => {
            let elapsedStr: string = "";

            if (endTime) {
                const startTime =  new Date().getTime();
                const timeDiff = (new Date(endTime).getTime() - startTime) / 1000;

                if (timeDiff > 0) {
                    const elapsed = {
                        days: Math.floor(timeDiff / 86400),
                        hours: Math.floor(timeDiff / 3600 % 24),
                    };

                    if (elapsed.days > 0 || elapsed.hours > 0) {
                        elapsedStr = countdownText.replace("[days]", elapsed.days)
                            .replace("[hours]", elapsed.hours);
                    }
                }
            }

            return elapsedStr;
        });
    }

    onLoad(element: HTMLElement, attachments: {filterLabel: string, countdown: string}) {
        this.element = element;
        this.promotions = undefined;
        this.archivePromotions = undefined;
        this.init(attachments.filterLabel, attachments.countdown);
        this.listenChangeDropdown(attachments.countdown);
        this.listenClickArchiveBtn(attachments.countdown);
    }

    onReload(element: HTMLElement, attachments: {filterLabel: string, countdown: string}) {
        if (!this.element) {
            this.element = element;
            this.promotions = undefined;
            this.archivePromotions = undefined;

            this.init(attachments.filterLabel, attachments.countdown);
            this.listenChangeDropdown(attachments.countdown);
            this.listenClickArchiveBtn(attachments.countdown);
        }
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
            const promises = [];
            const promiseLatamLanguage = () => {
                return new Promise((promiseLatamResolve, promiseLatamReject) => {
                    this.language = ComponentManager.getAttribute("language");
                    if (this.language === "es") {
                        xhr({
                            url: Router.generateRoute("promotions", "getLatamLang"),
                            type: "json",
                        }).then((response) => {
                           this.language = response.language;
                           promiseLatamResolve();
                        });
                    } else {
                        promiseLatamResolve();
                    }
                });
            };
            promises.push(promiseLatamLanguage);
            const promisePromotions = () => {
                return new Promise((promisePromotionsResolve, promisePromotionsReject) => {
                    xhr({
                        url: Router.generateRoute("promotions", "promotions"),
                        type: "json",
                        data: {
                            language: this.language,
                        },
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

                    promisePromotionsResolve();
                });
            };
            promises.push(promisePromotions);
            this.sync.executeWithArgs(promises, []);
        } else {
            this.promotionLoader();
            callback(this.promotions);
        }
    }

    private doRequestArchive(callback, errorCallback?) {
        if (typeof this.archivePromotions === "undefined" ) {
            xhr({
                url: Router.generateRoute("promotions", "archive"),
                type: "json",
                data: {
                    language: this.language,
                },
            }).then((response) => {
                this.archivePromotions = response;
                callback(response);
            }).fail((error, message) => {
                if (errorCallback) {
                    errorCallback(error, message);
                }
            });
        } else {
            callback(this.archivePromotions);
        }
    }

    private listenClickArchiveBtn(countdownFormat) {
        utility.listen(this.element, "click", (event, src) => {
            const archiveContainer = this.element.querySelector(".promotions-archive");
            const archiveMsgContainer = this.element.querySelector(".promotions-archive-no-available");
            if (utility.hasClass(src, "btn-archive")) {
                if (utility.hasClass(archiveContainer, "hidden") &&
                    utility.hasClass(archiveMsgContainer, "hidden")
                ) {
                    this.doRequestArchive((response) => {
                        if (response && typeof response !== "undefined"
                            && response.promotions.length) {
                            this.resetError(
                                ".promotions-archive",
                                ".promotions-archive-no-available",
                            );
                            const template = promotionTemplate({
                                promotions: response.promotions,
                                countdownText: countdownFormat,
                            });

                            this.element.querySelector(".promotions-archive").innerHTML = template;
                            return;
                        } else {
                            this.handleError(
                                ".promotions-archive",
                                ".promotions-archive-no-available",
                            );
                        }
                    }, () => {
                        this.handleError(
                            ".promotions-archive",
                            ".promotions-archive-no-available",
                        );
                    });
                } else {
                    utility.addClass(archiveContainer, "hidden");
                    utility.addClass(archiveMsgContainer, "hidden");
                }
            }
        });
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

    private handleError(
        promoContainer = ".promotions-body",
        promoErrorContainer = ".promotions-no-available",
    ) {
        utility.addClass(this.element.querySelector(promoContainer), "hidden");
        utility.removeClass(this.element.querySelector(promoErrorContainer), "hidden");
    }

    private resetError(
        promoContainer = ".promotions-body",
        promoErrorContainer = ".promotions-no-available",
    ) {
        utility.removeClass(this.element.querySelector(promoContainer), "hidden");
        utility.addClass(this.element.querySelector(promoErrorContainer), "hidden");
    }
}
