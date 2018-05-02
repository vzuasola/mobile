import {Loader} from "@app/assets/script/components/loader";
import {Router, RouterClass} from "@plugins/ComponentWidget/asset/router";

const loader = new Loader(document.body, true);

Router.on(RouterClass.beforeNavigate, (event) => {
    loader.show();
});

Router.on(RouterClass.afterNavigate, (event) => {
    loader.hide();
});

Router.on(RouterClass.navigateError, (event) => {
    loader.hide();
});
