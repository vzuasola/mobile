import {ComponentManager} from "@plugins/ComponentWidget/asset/component";

import {AvayaModule} from "@app/src/Module/Avaya/script";
import {BalanceModule} from "@app/src/Module/Balance/script";
import {SessionModule} from "@app/src/Module/Session/script";

import {GameIntegrationModule} from "@app/src/Module/GameIntegration/script";
import {PASModule} from "@app/src/Module/GameIntegration/PAS/script";
import {LoginRedirectModule} from "@app/src/Module/LoginRedirect/script";

import {ProductIntegrationModule} from "@app/src/Module/ProductIntegration/script";
import {ALSIntegrationModule} from "@app/src/Module/ProductIntegration/ALS/script";
import {OWSportsIntegrationModule} from "@app/src/Module/ProductIntegration/OWSports/script";

ComponentManager.setModules({
    avaya: new AvayaModule(),
    balance: new BalanceModule(),
    session: new SessionModule(),
    game_integration: new GameIntegrationModule(),
    pas_integration: new PASModule(),
    login_redirect: new LoginRedirectModule(),
    product_integration: new ProductIntegrationModule(),
    owsports_integration: new OWSportsIntegrationModule(),
    als_integration: new ALSIntegrationModule(),
});
