import * as utility from "@core/assets/js/components/utility";

import { ComponentManager } from "@plugins/ComponentWidget/asset/component";

import { GameInterface } from "./game.interface";

class GameLauncher {
    private providers: { [name: string]: GameInterface } = {};

    /**
     *
     */
    setProvider(id: string, provider: GameInterface) {
        this.providers[id] = provider;
    }

    launch(provider: string, options: { [name: string]: string } = {}) {
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

        ComponentManager.subscribe("session.login", (event, src, data) => {
            this.onLogin(event, data.src);
        });

        ComponentManager.subscribe("session.logout", (event, src, data) => {
            this.invokeAll("logout");
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
        let loader = false;
        const el = utility.find(src, (element) => {
            if (utility.hasClass(src, "game-favorite", true)) {
                return false;
            }

            if (element.getAttribute("data-game-loader") === "true" &&
                element.getAttribute("data-game-launch") === "true"
            ) {
                loader = true;
                return true;
            }

            if (element.getAttribute("data-game-provider") &&
                element.getAttribute("data-game-launch") === "true"
            ) {
                return true;
            }
        });

        if (el) {
            const options = this.getOptionsByElement(el);
            if (!loader) {
                e.preventDefault();

                const provider = el.getAttribute("data-game-provider");

                options.provider = provider;
                this.invoke(provider, "prelaunch", [options]);
                this.invoke(provider, "launch", [options]);

                ComponentManager.broadcast("game.launch", {
                    src: el,
                });
            }

            if (loader) {
                ComponentManager.broadcast("game.launch.loader", {
                    options,
                });
            }
        }
    }

    /**
     *
     */
    private onLogin(e, src) {
        let loader = false;
        const el = utility.find(src, (element) => {
            if (element.getAttribute("data-game-loader") === "true") {
                loader = true;
                return true;
            }

            if (element.getAttribute("data-game-provider")) {
                return true;
            }
        });

        if (el) {
            const options = this.getOptionsByElement(el);
            if (!loader) {
                e.preventDefault();

                const provider = el.getAttribute("data-game-provider");
                options.provider = provider;

                this.launch(provider, options);

                ComponentManager.broadcast("game.launch", {
                    src: el,
                });
            }

            if (loader) {
                ComponentManager.broadcast("game.launch.loader", {
                    options,
                });
            }
        }
    }
}

const launcher = new GameLauncher();
export { launcher as GameLauncher };
