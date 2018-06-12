import * as utility from "@core/assets/js/components/utility";

import {ComponentManager} from "@plugins/ComponentWidget/asset/component";

import {GameInterface} from "./game.interface";

export class GameLauncher {
    private providers: {[name: string]: GameInterface} = {};

    /**
     *
     */
    setProvider(id: string, provider: GameInterface) {
        this.providers[id] = provider;
    }

    launch(provider: string, options: {[name: string]: string} = {}) {
        options.provider = provider;

        this.invoke(provider, "prelaunch", [options]);
        this.invoke(provider, "launch", [options]);
    }

    /**
     *
     */
    init() {
        this.bindEvents();
        this.activateLoginHooks();
    }

    /**
     *
     */
    private bindEvents() {
        utility.ready(() => {
            this.invokeAll("init");
        });

        ComponentManager.subscribe("click", (event, src) => {
            this.onClick(event, src);
        });
    }

    private activateLoginHooks() {
        setTimeout(() => {
            for (const key in this.providers) {
                if (this.providers.hasOwnProperty(key) &&
                    typeof this.providers[key].login === "function"
                ) {
                    const provider = this.providers[key];

                    ComponentManager.broadcast("session.events.push", {
                        event: (username, password) => {
                            return provider.login(username, password);
                        },
                    });
                }
            }
        }, 100);
    }

    /**
     *
     */
    private invoke(id: string, method: string, args: any = []) {
        if (typeof this.providers[id][method] === "function") {
            this.providers[id][method].apply(this.providers[id], args);
        }
    }

    /**
     *
     */
    private invokeAll(method: string, args: any = []) {
        for (const key in this.providers) {
            if (typeof this.providers[key][method] === "function") {
                this.providers[key][method].apply(this.providers[key], args);
            }
        }
    }

    /**
     *
     */
    private getOptionsByElement(element) {
        const options: any = {};
        const attributes = utility.getAttributes(element);

        for (const attr in attributes) {
            if (attr.indexOf("data-game", 0) === 0) {
                const key = attr.replace("data-game-", "");
                options[key] = attributes[attr];
            }
        }

        return options;
    }

    /**
     *
     */
    private onClick(e, src) {
        if (src.getAttribute("data-game-launch") === "true" &&
            src.getAttribute("data-game-provider")
        ) {
            const provider = src.getAttribute("data-game-provider");
            const options = this.getOptionsByElement(src);

            options.provider = provider;

            this.invoke(provider, "prelaunch", [options]);
            this.invoke(provider, "launch", [options]);
        }
    }
}
