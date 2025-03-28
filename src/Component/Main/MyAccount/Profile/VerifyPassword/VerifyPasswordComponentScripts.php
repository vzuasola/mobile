<?php

namespace App\MobileEntry\Component\Main\MyAccount\Profile\VerifyPassword;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;
use App\Drupal\Config;

/**
 *
 */
class VerifyPasswordComponentScripts implements ComponentAttachmentInterface
{

    /**
     * Config Fetcher Object.
     */
    private $configFetcher;

    /**
     * User Fetcher Object
     */
    private $userFetcher;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('config_fetcher'),
            $container->get('user_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($configFetcher, $userFetcher)
    {
        $this->configFetcher = $configFetcher->withProduct('account');
        $this->userFetcher = $userFetcher;
    }

    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        $generalConfig = $this->configFetcher->getConfigById('my_account_profile_general_configuration');
        $messageConfig = $this->configFetcher->getConfig('my_account_config.general_configuration');
        $headerConfig = $this->configFetcher->getConfigById('my_account_header');
        $midError = $headerConfig['error_mid_down'] ?? '';

        $user = $this->userFetcher->getPlayerDetails();
        $isFastReg = false;

        $fname = substr($user['firstName'], 0, 5);
        $lname = substr($user['lastName'], 0, 5);
        $bdate = $user['dateOfBirth'];

        if (strtoupper($fname) == "DFRFN" ||
            strtoupper($lname) == "DFRLN" ||
            strtoupper($fname) == "DFRLN" ||
            strtoupper($lname) == "DFRFN" ||
            $bdate  = "1/12/1900"
        ) {
            $flashMessage = $myProfileConfig['fast_reg_flash_message']['value'] ?? "";
            $isFastReg = true;
        }

        $integrationError = Config::parse($messageConfig['server_side_validation']) ?? '';

        $integrationError = array_merge($integrationError, [
            'ERROR_MID_DOWN' => $midError
        ]);

        return [
            'messageTimeout' => $generalConfig['message_timeout'] ?? 5,
            'messages' => $integrationError,
            'isFastReg' => $isFastReg
        ];
    }
}
