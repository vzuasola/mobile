import {ComponentInterface} from "@core/src/Plugins/ComponentWidget/asset/component";
import * as iconUpload from "@app/templates/handlebars/icon-upload.handlebars";

type TGenericEvent<T> = Event & { target: T };

export class DocumentsComponent implements ComponentInterface {

    onLoad(element: HTMLElement, attachments: {}) {
        console.log("loadDocumentComponentScript");
        this.init();
    }

    onReload(element: HTMLElement, attachments: {}) {
        console.log("reloadDocumentComponentScript");

    }

    private init() {
        const uploadFieldSelectors = [
            "DocumentsForm_first_upload",
            "DocumentsForm_second_upload",
            "DocumentsForm_third_upload",
        ].map((selector) => this.attachUploadFieldtoLabel(selector));
    }

    private attachUploadFieldtoLabel(selector: string) {
        const labelField = document.querySelector("." + selector + " label");

        // Add icon to label field
        labelField.querySelector(".document_upload_icon").innerHTML = iconUpload();

        document.querySelector("#" + selector).addEventListener("change", (e: TGenericEvent<HTMLInputElement>) => {
            labelField
                .querySelector(".document_upload_label_text")
                .textContent = `${e.target.value.replace(/.*[/\\]/, "")}`;
            // console.log(typeof event);
          });
    }

}
