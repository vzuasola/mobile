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
        $messageConfig = $this->configFetcher->getConfigById('my_account_profile_server_side_mapping');
        $user = $this->userFetcher->getPlayerDetails();
        $isFastReg = false;

        $fname = substr($user['firstName'], 0, 5);
        $lname = substr($user['lastName'], 0, 5);

        if (strtoupper($fname) == "DFRFN" ||
            strtoupper($lname) == "DFRLN"
        ) {
            $flashMessage = $myProfileConfig['fast_reg_flash_message']['value'] ?? "";
            $isFastReg = true;
        }

        return [
            'messageTimeout' => $generalConfig['message_timeout'] ?? 5,
            'messages' => Config::parse($messageConfig['server_side_mapping']) ?? '',
            'isFastReg' => $isFastReg
        ];
    }
}
