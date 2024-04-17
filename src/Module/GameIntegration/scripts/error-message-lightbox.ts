
import * as messageTemplate from "../handlebars/unsupported.handlebars";
import * as utility from "@core/assets/js/components/utility";
import {ComponentManager} from "@plugins/ComponentWidget/asset/component";
import {Modal} from "@app/assets/script/components/modal";

export class ErrorMessageLightbox {
    private message: string;

    showMessage(response, modalName = "#error-message-lightbox") {
        const content = "<p>" + response.errors.errorCode + "</p>";
        const template = messageTemplate({
            title: "",
            message: content,
            button: response.errors.errorButton,
        });

        this.message = template;
        const categoriesEl = document.querySelector(modalName);

        if (categoriesEl) {
            categoriesEl.innerHTML = this.message;
            Modal.open(modalName);
        }
        this.listenClick(categoriesEl);
    }

    listenClick(element) {
        utility.addEventListener(document, "click", (event, src) => {
            event = event || window.event;
            const target = event.target || event.srcElement;

            if (utility.hasClass(target, "modal-close")) {
                utility.preventDefault(event);
                window.close();
            }
        });
    }
}
