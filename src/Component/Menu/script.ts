import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";

import {ComponentInterface, ComponentManager} from "@plugins/ComponentWidget/asset/component";
import {Router, RouterClass} from "@plugins/ComponentWidget/asset/router";

import {Menu} from "./scripts/menu";
import {PushNotification} from "./scripts/push-notification";

import EqualHeight from "@app/assets/script/components/equal-height";
import {Redirector} from "@app/assets/script/components/redirector";

/**
 *
 */
export class MenuComponent implements ComponentInterface {
    private pushNotification: PushNotification;

    private element: HTMLElement;
    private isLogin: boolean;
    private products: any[];
    private joinUrl: string;
    private product: string;
    private language: string;

    constructor() {
        this.pushNotification = new PushNotification();
    }

    onLoad(element: HTMLElement, attachments: {authenticated: boolean, join_now_url: string, products: any[]}) {
        this.element = element;
        this.language = ComponentManager.getAttribute("language");
        this.equalizeProductHeight();
        this.equalizeQuicklinksHeight();
        this.toggleLogoutLink();
        this.isLogin = attachments.authenticated;
        this.products = attachments.products;
        this.joinUrl = attachments.join_now_url;

        this.activateMenu(element);
        this.attachProduct();
        this.attachProductToLogin();

        this.reloadBalance();
        this.pushNotification.handleOnLoad(element, attachments);

        this.listenAnnouncementCount();
        this.listenHighlightMenu();

        ComponentManager.subscribe("session.prelogin", (event, src, data) => {
            this.isLogin = true;
        });

        ComponentManager.subscribe("session.logout", (event) => {
            this.isLogin = false;
        });

        Router.on(RouterClass.afterNavigate, (event) => {
            this.attachProduct();
            this.attachProductToLogin();
            this.reloadBalance();
        });

    }

    onReload(element: HTMLElement, attachments: {authenticated: boolean, join_now_url: string, products: any[]}) {
        this.element = element;
        this.equalizeProductHeight();
        this.equalizeQuicklinksHeight();
        this.products = attachments.products;
        this.joinUrl = attachments.join_now_url;

        this.activateMenu(element);
        this.attachProduct();
        this.attachProductToLogin();

        this.reloadBalance();
        this.pushNotification.handleOnLoad(element, attachments);
    }

    private menuReady() {
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
        this.menuListenOnClick();
    }

    private menuListenOnClick() {
        ComponentManager.subscribe("click", (event, src, data) => {
            const el = utility.hasClass(src, "lgc", true);
            if (el) {
                event.preventDefault();
                Redirector.redirect(el.getAttribute("href"), false, {
                    target: el.getAttribute("target"),
                });
            }
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
        ComponentManager.broadcast("balance.return", {
            success: (response) => {
                if (this.isLogin && typeof response.balance !== "undefined") {
                    const headerBalance = this.element.querySelector(".mobile-menu-amount");
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

    private listenHighlightMenu() {
        ComponentManager.subscribe("menu.highlight", (event, target, data) => {
            const menu = this.element.querySelector("a." + data.menu);
            const activeClass = menu.getAttribute("data-router-active-link-class");
            if (menu && !utility.hasClass(menu, activeClass)) {
                utility.addClass(menu, activeClass);
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
