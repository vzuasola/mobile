import "../../sass/components/_optin-form.scss";

import * as utility from "@core/assets/js/components/utility";
import {Validator} from "@app/assets/script/components/validation/validator";
import optinCountryAreaCode from "@app/assets/script/components/optin/optin-country-code";

var validator = new Validator();
validator.init();

utility.ready(function () {
    optinCountryAreaCode();
});
