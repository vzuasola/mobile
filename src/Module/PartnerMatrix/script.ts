import * as utility from "@core/assets/js/components/utility";
import {ComponentManager, ModuleInterface} from "@plugins/ComponentWidget/asset/component";
import {Router, RouterClass} from "@plugins/ComponentWidget/asset/router";

export class PartnerMatrixModule implements ModuleInterface {
    private isLogin: boolean;
    private matrix: boolean;
    private productsDisabled: any[];
    private linksDisabled: any[];
    private pathsDisabled: any[];

    onLoad(attachments: {
        authenticated: boolean,
        matrix: boolean,
        pm_disabled_products: any[],
        pm_disabled_links: any[],
        pm_disabled_paths: any[],
    }) {
        this.isLogin = attachments.authenticated;
        this.matrix = attachments.matrix;
        this.productsDisabled = attachments.pm_disabled_products;
        this.linksDisabled = attachments.pm_disabled_links;
        this.pathsDisabled = attachments.pm_disabled_paths;

        this.redirectToPageUnavailable();

        Router.on(RouterClass.afterNavigate, (event) => {
            this.redirectToPageUnavailable();
        });

        ComponentManager.subscribe("session.login", (event, target, data) => {
            this.isLogin = true;
            this.matrix = data.response.matrix;
            this.broadcastPartnerMatrixFilter();
        });

        ComponentManager.subscribe("session.logout", (event, target, data) => {
            this.isLogin = false;
            this.matrix = false;
        });

        ComponentManager.subscribe("menu.ready", (event, target, data) => {
            this.broadcastPartnerMatrixFilter();
        });

        ComponentManager.subscribe("home.products.ready", (event, target, data) => {
            this.broadcastPartnerMatrixFilter();
        });
    }

    private redirectToPageUnavailable() {
        const pattern = new RegExp(this.pathsDisabled.join("|")).test(Router.route().toLowerCase());
        if (this.isLogin && this.matrix && pattern) {
            window.location.href = "/" + ComponentManager.getAttribute("language") + "/page-unavailable";
        }
    }

    private broadcastPartnerMatrixFilter() {
        if (this.isLogin && this.matrix) {
            ComponentManager.broadcast("post.login.partner.matrix.filter", {
                disabled_products: this.productsDisabled,
                disabled_links: this.linksDisabled,
            });
        }
    }
}
