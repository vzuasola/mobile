import {FormBase} from "@app/assets/script/components/form-base";
import * as iconUpload from "@app/templates/handlebars/icon-upload.handlebars";
import * as iconAtt from "@app/templates/handlebars/icon-att.handlebars";
import * as iconOk from "@app/templates/handlebars/icon-ok.handlebars";
import validators from "@app/assets/script/components/validation/rules";
import * as loader from "../handlebars/loader.handlebars";
import CustomSelect from "@core/assets/js/components/custom-select";
import {Router} from "@plugins/ComponentWidget/asset/router";
import * as xhr from "@core/assets/js/vendor/reqwest";
import Storage from "@core/assets/js/components/utils/storage";

type TGenericEvent<T> = Event & { target: T };

/**
 * ValidationErrors contains an object of the form
 *
 *  {
 *      field_key: { ruleA: "Error message", ruleB: "Error message two" },
 *  }
 *
 * For example
 *
 *  {
 *      DocumentsForm_first_upload: {uploadFieldRequired: "Please select a file"},
 *      DocumentsForm_purpose: {purposeRequired: "Please select an opt…"}
 *  }
 */
interface ValidationErrors {
    [key: string]: {
        [key: string]: string;
    };
}

/**
 * Documents
 *
 * @param element Node element component parent element
 * @param arguments Object attachments
 */
export class Documents extends FormBase {
    private validatorErrors: ValidationErrors;
    private form: HTMLFormElement;
    private purposeField: HTMLSelectElement;
    private commentField: HTMLTextAreaElement;
    private documentClosed: HTMLLinkElement;
    private documentshowStatus: HTMLLinkElement;
    private validators;
    private storage: Storage;

    constructor(element: HTMLElement, attachments: {}) {
        super(element, attachments);
        this.validatorErrors = {};
    }

