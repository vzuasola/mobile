import * as utility from "@core/assets/js/components/utility";

export class Loader {
    private loader;
    private opacity: number;

    constructor(private target, private overlay, opacity: number = 1) {
        this.loader = this.target.querySelector(".loader") || this.createLoader();
        this.opacity = opacity;
    }

    createLoader() {
        const loader = document.createElement("div");
        const container = document.createElement("div");
        let ray = "";

        for (let i = 0; i < 10; i++) {
            ray += '<div class="ray" id="ray-' + i + '"></div>';
        }

        container.innerHTML = ray;

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
