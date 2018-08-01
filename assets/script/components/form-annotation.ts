import * as utility from "@core/assets/js/components/utility";

export const annotation = (element: HTMLElement) => {
    const fields = element.querySelectorAll("[data-annotation]");

    if (fields) {
        utility.forEach(fields, (elem) => {
            // Add annotation on focus
            utility.listen(elem, "focus", () => {
                if (!elem.hasAttribute("data-annotation-weak") || !elem.hasAttribute("data-annotation-average")) {
                    const span = document.createElement("span");
                    span.className = "form-annotation";
                    span.innerHTML = elem.getAttribute("data-annotation");

                    // Insert to DOM
                    elem.parentNode.insertBefore(span, elem.nextSibling);
                }
            });

            // Remove annotation on Blur
            utility.listen(elem, "blur", () => {
                const formAnnotation = utility.findSibling(elem, ".form-annotation");

                if (formAnnotation) {
                    elem.parentNode.removeChild(formAnnotation);
                }
            });
        });
    }
};
