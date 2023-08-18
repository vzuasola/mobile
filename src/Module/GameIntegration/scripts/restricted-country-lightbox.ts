
import * as messageTemplate from "../handlebars/unsupported.handlebars";
import * as utility from "@core/assets/js/components/utility";
import {Modal} from "@app/assets/script/components/modal";

export class RestrictedCountryLightbox {
    private message: string;

    showMessage(response, modalName = "#restricted-country-lightbox") {
        const template = messageTemplate({
            title: response.title,
            message: response.message,
            button: response.button,
        });

        this.message = template;
        const modalEl = document.querySelector(modalName);

        if (modalEl) {
            modalEl.innerHTML = this.message;
            Modal.open(modalName);
        }
        this.listenClick();
    }

    listenClick() {
        utility.addEventListener(document, "click", (event, src) => {
            event = event || window.event;
            const target = event.target || event.srcElement;
            utility.preventDefault(event);

            if (utility.hasClass(target, "modal-close")) {
                window.close();
            }
        });
    }
}
