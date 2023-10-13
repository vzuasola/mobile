import * as utility from "@core/assets/js/components/utility";

import {ComponentInterface, ComponentManager} from "@plugins/ComponentWidget/asset/component";
import {Router, RouterClass} from "@plugins/ComponentWidget/asset/router";
import DafacoinMenu from "@core/assets/js/components/dafacoin-menu/dafacoin-menu";

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
                const link = wrapper.querySelector("a");
                const loader = wrapper.querySelector("div");

                utility.addClass(link, "hidden");
                utility.removeClass(loader, "hidden");

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
            const customOptions = {
                selectors: {
                    header: "header",
                    balanceMenuBtn: ".balance-menu-btn",
                    balanceMenuDiv: "#balance-menu-div",
                    balanceArrowHead: ".cashier-arrowhead",
                    balanceMobileContainer: ".total-balance-container",
                    balanceMenuOverlay: "#dafacoin-overlay",
                    saveButton: "#balance-save-btn",
                    closeButton: "#balance-close-btn",
                    popupYesButton: "#popup-yes-btn",
                    popupNoButton: "#popup-no-btn",
                    popupOverlay: "#dafacoin-warning-overlay",
                    savedCloseButton: "#dafacoin-saved-close-btn",
                    cashierMenu: ".cashier-menu",
                    cashierBalance: "#cashier-balance",
                    cashierMenuLoader: ".cashier-menu-loader",
                    cashierBalanceAnchorMobile: ".cashier-anchor-mobile",
                    cashierBalanceAnchorDesktop: ".cashier-anchor-desktop",
                    cashierBalanceAccountAmount: ".cashier-account-balance-amount",
                    cashierBalanceAccountCurrency: ".cashier-account-balance-currency",
                    cashierBalanceAccountFormatted: ".cashier-account-balance-formatted",
                    toggleAllAnchor: ".cashier-menu-toggle-all-container .btn-holder",
                },

                balanceUrl: "/api/plugins/component/route/balance/getdetailedbalances",
                attachments: this.attachments.dafacoin_menu,
            };
            const dafacoinMenu = new DafacoinMenu(customOptions);
            dafacoinMenu.init();
        }

        ComponentManager.broadcast("token.parse", {
            element: this.element,
            method: "parseLink",
            selector: "[href*=ticket\\.token]",
        });
    }

    private refreshBalance() {
        ComponentManager.broadcast("balance.return", {
            success: (response) => {
                if (typeof response.balance === "undefined") {
                    return;
                }

                if (this.attachments.useDafacoinBalanceMenu) {
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
