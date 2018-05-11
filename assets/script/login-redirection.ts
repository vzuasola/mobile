import {ComponentManager} from "@plugins/ComponentWidget/asset/component";

import * as utility from "@core/assets/js/components/utility";

import * as xhr from "@core/assets/js/vendor/reqwest";

import {Router} from "@plugins/ComponentWidget/asset/router";

ComponentManager.subscribe("session.login", (event, target, data) => {
    if (data) {
        const el = utility.hasClass(data, "product-integration", true);
        if (!el) {
            const product = data.getAttribute("product-id");
            const srcComponent = data.getAttribute("src-component");

            const component = (srcComponent  === "menu") ? "header_menu" : "home_products";
            xhr({
                url: Router.generateRoute(component, "lobby"),
                type: "json",
                method: "post",
                data: {
                    product,
                },
            }).then((response) => {
                if (response.lobby_url) {
                    if (utility.isExternal(response.lobby_url)) {
                        window.location.href = response.lobby_url;
                    } else {
                        Router.navigate(response.lobby_url, ["header", "main"]);
                    }
                }
            }).fail((error, message) => {
                // do something
            });
        }
    }
});
