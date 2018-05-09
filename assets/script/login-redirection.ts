import * as utility from "@core/assets/js/components/utility";

import * as xhr from "@core/assets/js/vendor/reqwest";

import {Router} from "@plugins/ComponentWidget/asset/router";

utility.listen(document, "session.login", (event, target, data) => {
    if (data) {
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
               window.location.href = response.lobby_url;
           }
        }).fail((error, message) => {
          // do something
        });
    }
});
