import * as utility from "@core/assets/js/components/utility";
import {ComponentInterface, ComponentManager} from "@plugins/ComponentWidget/asset/component";
import {Router, RouterClass} from "@plugins/ComponentWidget/asset/router";
/**
 *
 */
export class HeaderGameIFrameComponent implements ComponentInterface {
    private element: HTMLElement;
    private attachments: any;
    private product: string;

    onLoad(element: HTMLElement, attachments: { authenticated: boolean}) {
        this.element = element;
        this.attachments = attachments;
        this.refreshBalance();
        this.componentFinish();
        this.listenClickLogo();

        Router.on(RouterClass.afterNavigate, (event) => {
            if (this.attachments.authenticated) {
                const wrapper = this.element.querySelector(".account-balance");
                const link = wrapper.querySelector("a");
                const loader = wrapper.querySelector("div");

                utility.addClass(link, "hidden");
                utility.removeClass(loader, "hidden");

                this.refreshBalance();
                this.componentFinish();
            }
            this.refreshHeader();
            this.componentFinish();
        });
    }

    onReload(element: HTMLElement, attachments: { authenticated: boolean}) {
        this.element = element;
        this.attachments = attachments;
        this.refreshBalance();
        this.componentFinish();
        this.listenClickLogo();
    }

    private componentFinish() {
        ComponentManager.broadcast("token.parse", {
            element: this.element,
            method: "parseLink",
            selector: "[href*=ticket\\.token]",
        });
    }

    private refreshBalance() {
        ComponentManager.broadcast("balance.return", {
            success: (response) => {
                if (typeof response.balance !== "undefined") {
                    const wrapper = this.element.querySelector(".account-balance");

                    if (wrapper) {
                        const balance = wrapper.querySelector(".account-balance-amount");
                        const link = wrapper.querySelector("a");
                        const loader = wrapper.querySelector("div");

                        if (balance) {
                            balance.innerHTML = response.balance;
                            const product = ComponentManager.getAttribute("product");
                            let balanceFlag = false;
                            if (response.map.hasOwnProperty(product) && response.map[product] !== 0) {
                                let totalBalance = 0;
                                if (typeof response.balances[response.map[product]] !== "undefined") {
                                    balanceFlag = true;
                                    totalBalance += response.balances[response.map[product]];
                                }

                                balance.innerHTML = this.formatBalance(Number(totalBalance).toFixed(2));
                                if (!balanceFlag) {
                                    balance.innerHTML = response.err_message;
                                }
                            }
                        }

                        utility.removeClass(link, "hidden");
                        utility.addClass(loader, "hidden");
                    }
                }
            },
        });
    }

    private refreshHeader() {
        const product = ComponentManager.getAttribute("product");
        if (this.product !== product) {
            this.product = product;
            ComponentManager.refreshComponent("header");
        }
    }

    private formatBalance(balance) {
        return balance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    /**
     * Listens for click event on search button.
     * Shows games search result in games lobby.
     */
     private listenClickLogo() {
        ComponentManager.subscribe("click", (event, src) => {
            const el = utility.hasClass(src, "gameframe-logo", true);

            if (el) {
                event.preventDefault();
                const product = ComponentManager.getAttribute("product");
                window.location.href = "/" + product.replace("mobile-", "");
            }
        });
    }
}
