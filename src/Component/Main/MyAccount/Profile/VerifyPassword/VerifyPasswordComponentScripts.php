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
        $general_config = $this->configFetcher->getConfigById('my_account_profile_general_configuration');
        $modal_config = $this->configFetcher->getConfigById('my_account_profile_modal_preview');
        $message_config = $this->configFetcher->getConfigById('my_account_profile_server_side_mapping');

        return [
            'messageTimeout' => $general_config['message_timeout'] ?? 5,
            'messages' => Config::parse($message_config['server_side_mapping']) ?? '',
            'modalHeader' => $modal_config['modal_preview_header'] ?? '',
            'modalTopBlurb' => $modal_config['modal_preview_top_blurb'] ?? '',
            'modalCurrentLabel' => $modal_config['modal_preview_current_label'] ?? '',
            'modalNewLabel' => $modal_config['modal_preview_new_label'] ?? '',
            'modalBottomBlurb' => $modal_config['modal_preview_bottom_blurb'] ?? ''
        ];
    }
}
