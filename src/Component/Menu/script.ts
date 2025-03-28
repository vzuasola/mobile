import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";

import {ComponentInterface, ComponentManager} from "@plugins/ComponentWidget/asset/component";
import {Router, RouterClass} from "@plugins/ComponentWidget/asset/router";

import {CasinoOption} from "./scripts/casino-option";
import {Menu} from "./scripts/menu";
import {PushNotification} from "./scripts/push-notification";

import EqualHeight from "@app/assets/script/components/equal-height";
import {Redirector} from "@app/assets/script/components/redirector";

/**
 *
 */
export class MenuComponent implements ComponentInterface {
    private pushNotification: PushNotification;
    private casinoOption: CasinoOption;

    private element: HTMLElement;
    private isLogin: boolean;
    private products: any[];
    private joinUrl: string;
    private product: string;
    private language: string;
    private useDafacoinBalanceMenu: boolean;

    constructor() {
        this.pushNotification = new PushNotification();
        this.casinoOption = new CasinoOption();
    }

    onLoad(
        element: HTMLElement,
        attachments: {
            authenticated: boolean,
            join_now_url: string,
            products: any[],
            useDafacoinBalanceMenu: boolean,
        }) {
        this.element = element;
        this.language = ComponentManager.getAttribute("language");
        this.equalizeProductHeight();
        this.equalizeQuicklinksHeight();
        this.toggleLogoutLink();
        this.isLogin = attachments.authenticated;
        this.products = attachments.products;
        this.joinUrl = attachments.join_now_url;
        this.useDafacoinBalanceMenu = attachments.useDafacoinBalanceMenu;

        this.activateMenu(element);
        this.attachProduct();
        this.attachProductToLogin();

        this.reloadBalance();
        this.pushNotification.handleOnLoad(element, attachments);

        this.listenAnnouncementCount();
        this.listenHighlightMenu();
        this.listenToPartnerMatrixFilter();
        this.updateMenuRouter();
        this.updateLogoRouter();

        ComponentManager.subscribe("session.prelogin", (event, src, data) => {
            this.isLogin = true;
        });

        ComponentManager.subscribe("session.logout", (event) => {
            this.isLogin = false;
        });

        this.menuReady();
        Router.on(RouterClass.afterNavigate, (event) => {
            this.attachProduct();
            this.attachProductToLogin();
            this.reloadBalance();
            this.menuReady();
        });

        // casino option
        this.casinoOption.onLoad(this.element, {});

    }

    onReload(
        element: HTMLElement,
        attachments: {
            authenticated: boolean,
            join_now_url: string,
            products: any[],
            useDafacoinBalanceMenu: boolean,
        }) {
        this.element = element;
        this.updateMenuRouter();
        this.updateLogoRouter();
        this.equalizeProductHeight();
        this.equalizeQuicklinksHeight();
        this.products = attachments.products;
        this.joinUrl = attachments.join_now_url;
        this.useDafacoinBalanceMenu = attachments.useDafacoinBalanceMenu;

        this.activateMenu(element);
        this.attachProduct();
        this.attachProductToLogin();

        this.reloadBalance();
        this.pushNotification.handleOnLoad(element, attachments);
        // casino option
        this.casinoOption.onReload(this.element, {});
    }

    private menuReady() {
        ComponentManager.broadcast("token.parse", {
            element: this.element,
            method: "parseLink",
            selector: "[href*=ticket\\.token]",
        });
        ComponentManager.broadcast("menu.ready");
    }

    private equalizeProductHeight() {
        const equalProduct = new EqualHeight(".icon-thumbnail-product a");
        equalProduct.init();
    }

    private equalizeQuicklinksHeight() {
        const equalQuicklinks = new EqualHeight(".icon-thumbnail-quicklinks a");
        equalQuicklinks.init();
    }

    /**
     * Enable menu slide behavior
     */
    private activateMenu(element) {
        const menu = new Menu(element);
        menu.activate();
        this.menuReady();
    }

    private updateMenuRouter() {
        ComponentManager.subscribe("menu.update.router.component", (event, src, data) => {
            const home = this.element.querySelector(data.element);
            const promotion = this.element.querySelector(".quicklinks-promotions");
            home.setAttribute("data-router-refresh", `["main", "tab_navigation", "language", "${data.val}"]`);
            promotion.setAttribute("data-router-refresh", `["main", "tab_navigation", "language", "${data.val}"]`);
            if (this.isLogin) {
                const password = this.element.querySelector(".quicklinks-change-password");
                const account = this.element.querySelector(".quicklinks-my-account");
                password.setAttribute("data-router-refresh", `["main", "tab_navigation", "language", "${data.val}"]`);
                account.setAttribute("data-router-refresh", `["main", "tab_navigation", "language", "${data.val}"]`);
            }
        });
    }

    private updateLogoRouter() {
        ComponentManager.subscribe("menu.update.logo.component", (event, src, data) => {
            const logo = this.element.querySelector(data.element);
            logo.setAttribute("data-router-refresh", `["main", "tab_navigation", "language", "${data.val}"]`);
        });
    }

    private toggleLogoutLink() {
        ComponentManager.subscribe("menu.logout.hide", (event, src, data) => {
            const logoutLink = this.element.querySelector(data.selector);

            if (logoutLink) {
                logoutLink.parentNode.style.display = "none";
            }
        });

        ComponentManager.subscribe("menu.logout.show", (event, src, data) => {
            const logoutLink = this.element.querySelector(data.selector);

            if (logoutLink) {
                logoutLink.parentNode.style.display = "block";
            }
        });
    }

