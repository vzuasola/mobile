import * as utility from "@core/assets/js/components/utility";

export const annotation = (element: HTMLElement) => {
    const fields = element.querySelectorAll("[data-annotation]");

    if (fields) {
        utility.forEach(fields, (elem) => {
            // Add annotation on focus
            utility.addEventListener(elem, "focus", () => {
                const span = document.createElement("span");
                span.className = "form-annotation";
                span.innerHTML = elem.getAttribute("data-annotation");

                // Insert to DOM
                elem.parentNode.insertBefore(span, elem.nextSibling);
            });

            // Remove annotation on Blur
            utility.addEventListener(elem, "blur", () => {
                if (utility.findSibling(elem, ".form-annotation")) {
                    elem.parentNode.removeChild(document.querySelector(".form-annotation"));
                }
            });
        });
    }
};
