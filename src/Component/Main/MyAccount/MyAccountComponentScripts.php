<?php

namespace App\MobileEntry\Component\Main\MyAccount;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;
use App\Drupal\Config;

/**
 *
 */
class MyAccountComponentScripts implements ComponentAttachmentInterface
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
            'primary_label' => $general_config['primary_label'] ?? '',
            'no_changed_detected_message' => $general_config['no_changed_detected_message'] ?? '',
            'message_timeout' => $general_config['message_timeout'] ?? 5,
            'messages' => $message_config['server_side_mapping'],
            'modal_header' => $modal_config['modal_preview_header'],
            'modal_top_blurb' => $modal_config['modal_preview_top_blurb'],
            'modal_current_label' => $modal_config['modal_preview_current_label'],
            'modal_new_label' => $modal_config['modal_preview_new_label'],
            'modal_bottom_blurb' => $modal_config['modal_preview_bottom_blurb']
        ];
    }
}
