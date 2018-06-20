import Storage from "@core/assets/js/components/utils/storage";

/**
 *
 */
export class Profiler {
    private storage: Storage;
    private element: any;

    constructor() {
        this.storage = new Storage();
    }

    setElement(element) {
        this.element = element;

        if (localStorage.getItem("profiler.tab.state") === "full") {
            this.compactBar("full");
        } else {
            this.compactBar("compact");
        }
    }

    push(value) {
        const wrapper = this.element.querySelector("#profiler-content-console .console-wrapper");
        const span = document.createElement("p");

        span.innerHTML = value;

        wrapper.appendChild(span);
    }

    clear() {
        const src: any = event.srcElement;
        const wrapper = src.parentNode.parentNode.querySelector(".console-wrapper");

        wrapper.innerHTML = "";
    }

    pushGroup(group, value) {
        const id = group.toLowerCase().replace(/ /g, "-");
        const groupWrapper = this.element.querySelector(".console-extra-group");

        let wrapper = this.element.querySelector("#profiler-content-console-" + id + " .console-wrapper");

        if (!wrapper) {
            // create button
            const button = this.element.querySelector("#profiler-content-btn").cloneNode(true);

            button.setAttribute("id", "profiler-content-btn-" + id);
            button.setAttribute("onclick", `window.profiler.showBar("#profiler-content-console-${id}")`);
            button.innerHTML = group;

            groupWrapper.appendChild(button);

            // create wrapper
            const instance = this.element.querySelector("#profiler-content-console").cloneNode(true);

            instance.setAttribute("id", "profiler-content-console-" + id);
            instance.querySelector(".label").innerHTML = group;
            instance.querySelector(".profiler-clear").setAttribute("onclick", `window.profiler.clear(${group})`);
            instance.querySelector(".profiler-clear").setAttribute("data-profiler-group", group);
            instance.querySelector(".console-wrapper").innerHTML = "";

            groupWrapper.appendChild(instance);

            wrapper = instance.querySelector(".console-wrapper");
        }

        const span = document.createElement("p");

        span.innerHTML = value;

        wrapper.appendChild(span);
    }

    showBar(target) {
        const element = this.element.querySelector(target);
        const tabs = this.element.querySelectorAll(".profiler-content");

        if (element) {
            if (element.style.display === "none") {
                element.style.display = "block";
            } else {
                element.style.display = "none";
            }
        }

        if (tabs) {
            for (const el of tabs) {
                if (el !== element) {
                    el.style.display = "none";
                }
            }
        }
    }

    compactBar(state) {
        if (state === "full") {
            this.storage.set("profiler.tab.state", "full");

            this.element.querySelector(".profiler-tab.compact").style.display = "none";
            this.element.querySelector(".profiler-tab.full").style.display = "block";
        } else {
            this.storage.set("profiler.tab.state", "compact");

            this.element.querySelector(".profiler-tab.compact").style.display = "block";
            this.element.querySelector(".profiler-tab.full").style.display = "none";
        }
    }
}
