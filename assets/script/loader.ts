import {Loader} from "@app/assets/script/components/loader";
import {Router, RouterClass} from "@plugins/ComponentWidget/asset/router";
import {ComponentManager} from "@core/src/Plugins/ComponentWidget/asset/component";

const loader = new Loader(document.body, true);

document.body.setAttribute("style", "");
loader.show();

ComponentManager.subscribe("components.finish", () => {
    setTimeout(() => {
        loader.hide();
    }, 400);
});

Router.on(RouterClass.beforeNavigate, (event) => {
    loader.show();
});

Router.on(RouterClass.afterNavigate, (event) => {
    loader.hide();
});

Router.on(RouterClass.navigateError, (event) => {
    loader.hide();
});
