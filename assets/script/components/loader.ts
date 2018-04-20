import * as utility from '@core/assets/js/components/utility';

export class Loader {
    private loader;

    constructor(private target, private overlay) {
        this.loader = this.target.querySelector('.loader') || this.createLoader();
    }

    createLoader() {
        let loader = document.createElement('div');
        let container = document.createElement('div');
        let ray = '';

        for (let i = 0; i < 10; i++) {
            ray += '<div class="ray" id="ray-' + i + '"></div>';
        }

        container.innerHTML = ray;

        utility.addClass(container, 'loader-container');
        utility.addClass(loader, 'loader');

        loader.appendChild(container);

        return loader;
    }

    show() {
        utility.removeClass(this.loader, 'hidden');

        // set loader as overlay within component
        if (this.overlay) {
            utility.addClass(this.target, "loader-overlay");
        }

        this.target.appendChild(this.loader);
    }

    hide() {
        if (this.loader) {
            utility.addClass(this.loader, 'hidden');
        }
    }
}
