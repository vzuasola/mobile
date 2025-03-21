import * as utility from "@core/assets/js/components/utility";

import {ComponentInterface, ComponentManager} from "@plugins/ComponentWidget/asset/component";
import {Router, RouterClass} from "@plugins/ComponentWidget/asset/router";
import DafacoinMenu from "@core/assets/js/components/dafacoin-menu/dafacoin-menu";
import DcoinPopup from "@core/assets/js/components/dafacoin-menu/dafacoin-popup";

/**
 *
 */
export class HeaderComponent implements ComponentInterface {
    private element: HTMLElement;
    private attachments: any;
    private product: string;
    private logoData: any;
    private joinUrl: string;

    // This property should only be set through setUnsavedChangesStatus() method.
    private unsavedChangesExist = false;

    onLoad(element: HTMLElement, attachments: { authenticated: boolean, join_now_url: string, products: any[] }) {
        this.element = element;
        this.attachments = attachments;
        this.joinUrl = attachments.join_now_url;
        this.attachProduct();
        this.refreshBalance();
        this.componentFinish();

        Router.on(RouterClass.afterNavigate, (event) => {
            if (this.attachments.authenticated) {
                const wrapper = this.element.querySelector(".account-balance");
                if (wrapper) {
                    const link = wrapper.querySelector("a");
                    const loader = wrapper.querySelector("div");

                    utility.addClass(link, "hidden");
                    utility.removeClass(loader, "hidden");
                }

                this.refreshBalance();
                this.componentFinish();
            } else {
                this.attachProduct();
            }
            this.refreshHeader();
            this.componentFinish();
        });
    }

    onReload(element: HTMLElement, attachments: { authenticated: boolean, join_now_url: string, products: any[] }) {
        this.element = element;
        this.attachments = attachments;
        this.joinUrl = attachments.join_now_url;
        this.attachProduct();
        this.refreshBalance();
        this.componentFinish();
    }

    private componentFinish() {
        if (this.attachments.useDafacoinBalanceMenu) {
            // Initialize
            const dafacoinMenu = new DafacoinMenu({
                balanceUrl: "/api/plugins/component/route/balance/getdetailedbalances",
                balancePriorityUrl: "/api/plugins/component/route/dafacoin/setwalletpriority",
                language: ComponentManager.getAttribute("language"),
                attachments: this.attachments.dafacoin_menu,
            });
            dafacoinMenu.init();

            const dafacoinPopup = new DcoinPopup({
                product: "mobile-entrypage",
                language: ComponentManager.getAttribute("language"),
                apiUrl: "/api/plugins/component/route/dafacoin/content-sliders",
            });

            if (!this.attachments.authenticated) {
                dafacoinPopup.clearPopupStatus();
            }

            if (this.attachments.enableGuidedTour) {
                ComponentManager.subscribe("redirect.postlogin.casino-gold", (event, src, data) => {
                    dafacoinPopup.clearPopupStatus();
                });

                setTimeout (() => {
                    dafacoinPopup.init();
                }, 1000);
            }

        }

        ComponentManager.broadcast("token.parse", {
            element: this.element,
            method: "parseLink",
            selector: "[href*=ticket\\.token]",
        });
    }

    private refreshBalance() {
        // Prevent balance call if dafacoin is enabled;
        if (this.attachments.useDafacoinBalanceMenu) {
            return;
        }
        ComponentManager.broadcast("balance.return", {
            success: (response) => {
                if (typeof response.balance === "undefined") {
                    return;
                }

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

            },
        });
    }

    private attachProduct() {
        const product = ComponentManager.getAttribute("product");
        const loginButton = this.element.querySelector(".login-trigger");
        const joinButton = this.element.querySelector(".join-btn");

        if (joinButton) {
            joinButton.setAttribute("href", joinButton.getAttribute("data-join-url"));
        }

        if (loginButton) {
            if (product !== "mobile-entrypage") {
                if (this.attachments.products && this.attachments.products.hasOwnProperty(product)) {
                    const currentProduct = this.attachments.products[product];

                    loginButton.setAttribute(
                        "data-product-login-via",
                        currentProduct.login_via,
                    );
                    loginButton.setAttribute(
                        "data-product-reg-via",
                        currentProduct.reg_via,
                    );

                    if (joinButton) {
                        joinButton.setAttribute(
                            "href",
                            currentProduct.reg_via,
                        );
                    }
                }
            } else {
                loginButton.setAttribute(
                    "data-product-login-via",
                    "",
                );
                loginButton.setAttribute(
                    "data-product-reg-via",
                    "",
                );

                if (joinButton) {
                    joinButton.setAttribute(
                        "href",
                        this.joinUrl,
                    );
                }
            }
        }

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
}
