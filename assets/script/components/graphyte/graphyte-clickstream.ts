import {ComponentManager} from "@plugins/ComponentWidget/asset/component";
import GraphyteLib from "@app/assets/script/vendor/graphyte";
declare let graphyte: any;
/**
 *
 */
export class GraphyteClickStream {
    private isLogin: boolean = false;
    private isIdentify: boolean = false;
    private attachments;
    private element: any;
    private title: string;
    private url: string;
    private product: string;
    private user: {
        playerId: string,
        currency: string,
        country: string,
    };

    constructor(product, title, url) {
        this.title = title;
        this.url = url;
        this.product = product;
    }

    handleOnLoad(element: HTMLElement, attachments: {} ) {
        GraphyteLib();
        this.element = element;
        this.attachments = attachments;
        this.isLogin = this.attachments.authenticated;
        this.user = this.attachments.user;
        this.listenOnCategoryChange();
        this.listenOnGameLaunch();
        this.listenOnLogin();
        this.listenOnLogout();
        this.sendIdentify();
    }

    handleOnReLoad(element: HTMLElement, attachments: {}) {
        if (!this.element) {
            GraphyteLib();
            this.listenOnCategoryChange();
            this.listenOnGameLaunch();
            this.listenOnLogin();
            this.listenOnLogout();
        }
        this.element = element;
        this.attachments = attachments;
        this.attachments = attachments;
        this.isLogin = this.attachments.authenticated;
        this.user = this.attachments.user;
        this.sendIdentify();
    }

    /**
     * Trigger sending of identify event to graphyte only once
     */
    private sendIdentify() {
        if (this.isLogin && this.isIdentify) {
            this.graphyteIdentify(this.user.playerId);
            this.isIdentify = false;
        }
    }

    /**
     * Listens for login events
     */
    private listenOnLogin() {
        ComponentManager.subscribe("session.login", (event, src, data) => {
            this.isLogin = true;
            this.isIdentify = true;
        });
    }

    /**
     * Listens for logout events
     */
    private listenOnLogout() {
        ComponentManager.subscribe("session.logout.finished", (event, src, data) => {
            this.isLogin = false;
            this.isIdentify = false;
        });
    }

    /**
     * Listens for category change events
     */
    private listenOnCategoryChange() {
        ComponentManager.subscribe("clickstream.category.change", (event, src, data) => {
            if (this.isLogin) {
                this.graphytePageView(data.category);
            }
        });

    }

    /**
     * Listens for game launch event
     */
    private listenOnGameLaunch() {
        ComponentManager.subscribe("clickstream.game.launch", (event, src, data) => {
            if (this.isLogin) {
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
        const eventInfo: any = {
            event_name: "GAME_PLAY",
            event_type: "gaming",
            event_datetime: event.toISOString(),
            event_info_1: srcEl.getAttribute("data-game-code"),
            event_info_2: srcEl.getAttribute("data-game-title"),
            event_info_3: this.product,
            userId: this.user.playerId,
            event_platform: "mobile",
            event_language: ComponentManager.getAttribute("language"),
            event_ccy: this.user.currency,
            event_country: this.user.country,
            event_location: category,
            event_location_index: parseInt(srcEl.getAttribute("data-game-sort"), 10) + 1,
        };
        graphyte.track("GAME_PLAY", eventInfo, [], []);
    }

    /**
     * Sends data to graphyte for page view events
     * @param category
     */
    private graphytePageView(category) {
        const event = new Date();
        graphyte.page(category, this.title, {
            event_name: "PAGE_VIEW",
            event_type: "browse",
            event_datetime: event.toISOString(),
            event_info_1: this.url,
            event_info_2: "",
            event_info_3: ComponentManager.getAttribute("language"),
            userId: this.user.playerId,
            event_platform: "mobile",
            event_ccy: this.user.currency,
        });
    }
}
