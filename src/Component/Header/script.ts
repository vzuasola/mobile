import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";

import {ComponentInterface, ComponentManager} from "@plugins/ComponentWidget/asset/component";
import {Router, RouterClass} from "@plugins/ComponentWidget/asset/router";

import * as logoTemplate from "./handlebars/logo.handlebars";

/**
 *
 */
export class HeaderComponent implements ComponentInterface {
    private element: HTMLElement;
    private attachments: any;
    private product: string;
    private logoData: any;
    private dafacoinMenuStatus = "closed";
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
            const balanceMenuBtn = this.element.querySelector("#balance-menu-btn");
            const balanceMenuDiv = this.element.querySelector("#balance-menu-div");
            const balanceArrowHead = this.element.querySelector("#cashier-arrowhead");
            const saveButton = this.element.querySelector("#balance-save-btn");
            const closeButton = this.element.querySelector("#balance-close-btn");
            const popupYesButton = this.element.querySelector("#popup-yes-btn");
            const popupNoButton = this.element.querySelector("#popup-no-btn");
            const balanceMenuOverlay = this.element.querySelector("#dafacoin-overlay");
            const popupOverlay = this.element.querySelector("#dafacoin-warning-overlay");
            const dafacoinSavedCloseButton = this.element.querySelector("#dafacoin-saved-close-btn");

