import * as utility from "@core/assets/js/components/utility";
import * as Handlebars from "handlebars/runtime";

import * as loaderTemplate from "@app/templates/components/loader.handlebars";
import {Router} from "@plugins/ComponentWidget/asset/router";

export class Loader {
    private loader;
    private opacity: number;

    constructor(private target, private overlay, opacity: number = 1) {
        this.loader = this.target.querySelector(".loader") || this.createLoader();
        this.opacity = opacity;
    }

    createLoader() {
        Handlebars.registerHelper("equals", function(value, compare, options) {
            if (value === compare) {
                return options.fn(this);
            }

            return options.inverse(this);
        });
        const loader = document.createElement("div");
        const container = document.createElement("div");

        container.innerHTML = loaderTemplate({lang: Router.getLanguage()});

        utility.addClass(container, "loader-container");
        utility.addClass(loader, "loader");

        loader.appendChild(container);

        return loader;
    }

    show() {
        const opacity = this.opacity.toString();

        utility.removeClass(this.loader, "hidden");
        this.loader.style.background = `rgba(0, 0, 0, ${opacity})`;

        // set loader as overlay within component
        if (this.overlay) {
            utility.addClass(this.target, "loader-overlay");
        }

        this.target.appendChild(this.loader);
    }

    hide() {
        if (this.loader) {
            utility.addClass(this.loader, "hidden");
        }
    }
}
