import * as utility from "@core/assets/js/components/utility";

export const annotation = (element: HTMLElement) => {
    const fields = element.querySelectorAll("[data-annotation]");

    if (fields) {
        utility.forEach(fields, (elem) => {
            // Add annotation on focus
            utility.listen(elem, "focus", () => {
            if (elem.hasAttribute("data-annotation") &&
                (!elem.hasAttribute("data-annotation-weak") ||
                !elem.hasAttribute("data-annotation-average"))
            ) {
                    const span = document.createElement("span");
                    span.className = "form-annotation";
                    span.innerHTML = elem.getAttribute("data-annotation");

                    // Insert to DOM

                    if (elem.hasAttribute("data-parent-annotation")) {
                        let elemParent = elem.getAttribute("data-parent-annotation");
                        elemParent = document.querySelector(elemParent);

                        if (elemParent !== null) {
                            span.className = "form-annotation transfer-form-annotation";
                            elemParent.parentNode.insertBefore(span, elemParent.nextSibling);
                        }
                    } else {
                        elem.parentNode.insertBefore(span, elem.nextSibling);
                    }

                }
            });

            // Remove annotation on Blur
            utility.listen(elem, "blur", () => {
                const formAnnotation = utility.findSibling(elem, ".form-annotation");
                if (formAnnotation) {
                   elem.parentNode.removeChild(formAnnotation);
                }

                if (elem.hasAttribute("data-parent-annotation")) {
                    const elemParent = document.querySelector(elem.getAttribute("data-parent-annotation"));
                    const parentAnnotation = utility.findSibling(elemParent, ".form-annotation");

                    if (parentAnnotation) {
                        elemParent.parentNode.removeChild(parentAnnotation);
                    }
                }
            });
        });
    }
};
