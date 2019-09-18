import * as utility from "@core/assets/js/components/utility";
import EqualHeight from "@app/assets/script/components/equal-height";
import SyncEvents from "@core/assets/js/components/utils/sync-events";
import { ProviderDrawer } from "./provider-drawer";
import * as categoryTemplate from "../handlebars/categories.handlebars";

export class GamesCategory {
    private configs: any[];
    private isLogin: boolean;
    private categories: any[];
    private filteredCategories: any[];
    private filteredCategoriesAlias: any[] = [];
    private filteredCategoryObj: any[] = [];
    private games: any[];
    private sync: SyncEvents = new SyncEvents();

    constructor(attachments) {
        this.configs = attachments.configs;
        this.isLogin = attachments.isLogin;
    }

    render(callback?) {
        const activeCategory = this.getActiveCategory();
        const gameCategoriesEl = document.querySelector("#game-categories");
        const template = categoryTemplate({
            categories: this.getFilteredCategories(),
            configs: this.configs,
            active: activeCategory,
            isLogin: this.isLogin,
        });

        if (gameCategoriesEl) {
            const promises = [];
            gameCategoriesEl.innerHTML = template;
            const promiseCategory = () => {
                return new Promise((promiseCategoryResolve, promiseCategoryReject) => {
                    this.setActiveCategory(activeCategory);
                    this.moveProviders();
                    this.activateProviderDrawer();
                    promiseCategoryResolve();
                });
            };
            promises.push(promiseCategory);

            const equalizePromise = () => {
                return new Promise((equalizePromiseResolve, equalizePromiseReject) => {
                    this.equalizeProviderHeight();
                    equalizePromiseResolve();
                });
            };
            promises.push(equalizePromise);

            if (callback) {
                const callbackPromise = () => {
                    return new Promise((callbackPromiseResolve, callbackPromiseReject) => {
                        callback();
                        callbackPromiseResolve();
                    });
                };
                promises.push(callbackPromise);
            }

            this.sync.executeWithArgs(promises, []);
        }
    }

    /* Returns list of categories that have available games*/
    getFilteredCategories() {
        return this.filteredCategories;
    }

    /* Returns list of categories alias that have available games*/
    getFilteredCategoriesAlias() {
        return this.filteredCategoriesAlias;
    }

    /* Returns list of categories that have available games*/
    getUnFilteredCategories() {
        return this.categories;
    }

    /**
     * Gets current active category from url, if none is found, use first tab as default.
     */
    getActiveCategory() {
        const hash = utility.getHash(window.location.href);

        if (this.games.hasOwnProperty(hash)
            && this.games[hash].length > 0) {
            return hash;
        }

        return this.filteredCategories[0].field_games_alias;
    }

    /**
     * Set lobby categories
     */
    setCategories(categories, games) {
        this.categories = categories;
        this.games = games;
        this.filteredCategories = this.filterCategories(categories);
    }

    /**
     * Set active category
     */
    setActiveCategory(activeCategory) {
        const prevActiveEl = document.querySelector(".category-tab .active");
        if (prevActiveEl) {
            utility.removeClass(prevActiveEl, "active");
            utility.removeClass(utility.findParent(prevActiveEl, "li"), "active");
        }
        const categoryEl = document.querySelector(".category-" + activeCategory);
        if (categoryEl) {
            utility.addClass(categoryEl, "active");
            utility.addClass(utility.findParent(categoryEl, "li"), "active");
        }
        const isPortrait = window.innerHeight > window.innerWidth;
        const shownCategories: any = document.querySelectorAll(".game-providers-tab.main-tab a");
        let isActiveMore = true;
        let ctr: number = 0;
        for (const category of shownCategories) {
            if (category.getAttribute("data-category-filter-id") === activeCategory
                && ((isPortrait && ctr < 6) || (!isPortrait && ctr < 8))) {
                isActiveMore = false;
                break;
            }
            ctr++;
        }
        if (isActiveMore) {
            utility.addClass(document.querySelector(".game-providers-more"), "active");
        } else {
            utility.removeClass(document.querySelector(".game-providers-more"), "active");
        }
    }

    /**
     * Sort providers
     */
    sortProviders(providersSort) {
        const sortedProviders: any = [];
        for (const providerSort of providersSort) {
            if (this.filteredCategoryObj.hasOwnProperty(providerSort.field_games_alias)) {
                sortedProviders.push(this.filteredCategoryObj[providerSort.field_games_alias]);
            }
        }
        if (sortedProviders.length) {
            this.filteredCategories = sortedProviders;
        }
    }

    /**
     * Filter categories
     */
    private filterCategories(categories) {
        const filteredCategories: any[] = [];
        for (const category of categories) {
            /* tslint:disable:no-string-literal */
            if (category.hasOwnProperty("field_games_alias") &&
                this.games.hasOwnProperty(category["field_games_alias"]) &&
                this.games[category["field_games_alias"]].length) {
                    filteredCategories.push(category);
                    this.filteredCategoriesAlias.push(category["field_games_alias"]);
                    if (!this.filteredCategoryObj.hasOwnProperty(category["field_games_alias"])) {
                        this.filteredCategoryObj[category["field_games_alias"]] = [];
                    }

                    if (typeof this.filteredCategoryObj[category["field_games_alias"]] !== "undefined") {
                        this.filteredCategoryObj[category["field_games_alias"]] = category;
                    }
            }
            /* tslint:disable:no-string-literal */
        }
        return filteredCategories;
    }

    /**
     * Move game categories element to categories-container
     */
    private moveProviders() {
        const container = document.querySelector("#categories-container");
        const providersEl = document.querySelector("#game-categories");

        container.appendChild(providersEl);
    }

    /**
     * Enable Provider Drawer slide behavior
     */
    private activateProviderDrawer() {
        const providersEl: any = document.querySelector("#game-categories");
        const providerdrawer = new ProviderDrawer(providersEl);
        providerdrawer.activate();
    }

    /**
     * Make height of elements equal
     */
    private equalizeProviderHeight() {
        const equalProvider = new EqualHeight("#game-categories .provider-menu .game-providers-list a");
        equalProvider.init();
    }
}