    private reloadBalance() {
        if (this.useDafacoinBalanceMenu) {
            return;
        }
        ComponentManager.broadcast("balance.return", {
            success: (response) => {
                const headerBalance = this.element.querySelector(".mobile-menu-amount");
                if (this.isLogin && headerBalance && typeof response.balance !== "undefined") {
                    let formatedBalance: string;
                    formatedBalance = response.format;
                    if (formatedBalance) {
                        formatedBalance = formatedBalance.replace("{currency}", response.currency);
                        formatedBalance = formatedBalance.replace("{total}", response.balance);

                        headerBalance.innerHTML = formatedBalance;
                    }
                }
            },
        });
    }

    /**
     * Listen to announcement pushes
     */
    private listenAnnouncementCount() {
        ComponentManager.subscribe("announcement.update.count", (event, target, data) => {
            const countElement = this.element.querySelector("#announcement-count");

            if (countElement) {
                countElement.innerHTML = data.count;

                if (parseInt(data.count, 10) > 0) {
                    utility.removeClass(countElement, "hidden");
                    utility.removeClass(this.element.querySelector(".mobile-menu-indicator"), "hidden");
                } else {
                    const notifCountElement = this.element.querySelector("#notification-count");
                    const notifCount = notifCountElement ? parseInt(notifCountElement.innerHTML, 10) : 0;

                    if (notifCount <= 0) {
                        utility.addClass(this.element.querySelector(".mobile-menu-indicator"), "hidden");
                    }
                    utility.addClass(countElement, "hidden");
                }
            }
        });
    }

    private listenToPartnerMatrixFilter() {
        ComponentManager.subscribe("post.login.partner.matrix.filter", (event, target, data) => {
            if (data.disabled_products) {
                const products = this.element.querySelectorAll(".menu-display-product li a");
                for (const productMenu in products) {
                    if (products.hasOwnProperty(productMenu)) {
                        const instanceID = products[productMenu].getAttribute("data-product-instance-id");
                        if (data.disabled_products.indexOf(instanceID) > -1) {
                            utility.addClass(products[productMenu], "hidden");
                        }
                    }
                }
            }

            if (data.disabled_links) {
                this.partnerMatrixHideLinks(data.disabled_links);
                const btnCashier: HTMLElement = this.element.querySelector(".btn-cashier");
                if (btnCashier) {
                    btnCashier.style.width = "97%";
                }
            }
        });
    }

    private partnerMatrixHideLinks(disabledLinks) {
        for (const linkContainer in disabledLinks) {
            if (disabledLinks.hasOwnProperty(linkContainer)) {
                const linkContainerArr = linkContainer.split("|");
                const links = this.element.querySelectorAll("." + linkContainerArr[0] + " a");
                for (const link in links) {
                    if (links.hasOwnProperty(link)) {
                        const search = links[link].getAttribute(linkContainerArr[1]);
                        const pattern = new RegExp(disabledLinks[linkContainer].join("|")).test(search);
                        if (pattern) {
                            utility.addClass(links[link], "hidden");
                        }
                    }
                }
            }
        }
    }

    private listenHighlightMenu() {
        ComponentManager.subscribe("menu.highlight", (event, target, data) => {
            const links = this.element.querySelectorAll("a." + data.menu);
            const category = utility.getHash(window.location.href);
            let hasCategory = false;
            let parentMenu: any;
            for (const link in links) {
                if (links.hasOwnProperty(link)) {
                    const activeClass = links[link].getAttribute("data-router-active-link-class");
                    const menuLink = links[link].getAttribute("href");
                    const menuCategory = utility.getHash(menuLink);
                    // reset menu state
                    utility.removeClass(links[link], activeClass);
                    if (category !== window.location.href &&
                        category === menuCategory) {
                        utility.addClass(links[link], activeClass);
                        hasCategory = true;
                    }

                    if (menuCategory === menuLink
                        || (menuLink === "#" && utility.hasClass(links[link], data.menu))
                    ) {
                        parentMenu = links[link];
                    }
                }
            }

            // if no category detected, highlight parent menu
            if (parentMenu && !hasCategory) {
                utility.addClass(parentMenu, parentMenu.getAttribute("data-router-active-link-class"));
            }
        });
    }

    private attachProduct() {
        const product = ComponentManager.getAttribute("product");
        const menus: NodeListOf<HTMLElement> = this.element.querySelectorAll(".attach-product");

        if (menus) {
            for (const key in menus) {
                if (menus.hasOwnProperty(key)) {
                    const menu: HTMLElement = menus[key];
                    let url = utility.removeHash(menu.getAttribute("href"));

                    if (product !== "mobile-entrypage") {
                        url = utility.addHash(url, product.replace("mobile-", ""));
                    }

                    menu.setAttribute("href", url);
                }
            }

        }
    }

    private attachProductToLogin() {
        const product = ComponentManager.getAttribute("product");
        const loginButton = this.element.querySelector(".login-trigger");
        const joinButton = this.element.querySelector(".join-btn");

        if (product !== "mobile-entrypage") {
            if (this.products && this.products.hasOwnProperty(product)) {
                const currentProduct = this.products[product];

                if (loginButton) {
                    loginButton.setAttribute(
                        "data-product-login-via",
                        currentProduct.login_via,
                    );
                    loginButton.setAttribute(
                        "data-product-reg-via",
                        currentProduct.reg_via,
                    );
                }
                if (joinButton) {
                    joinButton.setAttribute(
                        "href",
                        currentProduct.reg_via,
                    );
                }
            }
        } else {
            if (loginButton) {
                loginButton.setAttribute(
                    "data-product-login-via",
                    "",
                );
                loginButton.setAttribute(
                    "data-product-reg-via",
                    "",
                );
            }
            if (joinButton) {
                joinButton.setAttribute(
                    "href",
                    this.joinUrl,
                );
            }
        }
    }
}