    init() {
        this.form = this.element.querySelector(".documents-form");
        this.purposeField = this.form.querySelector("#DocumentsForm_purpose");
        this.commentField = this.form.querySelector("#DocumentsForm_comment");
        this.documentClosed = document.querySelector(".document-status-close");
        this.documentshowStatus = document.querySelector(".document-tab");
        this.validators = validators;
        this.storage = new Storage();

        // Initialise custom select UI
        CustomSelect();

        this.handleCustomValidation();

        const loaderTemplate = loader({});

        // Generic Error Message
        const documentGenericError = this.attachments.genericError;

        // Configure upload field logic
        const uploadFieldSelectors = [
            "DocumentsForm_first_upload",
            "DocumentsForm_second_upload",
            "DocumentsForm_third_upload",
        ].map((selector) => this.attachUploadFieldLogic(selector));

        // Add required class to first upload field
        this.form.querySelector(".DocumentsForm_first_upload").classList.add("field_required");

        // Comment field charcount
        const counterDiv = document.createElement("div");
        counterDiv.classList.add("comment_charcount");
        this.commentField.parentNode.append(counterDiv);
        this.commentCharCountCallback(this.commentField);

        this.commentField.addEventListener(
            "input",
            (e: TGenericEvent<HTMLTextAreaElement>) => { this.commentCharCountCallback(e.target); },
        );

        // Add blurb next to comment title
        const commentMarkup = this.form.querySelector(".DocumentsForm_comment_markup");
        commentMarkup.innerHTML = "<span class='comment_field_title'>" + commentMarkup.innerHTML + "</span>";

        const blurbDiv = document.createElement("div");
        blurbDiv.classList.add("comment_blurb");
        blurbDiv.innerText = "(" + this.commentField.dataset.blurb + ")";
        commentMarkup.appendChild(blurbDiv);

        // Add placeholder to comment field
        this.commentField.placeholder = this.commentField.dataset.placeholder;

        // Add success/error icon to comment markup
        const commentMarkupErrorDiv = document.createElement("div");
        commentMarkupErrorDiv.classList.add("field_status_icon");
        commentMarkup.append(commentMarkupErrorDiv);

        if (this.attachments.documentStatus === true) {
            const disableField = document.querySelector(".DocumentsForm_purpose");
            disableField.classList.add("form-disabled");
            this.disableattrFields(this.form);
        }

        // Configure Purpose field logic
        // Change Comment Field P/holder depending on selection
        /// Check if an actual selection has been made
        this.purposeField.addEventListener(
            "change",
            (e: TGenericEvent<HTMLSelectElement>) => {
                this.purposeFieldRequiredCallback(e.target);
                this.commentFieldRequiredCallback(this.commentField);
                if (e.target.value !== "") {
                    this.form.querySelector(".select-selected").classList.add("text-bold");
                } else {
                    this.form.querySelector(".select-selected").classList.remove("text-bold");
                }
            },
        );

        // Commend field logic
        // Checks if comment field is required and if yes if it contains text
        this.commentField.addEventListener(
            "input",
            (e: TGenericEvent<HTMLTextAreaElement>) => {
                this.commentFieldRequiredCallback(e.target);
                this.handleCommentFieldIcon();
            },
        );

        this.documentClosed && this.documentClosed.addEventListener(
            "click",
            (e: TGenericEvent<HTMLLinkElement>) => {
                e.preventDefault();
                const closeButton = this.element.querySelector(".document-status");
                if (closeButton) {
                    closeButton.classList.add("hidden");
                }
            },
        );

        this.documentshowStatus && this.documentshowStatus.addEventListener(
            "click",
            (e: TGenericEvent<HTMLLinkElement>) => {
                e.preventDefault();
                const closeButton = this.element.querySelector(".document-status");
                closeButton.classList.remove("hidden");
            },
        );

        // Submission Logic
        this.form.addEventListener(
            "submit",
            (e: TGenericEvent<HTMLFormElement>) => {
                e.preventDefault();
                // Cleanup Previous error message
                this.resetValidatorErrorMessage();

                // Show loader icon in submit button
                const prevContent = this.form.querySelector("#DocumentsForm_submit").innerHTML;
                this.form.querySelector("#DocumentsForm_submit").innerHTML = loaderTemplate;

                // Run all validation rules
                this.purposeFieldRequiredCallback(this.purposeField);
                this.commentFieldRequiredCallback(this.commentField);

                this.uploadFieldRequired(this.form.querySelector("#DocumentsForm_first_upload"));

                if (Object.keys(this.validatorErrors).length > 0) {

                    this.form.querySelector("#DocumentsForm_submit").innerHTML = prevContent;

                    this.errorMessage(documentGenericError);

                    return;
                }

                const formData = new FormData();
                formData.append(
                    "DocumentsForm_first_upload",
                    (document.querySelector("#DocumentsForm_first_upload") as HTMLInputElement).files[0],
                );
                formData.append(
                    "DocumentsForm_second_upload",
                    (document.querySelector("#DocumentsForm_second_upload") as HTMLInputElement).files[0],
                );
                formData.append(
                    "DocumentsForm_third_upload",
                    (document.querySelector("#DocumentsForm_third_upload") as HTMLInputElement).files[0],
                );
                formData.append(
                    "DocumentsForm_purpose",
                    (document.querySelector("#DocumentsForm_purpose") as HTMLInputElement).value,
                );
                formData.append(
                    "DocumentsForm_comment",
                    (document.querySelector("#DocumentsForm_comment") as HTMLInputElement).value,
                );

                xhr({
                    url: Router.generateRoute("documents", "documentUpload"),
                    type: "json",
                    method: "post",
                    crossOrigin: true,
                    processData: false,
                    data: formData,
                })
                .then((resp) => {
                    if (resp.status !== "success") {
                        this.errorMessage(resp.message);
                        return;
                    }

                    this.storage.set("DocUploadSuccessMessage", this.attachments.submit_success);
                    Router.navigate("", ["*"]);
                })
                .fail((err, msg) => {
                    this.errorMessage(documentGenericError);
                }).
                always((err, msg) => {
                    this.form.querySelector("#DocumentsForm_submit").innerHTML = prevContent;
                });
            },
        );

    }

