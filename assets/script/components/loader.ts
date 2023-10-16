import * as utility from "@core/assets/js/components/utility";

export class Loader {
    private loader;
    private opacity: number;

    constructor(private target, private overlay, opacity: number = 1) {
        this.loader = this.target.querySelector(".loader") || this.createLoader();
        this.opacity = opacity;
    }

    createLoader() {
        const loader = document.querySelector(".loader");
        const container = document.querySelector(".loader-container");

        return loader;
    }

    show() {
        const opacity = this.opacity.toString();

        utility.removeClass(this.loader, "hidden");
        this.loader.style.background = `rgba(0, 0, 0, ${opacity})`;

        // set loader as overlay within component
        if (this.overlay) {
            utility.addClass(this.target, "loader-overlay");
            utility.removeClass(this.target, "dafa-loader");
        }

        this.target.appendChild(this.loader);
    }

    hide() {
        if (this.loader) {
            utility.addClass(this.loader, "hidden");
        }
    }

    remove() {
        if (this.overlay) {
            utility.removeClass(this.target, "loader-overlay");
            utility.removeClass(this.target, "dafa-loader");
        }

    }
}
