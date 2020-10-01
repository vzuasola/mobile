import {ComponentManager} from "@plugins/ComponentWidget/asset/component";
import GraphyteLib from "@app/assets/script/vendor/graphyte";
declare let graphyte: any;
/**
 *
 */
export class GraphyteClickStream {
    private products: any = [
        "mobile-arcade",
        "mobile-games",
    ];

    private productMapping = {
        "mobile-arcade": "arcade",
        "mobile-games": "games",
    };
    private isLogin: boolean = false;
    private attachments;
    private element: any;
    private product: string;
    private user: {
        playerId: string,
        currency: string,
        country: string,
    };

    constructor(product) {
        this.product = product;
    }

    handleOnLoad(element: HTMLElement, attachments: {
        authenticated: boolean,
        user,
        configs,
    } ) {
        GraphyteLib({
            asset: attachments.configs.graphyte.clickStream.asset,
            apiKey: attachments.configs.graphyte.apiKey,
            brandKey: attachments.configs.graphyte.brandKey,
        });
        this.element = element;
        this.attachments = attachments;
        this.isLogin = this.attachments.authenticated;
        this.user = this.attachments.user;
        this.listenOnLogin();
        this.listenOnLogout();
        this.listenOnCategoryChange();
        this.listenOnGameLaunch();
    }

    handleOnReLoad(element: HTMLElement, attachments: {
        authenticated: boolean,
        user,
        configs,
    }) {
        if (!this.element) {
            GraphyteLib({
                asset: attachments.configs.graphyte.clickStream.asset,
                apiKey: attachments.configs.graphyte.apiKey,
                brandKey: attachments.configs.graphyte.brandKey,
            });
            this.listenOnLogin();
            this.listenOnLogout();
            this.listenOnCategoryChange();
            this.listenOnGameLaunch();
        }
        this.element = element;
        this.attachments = attachments;
        this.isLogin = this.attachments.authenticated;
        this.user = this.attachments.user;
    }

    /**
     * Listens for login events
     */
    private listenOnLogin() {
        ComponentManager.subscribe("session.login", (event, src, data) => {
            this.isLogin = true;
            this.user = data.response.user;
            if (this.products.includes(ComponentManager.getAttribute("product"))
                && this.attachments.configs.graphyte.enabled) {
                this.graphyteIdentify(this.user.playerId);
            }
        });
    }

    /**
     * Listens for logout events
     */
    private listenOnLogout() {
        ComponentManager.subscribe("session.logout.finished", (event, src, data) => {
            this.isLogin = false;
        });
    }

    /**
     * Listens for category change events
     */
    private listenOnCategoryChange() {
        ComponentManager.subscribe("clickstream.category.change", (event, src, data) => {
            if (this.isLogin && this.attachments.configs.graphyte.enabled
                    && this.product === data.product) {
                this.graphytePageView(data.category, data.title, data.url);
            }
        });

    }

    /**
     * Listens for game launch event
     */
    private listenOnGameLaunch() {
        ComponentManager.subscribe("clickstream.game.launch", (event, src, data) => {
            // game launch via slider or on prelogin
            if (!this.isLogin && typeof data.response.user === "object"
                && data.response.user.playerId !== "undefined") {
                this.isLogin = true;
                this.user = data.response.user;
            }
            if (this.isLogin && this.attachments.configs.graphyte.enabled
                && this.product === data.product) {
                this.graphyteTrack(data.srcEl, data.category);
            }
        });

    }

    /**
     * Sends data to graphyte for login event
     * @param userId
     */
    private graphyteIdentify(userId) {
        graphyte.identify(userId);
    }

    /**
     * Sends data to graphyte for game launch events
     * @param srcEl Se
     * @param category
     */
    private graphyteTrack(srcEl, category) {
        const event = new Date();
        const eventIndex = srcEl.getAttribute("data-game-sort")
            ? srcEl.getAttribute("data-game-sort") : 0;
        const eventLocation = srcEl.getAttribute("data-game-location")
            ? srcEl.getAttribute("data-game-location") : category;
        const eventInfo: any = {
            event_name: "GAME_PLAY",
            event_type: "gaming",
            event_datetime: event.toISOString(),
            event_info_1: srcEl.getAttribute("data-game-code"),
            event_info_2: srcEl.getAttribute("data-game-title"),
            event_info_3: this.productMapping[this.product],
            userId: this.user.playerId,
            event_platform: "mobile",
            event_language: ComponentManager.getAttribute("language"),
            event_ccy: this.user.currency,
            event_country: this.user.country,
            event_location: eventLocation,
            event_location_index: parseInt(eventIndex, 10) + 1,
        };
        graphyte.track("GAME_PLAY", eventInfo, [], []);
    }

    /**
     * Sends data to graphyte for page view events
     * @param category
     */
    private graphytePageView(category, title, url) {
        const event = new Date();
        graphyte.page(category, title, {
            event_name: "PAGE_VIEW",
            event_type: "browse",
            event_datetime: event.toISOString(),
            event_info_1: url,
            event_info_2: "",
            event_info_3: ComponentManager.getAttribute("language"),
            userId: this.user.playerId,
            event_platform: "mobile",
            event_ccy: this.user.currency,
        });
    }
}