    private resetValidatorErrorMessage() {
        const prevErrorMsgElement = this.form.querySelector(".DocumentsForm_comment_error");
        if (prevErrorMsgElement) {
            prevErrorMsgElement.remove();
        }
    }

    private errorMessage(documentGenericError) {
        const commentErrormsg = document.createElement("div");
        commentErrormsg.classList.add("DocumentsForm_comment_error");

        const commentErrorMsgContent = document.createElement("span");
        commentErrorMsgContent.classList.add("DocumentsForm_comment_error_text");
        commentErrorMsgContent.innerHTML = documentGenericError;

        commentErrormsg.appendChild(commentErrorMsgContent);

        this.form.querySelector(".DocumentsForm_comment").after(commentErrormsg);
    }

    // Check if user selected the placeholder option in purpose dropdown
    private purposeFieldRequiredCallback(el: HTMLSelectElement) {
        if (el.value === "") {
            this.validatorErrors.DocumentsForm_purpose = { purposeRequired: el.dataset.required_error };
            return;
        }

        // Verification successful, delete old errors
        if (this.validatorErrors.DocumentsForm_purpose) {
            delete this.validatorErrors.DocumentsForm_purpose.purposeRequired;
        }
        this.cleanupValidation("DocumentsForm_purpose");
    }

    // Check if user added comment
    private commentFieldRequiredCallback(el: HTMLTextAreaElement) {
        if (el.value === "") {
            this.validatorErrors.DocumentsForm_comment = { commentFieldRequired: el.dataset.required_error };
            return;
        }
        // Verification successfull, delete old errors
        if (this.validatorErrors.DocumentsForm_comment) {
            delete this.validatorErrors.DocumentsForm_comment.commentFieldRequired;
        }

        this.cleanupValidation("DocumentsForm_comment");
    }
    private commentCharCountCallback(el: HTMLTextAreaElement) {
        const limit = el.dataset.character_count_limit;
        const charactersLeft = el.dataset.character_count_text;
        const currCount = +limit - el.value.length;
        this.form.querySelector(".comment_charcount").innerHTML = charactersLeft + " " + currCount + "/" + limit;
    }

    private handleCommentFieldIcon() {
        // Change icon
        const keyErrors = this.validatorErrors.DocumentsForm_comment;
        const iconDiv = this.form.querySelector(".DocumentsForm_comment_markup .field_status_icon");
        // The icon for the comment field should only
        // be shown if the regex validation (Only specific chars allowed) fails
        if (keyErrors && keyErrors.regex) {
            iconDiv.innerHTML = iconAtt();
            return;
        }
        iconDiv.innerHTML = "";
    }

    // Check if user has uploaded a file
    private uploadFieldRequired(el: HTMLInputElement) {
        if (el.value === "") {
            this.validatorErrors[el.id] = { uploadFieldRequired: el.dataset.error_required };
            return;
        }
        if (this.validatorErrors[el.id]) {
            delete this.validatorErrors[el.id].uploadFieldRequired;
        }

        this.cleanupValidation(el.id);

    }

    private cleanupValidation(fieldKey: string) {
        const keyErrors = this.validatorErrors[fieldKey];

        if (keyErrors && Object.keys(keyErrors).length === 0) {
            delete this.validatorErrors[fieldKey];
        }
    }

    private cleanupAllValidations() {
        Object.keys(this.validatorErrors).forEach((fieldKey) => {
            this.cleanupValidation(fieldKey);
        });
    }

