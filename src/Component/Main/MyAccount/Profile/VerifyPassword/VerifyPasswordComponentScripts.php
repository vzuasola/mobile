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
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('config_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($configFetcher)
    {
        $this->configFetcher = $configFetcher->withProduct('account');
    }

    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        $generalConfig = $this->configFetcher->getConfigById('my_account_profile_general_configuration');
        $modalConfig = $this->configFetcher->getConfigById('my_account_profile_modal_preview');
        $messageConfig = $this->configFetcher->getConfigById('my_account_profile_server_side_mapping');

        return [
            'messageTimeout' => $generalConfig['message_timeout'] ?? 5,
            'messages' => Config::parse($messageConfig['server_side_mapping']) ?? '',
            'modalHeader' => $modalConfig['modal_preview_header'] ?? '',
            'modalTopBlurb' => $modalConfig['modal_preview_top_blurb'] ?? '',
            'modalCurrentLabel' => $modalConfig['modal_preview_current_label'] ?? '',
            'modalNewLabel' => $modalConfig['modal_preview_new_label'] ?? '',
            'modalBottomBlurb' => $modalConfig['modal_preview_bottom_blurb'] ?? ''
        ];
    }
}
