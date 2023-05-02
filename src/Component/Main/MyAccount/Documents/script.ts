import {ComponentInterface} from "@core/src/Plugins/ComponentWidget/asset/component";
import { Documents } from "./scripts/documents";

export class DocumentsComponent implements ComponentInterface {
    private documents;

    onLoad(element: HTMLElement, attachments: {}) {
        this.documents = new Documents(
            element,
            attachments,
        );
        this.documents.init();
    }

    onReload(element: HTMLElement, attachments: {}) {
        //
    }
}