    // Used to loop through multiple upload fields and attach logic to them
    private attachUploadFieldLogic(selector: string) {
        const parentField = document.querySelector("." + selector );
        const labelField = parentField.querySelector("label");
        const statusIconFIeld = parentField.querySelector(".field_status_icon");
        const inputField = parentField.querySelector("#" + selector);
        const labelText = labelField.querySelector(".field_label_text");

        // Add icon to label field
        labelField.querySelector(".field_label_icon").innerHTML = iconUpload();

        labelText.textContent = (inputField as HTMLInputElement).dataset.placeholder;

        // listen(inputField, "change", (e: TGenericEvent<HTMLInputElement>) => {
        inputField.addEventListener("change", (e: TGenericEvent<HTMLInputElement>) => {

            if (!this.validatorErrors[selector]) {
                this.validatorErrors[selector] = {};
            }

            // Validate file extensions
            const allowedExtensions = e.target.dataset
                .allowed_file_extensions
                .split(",")
                .map((ext) => {
                    return ext.trim().toLowerCase();
                });
            const currExtension = e.target.files[0].name
                .split(".")
                .pop()
                .toLocaleLowerCase();

            if (allowedExtensions.indexOf(currExtension) === -1) {
                statusIconFIeld.innerHTML = iconAtt();
                const error = e.target.dataset.error_extension + " " + e.target.dataset.allowed_file_extensions;
                labelText.textContent = error;
                this.validatorErrors[selector].fileExtensionError = error ;
                return;
            }
            // Validation didn't fail, delete previous errors
            if (this.validatorErrors[selector]) {
                delete this.validatorErrors[selector].fileExtensionError;
            }

            // Validate File Size
            const maxSize = parseInt(
                e.target.dataset.maximumImageSize.replace(/\D/g, ""), // Remove any non-digit characters (eg MB)
                10,
                ) * 1024 * 1024; // Convert from MB to B

            if (e.target.files[0].size > maxSize) {
                statusIconFIeld.innerHTML = iconAtt();
                const error = e.target.dataset.error_size + " " + e.target.dataset.maximumImageSize;
                labelText.textContent = error;
                this.validatorErrors[selector].fileSizeError = error;
                return;
            }
            // Validation didn't fail, delete previous errors
            if (this.validatorErrors[selector]) {
                delete this.validatorErrors[selector].fileSizeError;
            }

            // Validation ok - Set Icon to OK and Label Value to selected filename
            statusIconFIeld.innerHTML = iconOk();
            labelText.textContent = `${e.target.value.replace(/.*[/\\]/, "")}`;
            // Cleanup old validator errors
            this.cleanupValidation(selector);

          });
    }

    // Handling from custom validation added via CMS Backend
    private handleCustomValidation() {
        // All CMS validation logic is added to a data-validation attribute on the root form element
        const fields = JSON.parse(this.form.dataset.validations).DocumentsForm;

        // Loop through all fields
        for (const field of Object.keys(fields)) {

            const key = "DocumentsForm_" + field; // Key to ID field/rule combination
            const element = this.form.querySelector("#" + key) as HTMLInputElement;
            // Loop through all rules for each field
            for (const rule of Object.keys(fields[field].rules)) {

                // Callbacks are defined without the "callback_" prefix in the rules file
                const callbackName = rule.replace("callback_", "");

                // Grab the callback function for the specific rule
                const validator = this.validators[callbackName].callback;

                const ruleObject = fields[field].rules[rule];

                if (!validator) {
                    console.log("Could not find validator", rule);
                    continue;
                }

                // Add an onChange event listener for the specific element and callback
                element.addEventListener(
                    "input",
                    (e: TGenericEvent<HTMLInputElement>) => {

                        // Run the validator using the changed value, the arguments as set by the CMS
                        // and a reference to the element triggering the event
                        if (!validator(e.target.value , ruleObject.arguments, element)) {

                            // Validator failed, add an error message to the validatorErrors array
                            if (Object.keys(this.validatorErrors).indexOf(key) === -1 ) {
                                this.validatorErrors[key] = {};
                            }
                            this.validatorErrors[key][callbackName] = ruleObject.message;
                            return;

                        }
                        // Validation didn't fail, delete previous errors
                        if (this.validatorErrors[key]) {
                            delete this.validatorErrors[key][callbackName];
                        }
                        this.cleanupAllValidations();
                    },
                );

            }
        }
    }

}
