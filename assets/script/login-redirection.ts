import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";

import {ComponentManager} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@plugins/ComponentWidget/asset/router";

ComponentManager.subscribe("session.login", (event, target, data: any) => {
    if (data && typeof data.src !== "undefined") {
        const el = utility.hasClass(data.src, "product-integration", true);
        const el2 = utility.hasClass(data.src, "casino-option-trigger", true);

        if (!el && !el2) {
            const srcComponent = data.src.getAttribute("src-component");
            const product = data.src.getAttribute("product-id");
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
