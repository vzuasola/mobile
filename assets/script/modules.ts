import {ComponentManager} from "@plugins/ComponentWidget/asset/component";

import {BalanceModule} from "@app/src/Module/Balance/script";
import {SessionModule} from "@app/src/Module/Session/script";

ComponentManager.setModules({
    balance: new BalanceModule(),
    session: new SessionModule(),
});
