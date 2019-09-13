import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";
import {ComponentManager, ComponentInterface} from "@plugins/ComponentWidget/asset/component";
import {Loader} from "@app/assets/script/components/loader";
import {Router} from "@core/src/Plugins/ComponentWidget/asset/router";

export class SodaCasinoPreference {
    private loader;
    private isLogin: boolean;
    private fromGameLaunch: boolean = false;
    private productCheckPreference: any = ["mobile-soda-casino", "mobile-casino-gold"];
    private casinoOptionMapping: any = {"mobile-casino-gold": "casino_gold", "mobile-casino": "casino"};

    constructor() {
        this.loader = new Loader(document.body, true);
    }

    /**
     * Redirect to preferred casino when lobby is accessed directly.
     * Otherwise, show casino preference lightbox when no preference is set.
     */
    checkCasinoPreference(isLogin, fromGameLaunch) {
        ComponentManager.subscribe("session.login", (event, src, data) => {
            let gameCode = false;
            const currentProduct = ComponentManager.getAttribute("product");
            const el = utility.hasClass(data.src, "game-list", true);
            if (el) {
                gameCode = el.getAttribute("data-game-code");
            }
            if (!gameCode && this.productCheckPreference.includes(currentProduct)) {
                this.getCasinoPreference((response) => {
                    this.redirectToPreferred(response);
                });
            }
        });

        if (this.productCheckPreference.includes(ComponentManager.getAttribute("product"))
            && isLogin && !fromGameLaunch) {
            this.getCasinoPreference((response) => {
                this.redirectToPreferred(response);
            });
        }
    }

    private redirectToPreferred(response) {
        const currentProduct = ComponentManager.getAttribute("product");
        if (response.success) {
            if (response.redirect &&
                response.preferredProduct !== this.casinoOptionMapping[currentProduct]) {
                Router.navigate(response.redirect, ["*"]);
                this.loader.hide();
                return;
            }

            if (!response.redirect) {
                ComponentManager.broadcast("casino.preference");
            }
        }
        this.loader.hide();
    }

    /**
     * Get user's casino preference
     */
    private getCasinoPreference(callback) {
        this.loader.show();

        xhr({
            url: Router.generateRoute("casino_option", "preference"),
            type: "json",
        }).then((response) => {
            callback(response);
        }).fail((error, message) => {
            this.loader.hide();
        });
    }
}
