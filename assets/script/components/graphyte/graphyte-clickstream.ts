import {ComponentManager} from "@plugins/ComponentWidget/asset/component";
declare let graphyte: any;
/**
 *
 */
export class GraphyteClickStream {
    private attachments;
    private element: any;
    private playerId: string;
    private country: string;
    private currency: string;
    private isLogin: boolean = false;
    private isIdentify: boolean = false;

    handleOnLoad(element: HTMLElement, attachments: {} ) {
        this.element = element;
        this.attachments = attachments;
        this.isLogin = this.attachments.authenticated;
        this.playerId = this.attachments.playerId;
        this.currency = this.attachments.currency;
        this.country = this.attachments.country;
        this.listenOnCategoryChange();
        this.listenOnGameLaunch();
        this.listenOnLogin();
        this.listenOnLogout();
        this.sendIdentify();
    }

    handleOnReLoad(element: HTMLElement, attachments: {}) {
        if (!this.element) {
            this.listenOnCategoryChange();
            this.listenOnGameLaunch();
            this.listenOnLogin();
            this.listenOnLogout();
        }
        this.element = element;
        this.attachments = attachments;
        this.attachments = attachments;
        this.isLogin = this.attachments.authenticated;
        this.playerId = this.attachments.playerId;
        this.currency = this.attachments.currency;
        this.country = this.attachments.country;
        this.sendIdentify();
    }

    private sendIdentify() {
        if (this.isLogin && this.isIdentify) {
            this.graphyteIdentify(this.playerId);
            this.isIdentify = false;
        }
    }

    private listenOnLogin() {
        ComponentManager.subscribe("session.login", (event, src, data) => {
            this.isLogin = true;
            this.isIdentify = true;
        });
    }

    private listenOnLogout() {
        ComponentManager.subscribe("session.logout.finished", (event, src, data) => {
            this.isLogin = false;
            this.isIdentify = false;
        });
    }

    private listenOnCategoryChange() {
        ComponentManager.subscribe("clickstream.category.change", (event, src, data) => {
            if (this.isLogin) {
                this.graphytePageView(data.category, data.title, data.url);
            }
        });

    }

    private listenOnGameLaunch() {
        ComponentManager.subscribe("clickstream.game.launch", (event, src, data) => {
            if (this.isLogin) {
                this.graphyteTrack(data.srcEl, data.category);
            }
        });

    }

    private graphyteIdentify(userId) {
        graphyte.identify(userId);
    }

    private graphyteTrack(srcEl, category) {
        const event = new Date();
        const eventInfo: any = {
            event_name: "GAME_PLAY",
            event_type: "gaming",
            event_datetime: event.toISOString(),
            event_info_1: srcEl.getAttribute("data-game-code"),
            event_info_2: srcEl.getAttribute("data-game-title"),
            event_info_3: category,
            userId: this.playerId,
            event_platform: "mobile",
            event_language: ComponentManager.getAttribute("language"),
            event_ccy: this.currency,
            event_country: this.country,
            event_location: category,
            event_location_index: parseInt(srcEl.getAttribute("data-game-sort"), 10) + 1,
        };
        // graphyte.track("GAME_PLAY", eventInfo, [], []);
    }

    private graphytePageView(category, title, url) {
        const event = new Date();
        graphyte.page(category, name, {
            event_name: "PAGE_VIEW",
            event_type: "browse",
            event_value: title,
            event_datetime: event.toISOString(),
            event_info_1: url,
            event_info_2: "",
            event_info_3: ComponentManager.getAttribute("language"),
            userId: this.playerId,
            event_platform: "mobile",
            event_ccy: this.currency,
        });
    }
}
