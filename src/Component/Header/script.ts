import * as utility from "@core/assets/js/components/utility";

import {ComponentInterface, ComponentManager} from "@plugins/ComponentWidget/asset/component";
import {Router, RouterClass} from "@plugins/ComponentWidget/asset/router";

/**
 *
 */
export class HeaderComponent implements ComponentInterface {
    private element: HTMLElement;
    private attachments: any;

    onLoad(element: HTMLElement, attachments: { authenticated: boolean, products: any[]}) {
        this.element = element;
        this.attachments = attachments;
        this.attachProduct();
        this.refreshBalance();

        Router.on(RouterClass.afterNavigate, (event) => {
            if (this.attachments.authenticated) {
                const wrapper = this.element.querySelector(".account-balance");
                const link = wrapper.querySelector("a");
                const loader = wrapper.querySelector("div");

                utility.addClass(link, "hidden");
                utility.removeClass(loader, "hidden");

                this.refreshBalance();
            } else {
                this.attachProduct();
            }
        });
    }

    onReload(element: HTMLElement, attachments: { authenticated: boolean, products: any[]}) {
        this.element = element;
        this.attachments = attachments;
        this.attachProduct();
        this.refreshBalance();
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

                            if (response.map.hasOwnProperty(product) && response.map[product] !== 0) {
                                balance.innerHTML = Number(response.balances[response.map[product]]).toFixed(2);
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

        if (product !== "mobile-entrypage" && loginButton) {
            if (this.attachments.products.hasOwnProperty(product)) {
                const currentProduct = this.attachments.products[product];

                loginButton.setAttribute(
                    "data-product-login-via",
                    currentProduct.field_product_login_via[0].value,
                );
                loginButton.setAttribute(
                    "data-product-reg-via",
                    currentProduct.field_registration_url[0].value,
                );
            }
        }
    }
}
