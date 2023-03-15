<?php

namespace App\MobileEntry\Component\Main\MyAccount;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class MyAccountComponent implements ComponentWidgetInterface
{

    /**
     * Form Fetcher Object
     */
    private $formManager;

    /**
     * Config Fetcher object.
     */
    private $configFetcher;

    /**
     * user Fetcher Object
     */
    private $userFetcher;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('form_manager'),
            $container->get('config_fetcher'),
            $container->get('user_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($formManager, $configFetcher, $userFetcher)
    {
        $this->formManager = $formManager;
        $this->configFetcher = $configFetcher->withProduct('account');
        $this->userFetcher = $userFetcher;
    }

    /**
     * {@inheritdoc}
     */
    public function getTemplate()
    {
        return '@component/Main/MyAccount/template.html.twig';
    }

    /**
     * {@inheritdoc}
     */
    public function getData()
    {
        $myAccountConfigV2 = $this->configFetcher->getConfig('my_account_config.general_configuration');

        if ($myAccountConfigV2 && $myAccountConfigV2['enabled']) {
            $config = $myAccountConfigV2;
        } else {
            $config = $this->configFetcher->getConfigById('my_account_profile_general_configuration');
        }

        $bonusConfig = $this->configFetcher->getConfig('webcomposer_config.bonus_code_configuration');
        $user = $this->userFetcher->getPlayerDetails();
        $flashMessage = "";
        $isFastReg = false;

        $fname = substr($user['firstName'], 0, 5);
        $lname = substr($user['lastName'], 0, 5);
        $bdate = $user['dateOfBirth'];
        $isenableBonusCode = ($bonusConfig['enabled'] === 1 ? true : false);

        if (strtoupper($fname) == "DFRFN" ||
            strtoupper($lname) == "DFRLN" ||
            strtoupper($fname) == "DFRLN" ||
            strtoupper($lname) == "DFRFN" ||
            $bdate  === "1/12/1900"
        ) {
            $flashMessage = $config['fast_reg_flash_message']['value'] ?? "";
            $isFastReg = true;
        }

        return [
            'myProfileTab' => $config['my_profile_tab'] ?? 'My Profile',
            'changePasswordTab' => $config['change_password_tab'] ?? 'Change Password',
            'bonusTabLabel' => $bonusConfig['mobile_tab_label'] ?? 'Bonuses',
            'isFastReg' => $isFastReg,
            'flashMessage' => $flashMessage,
            'enableBonusCode' => $isenableBonusCode,
        ];
    }
}
