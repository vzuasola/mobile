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
        $myAccountConfigV2 = $this->configFetcher->getConfig('my_account_config.general_configuration');

        if ($myAccountConfigV2 && $myAccountConfigV2['enabled']) {
            $config = $myAccountConfigV2;
            $config['server_side_mapping'] = $config['server_side_validation'];
        } else {
            $general_config = $this->configFetcher->getConfigById('my_account_profile_general_configuration');
            $modal_config = $this->configFetcher->getConfigById('my_account_profile_modal_preview');
            $message_config = $this->configFetcher->getConfigById('my_account_profile_server_side_mapping');
            $config = array_merge($general_config, $modal_config, $message_config);
        }

        return [
            'primaryLabel' => $config['primary_label'] ?? '',
            'noUpdateDetected' => $config['no_changed_detected_message'] ?? '',
            'messageTimeout' => $config['message_timeout'] ?? 5,
            'messages' => Config::parse($config['server_side_mapping']) ?? '',
            'modalHeader' => $config['modal_preview_header'] ?? '',
            'modalTopBlurb' => $config['modal_preview_top_blurb'] ?? '',
            'modalCurrentLabel' => $config['modal_preview_current_label'] ?? '',
            'modalNewLabel' => $config['modal_preview_new_label'] ?? '',
            'modalBottomBlurb' => $config['modal_preview_bottom_blurb'] ?? ''
        ];
    }
}
