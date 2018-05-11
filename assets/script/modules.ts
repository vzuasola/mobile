import {ComponentManager} from "@plugins/ComponentWidget/asset/component";

import {BalanceModule} from "@app/src/Module/Balance/script";
import {ProductIntegrationModule} from "@app/src/Module/ProductIntegration/script";
import {SessionModule} from "@app/src/Module/Session/script";

ComponentManager.setModules({
    balance: new BalanceModule(),
    product_integration: new ProductIntegrationModule(),
    session: new SessionModule(),
});
