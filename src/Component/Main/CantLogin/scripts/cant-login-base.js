import * as utility from "Base/utility";

export default function CantLoginBase() {
    //
}

CantLoginBase.prototype.msgClass = "error-message";

CantLoginBase.prototype.messageMapping = function (key) {
    var config = app.settings.integrationError;
    return config[key];
};

/**
 * Show/display message
 *
 * @param Node parentElem parent element to insert message
 * @param String msg message to insert
 */
CantLoginBase.prototype.showMessage = function (parentElem, msg) {
    var oldMsgContainer = parentElem.querySelector("." + this.msgClass);

    createMessage.call(this, parentElem, msg);

    if (oldMsgContainer) {
        oldMsgContainer.remove();
    }
};

CantLoginBase.prototype.hideMessage = function (parentElem) {
    var msgContainer = parentElem.querySelector("." + this.msgClass);

    if (msgContainer) {
        msgContainer.remove();
    }
};

/**
 * Disable form elements
 *
 * @param Node form form tag element
 */
CantLoginBase.prototype.disableFields = function (form) {
    utility.forEach(form.elements, function (elem) {
        elem.readOnly = true;
    });

    showOverlay.call(this, form);
};

/**
 * Enable form elements
 *
 * @param Node form form tag element
 */
CantLoginBase.prototype.enableFields = function (form) {
    utility.forEach(form.elements, function (elem) {
        elem.readOnly = false;
    });

    hideOverlay.call(this, form);
};

/**
 * Show confirmation message
 *
 * @param Node form form tag element
 */
CantLoginBase.prototype.showConfirmationMessage = function (form) {
    var confirmationMessage = utility.findParent(form, "div").querySelector(".confirmation-message");

    form.style.opacity = "0";
    utility.removeClass(confirmationMessage, "hidden");

    // setTimout needed for fade transition
    setTimeout(function () {
        utility.addClass(form, "hidden");
        confirmationMessage.style.opacity = "1";
    }, 300);
};

/**
 * Private methods ========================================
 */
function createMessage(parentElem, msg) {
    var msgContainer = createElem("div", this.msgClass);

    msgContainer.appendChild(document.createTextNode(msg));

    parentElem.appendChild(msgContainer);

    return msgContainer;
}

function showOverlay(form) {
    var formOverlay = form.querySelector(".form-overlay");

    if (formOverlay) {
        utility.removeClass(formOverlay, "hidden");
    } else {
        formOverlay = createElem("div", "form-overlay");
        form.appendChild(formOverlay);
    }
}

function hideOverlay(form) {
    utility.addClass(form.querySelector(".form-overlay"), "hidden");
}

function createElem(tagName, className) {
    var element = document.createElement(tagName);
    utility.addClass(element, className || "");

    return element;
}