            if (balanceMenuBtn) { // It exists if the user is logged in
                balanceMenuBtn.addEventListener("click", (event) => {
                    event.stopPropagation();
                    this.toggleDafacoinMenu();
                });

                saveButton.addEventListener("click", (event) => {
                    this.closeDafacoinPopop();
                    this.closeDafacoinMenu(balanceMenuDiv, balanceArrowHead);

                    // TODO: save changes
                    this.openSavedPopup();
                });

                closeButton.addEventListener("click", (event) => {
                    if (this.unsavedChangesExist) {
                        this.openDafacoinPopup();
                    } else {
                        this.closeDafacoinMenu(balanceMenuDiv, balanceArrowHead);
                    }
                });

                balanceMenuDiv.addEventListener("click", (event) => {
                    event.stopPropagation();
                });

                popupOverlay.addEventListener("click", (event) => {
                    event.stopPropagation();
                });

                popupYesButton.addEventListener("click", (event) => {
                    event.stopPropagation();
                    this.closeDafacoinPopop();
                    this.closeDafacoinMenu(balanceMenuDiv, balanceArrowHead);

                    // TODO: Clear any unsaved changes.
                });

                popupNoButton.addEventListener("click", (event) => {
                    event.stopPropagation();
                    this.closeDafacoinPopop();
                });

                balanceMenuOverlay.addEventListener("click", (event) => {
                    event.stopPropagation();
                    this.closeDafacoinMenu(balanceMenuDiv, balanceArrowHead);
                });

                utility.addEventListener(document, "click", (event, src) => {
                    event = event || window.event;
                    const target = event.target || event.srcElement;

                    const clickedOutsideMenu = !balanceMenuDiv.contains(target) && !balanceMenuBtn.contains(target);
                    if (clickedOutsideMenu && this.dafacoinMenuStatus === "open") {
                        event.stopPropagation();
                        this.closeDafacoinMenu(balanceMenuDiv, balanceArrowHead);
                    }
                });

                dafacoinSavedCloseButton.addEventListener("click", (event) => {
                    this.closeSavedPopup();
                });
            }
        }

        ComponentManager.broadcast("token.parse", {
            element: this.element,
            method: "parseLink",
            selector: "[href*=ticket\\.token]",
        });
    }

    private setUnsavedChangesStatus(changesExist) {
        this.unsavedChangesExist = changesExist;

        // The conversion to HTMLButtonElement is needed because Typescript does not recognize the "disabled"
        // property for any kind of HTMLElement
        const saveButton = (this.element.querySelector("#balance-save-btn") as HTMLButtonElement);
        if (changesExist) {
            saveButton.disabled = false;
        } else {
            saveButton.disabled = true;
        }
    }

    private toggleDafacoinMenu() {
        const balanceMenuDiv = this.element.querySelector("#balance-menu-div");
        const balanceArrowHead = this.element.querySelector("#cashier-arrowhead");

        if (this.dafacoinMenuStatus === "closed") {
            this.openDafacoinMenu(balanceMenuDiv, balanceArrowHead);
        } else {
            this.closeDafacoinMenu(balanceMenuDiv, balanceArrowHead);
        }
    }

    private closeDafacoinMenu(balanceMenuDiv, balanceArrowHead) {
        utility.addClass(balanceMenuDiv, "hidden");
        balanceArrowHead.innerHTML = "&#8964;";
        utility.removeClass(balanceArrowHead, "up-arrowhead");
        utility.addClass(balanceArrowHead, "down-arrowhead");

        const dafacoinOverlay = this.element.querySelector("#dafacoin-overlay");
        utility.addClass(dafacoinOverlay, "hidden");

        this.dafacoinMenuStatus = "closed";
    }

    private openDafacoinMenu(balanceMenuDiv, balanceArrowHead) {
        utility.removeClass(balanceMenuDiv, "hidden");
        balanceArrowHead.innerHTML = "&#8963;";
        utility.removeClass(balanceArrowHead, "down-arrowhead");
        utility.addClass(balanceArrowHead, "up-arrowhead");

        const dafacoinOverlay = this.element.querySelector("#dafacoin-overlay");
        utility.removeClass(dafacoinOverlay, "hidden");

        this.dafacoinMenuStatus = "open";
    }

    private closeDafacoinPopop() {
        const dafacoinWarning = this.element.querySelector("#dafacoin-warning");
        const dafacoinWarningOverlay = this.element.querySelector("#dafacoin-warning-overlay");
        const balanceMenuShade = this.element.querySelector("#balance-menu-shade");

        utility.addClass(dafacoinWarning, "hidden");
        utility.addClass(dafacoinWarningOverlay, "hidden");
        utility.removeClass(balanceMenuShade, "div-shade");
    }

    private openDafacoinPopup() {
        const dafacoinOverlay = this.element.querySelector("#dafacoin-warning");
        const dafacoinWarningOverlay = this.element.querySelector("#dafacoin-warning-overlay");
        const balanceMenuShade = this.element.querySelector("#balance-menu-shade");

        utility.removeClass(dafacoinOverlay, "hidden");
        utility.removeClass(dafacoinWarningOverlay, "hidden");
        utility.addClass(balanceMenuShade, "div-shade");
    }

    private openSavedPopup() {
        const dafacoinSavedPopup = this.element.querySelector("#dafacoin-saved-overlay");
        utility.removeClass(dafacoinSavedPopup, "hidden");

        const popupDisplayTime = this.attachments.dafacoin_popup_display_time * 1000;
        setTimeout(this.closeSavedPopup.bind(this), popupDisplayTime);
    }

    private closeSavedPopup() {
        const dafacoinSavedPopup = this.element.querySelector("#dafacoin-saved-overlay");
        utility.addClass(dafacoinSavedPopup, "hidden");
    }

    private refreshBalance() {
        ComponentManager.broadcast("balance.return", {
            success: (response) => {
                if (typeof response.balance === "undefined") {
                    return;
                }

                if (this.attachments.useDafacoinBalanceMenu) {
                    const coinWrapper = this.element.querySelector(".coin-account-balance");
                    const balance = coinWrapper.querySelector(".coin-account-balance-amount");
                    const innerBalance = this.element.querySelector("#inner-total-balance");
                    const cashierMenu = coinWrapper.querySelector("#cashier-menu");
                    const loader = coinWrapper.querySelector(".mobile-balance-loader");

                    if (balance) {
                        balance.innerHTML = response.balance;
                        innerBalance.innerHTML = response.balance;
                    }

                    utility.removeClass(cashierMenu, "hidden");
                    utility.addClass(loader, "hidden");

                } else {
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
