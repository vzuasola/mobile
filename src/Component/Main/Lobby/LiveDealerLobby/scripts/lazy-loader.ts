import * as utility from "@core/assets/js/components/utility";
import * as gameTemplate from "../handlebars/games.handlebars";

export class LazyLoader {
    private currentBatch: number = 0;
    private configs: any[];
    private batchLength: number = 0;
    private loaded: boolean = true;
    private startBatch: number = 0;
    private data: any[];
    private lazyLoad: boolean;
    private authenticated: boolean;
    private activeTab: string;
    private uglConfig: boolean;

    /**
     * Initialize lazy loader.
     * @param data Array
     * @param authenticated boolean
     * @param gameContainer HTMLElement
     * @param activeTab String
     * @param lazyLoad Boolean
     * @param uglConfig Boolean
     */
    init(data, authenticated, configs, gameContainer, activeTab, lazyLoad, uglConfig) {
        this.loaded = true;
        this.currentBatch = 0;
        this.data = data;
        this.lazyLoad = lazyLoad;
        this.authenticated = authenticated;
        this.activeTab = activeTab;
        this.configs = configs;
        this.uglConfig = uglConfig;
        const batch = this.getBatch();
        const template = gameTemplate({
            games: batch[this.startBatch],
            isLogin: this.authenticated,
            configs: this.configs,
            activeTabClass: activeTab,
            uglConfig: Boolean(this.uglConfig),
        });

        if (gameContainer) {
            gameContainer.innerHTML = template;
            const loaders = gameContainer.querySelector(".mobile-game-loader");
            if (loaders.length > 1) {
                for (let ctr = 0; ctr < loaders.length - 1; ctr++) {
                    loaders[ctr].remove();
                }
            }
        }
    }

    /**
     * Show items on scroll down
     * @param gameLoader HTMLElement
     * @param gameContainer HTMLElement
     */
    onScrollDown(gameLoader, gameContainer) {
        if (this.hasLoaded(gameLoader) && this.batchLength > 1 && this.batchLength - 1 > this.currentBatch) {
            const batch = this.getBatch();
            if (gameContainer && gameLoader && this.loaded) {
                this.currentBatch += 1;

                const template = gameTemplate({
                    games: batch[this.currentBatch],
                    isLogin: this.authenticated,
                    configs: this.configs,
                    activeTabClass: this.activeTab,
                    uglConfig: Boolean(this.uglConfig),
                });
                this.showItems(template, gameLoader, gameContainer);
            }

        }
    }

    /**
     * Splits data into batches depending on viewport and active tab
     * @param data Array
     * @param activeTab String
     */
    private getBatch() {
        const temp = this.data.slice(0);
        const batch: any = [];

        if (!this.lazyLoad) {
            batch.push(temp);
            return batch;
        }

        while (temp.length > 0) {
            batch.push(temp.splice(0, 12));
        }

        this.batchLength = batch.length;

        return batch;
    }

    /**
     * Show remaining items upon scrolling down
     * @param gameLoader HTMLElement
     * @param gameContainer HTMLElement
     * @param template String
     */
    private showItems(template, gameLoader, gameContainer) {
        const loader = gameLoader.querySelector(".mobile-game-loader");
        utility.removeClass(loader, "hidden");
        this.loaded = false;
        setTimeout(() => {
            gameLoader.remove();
            gameContainer.innerHTML += template;
            this.loaded = true;
        }, 1000);
    }

    /**
     * Check that we have'nt reached the bottom of the page yet.
     * @param el HTMLElement
     */
    private hasLoaded(el) {
        if (el) {
            return el.getBoundingClientRect().bottom <= window.innerHeight;
        }
    }
}
