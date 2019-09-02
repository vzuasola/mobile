import * as utility from "@core/assets/js/components/utility";
import EqualHeight from "@app/assets/script/components/equal-height";
import { ProviderDrawer } from "./provider-drawer";
import * as categoryTemplate from "../handlebars/categories.handlebars";

export class GamesCategory {
    private element: HTMLElement;
    private configs: any[];
    private isLogin: boolean;
    private categories: any[];
    private availableCategories: any[];
    private filteredCategories: any[];
    private games: any[];

    constructor(attachments, element) {
        this.configs = attachments.configs;
        this.isLogin = attachments.isLogin;
        this.element = element;
    }

    render() {
        const activeCategory = this.getActiveCategory();
        const gameCategoriesEl = document.querySelector("#game-categories");
        const template = categoryTemplate({
            categories: this.getFilteredCategories(),
            configs: this.configs,
            active: activeCategory,
            isLogin: this.isLogin,
        });

        if (gameCategoriesEl) {
            gameCategoriesEl.innerHTML = template;
            this.setActiveCategory(activeCategory);
            this.moveProviders();
            this.activateProviderDrawer();
            this.equalizeProviderHeight();
        }
    }

    /* Returns list of categories that have available games*/
    getFilteredCategories() {
        return this.filteredCategories;
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
        this.availableCategories = Object.keys(games);
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

    }

    /**
     * Filter categories
     */
    private filterCategories(categories) {
        const filteredCategories: any[] = [];
        for (const category of categories) {
            /* tslint:disable:no-string-literal */
            if (category.hasOwnProperty("field_games_alias") &&
                this.availableCategories.indexOf(category["field_games_alias"]) !== -1) {
                    filteredCategories.push(category);
            }
            /* tslint:disable:no-string-literal */
        }

        return filteredCategories;
    }

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

    private equalizeProviderHeight() {
        setTimeout(() => {
            const equalProvider = new EqualHeight("#game-categories .provider-menu .game-providers-list a");
            equalProvider.init();
        }, 1000);

    }
}
