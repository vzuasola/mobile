<?php

namespace App\MobileEntry\Component\Header;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;
use App\MobileEntry\Services\Product\Products;
use App\Utils\DCoin;

/**
 *
 */
class HeaderComponentScripts implements ComponentAttachmentInterface
{
    private $playerSession;

    private $configs;

    private $views;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('player_session'),
            $container->get('config_fetcher'),
            $container->get('views_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($playerSession, $configs, $views)
    {
        $this->playerSession = $playerSession;
        $this->configs = $configs;
        $this->views = $views;
    }

    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        try {
            $config = $this->configs->getConfig('webcomposer_config.login_configuration');
            $headerConfigs = $this->configs->getConfig('webcomposer_config.header_configuration');
            $playerInfo = $this->playerSession->getDetails();
        } catch (\Exception $e) {
            $config = [];
        }

        $isLoggedIn = $this->playerSession->isLogin();
        $userCurrency= $playerInfo['currency'] ?? 'n/a';
        $useDafacoinBalanceMenu = DCoin::isDafacoinEnabled($headerConfigs, $userCurrency);

        $data = [
            'authenticated' => $isLoggedIn,
            'error_message_blank_username' => $config['error_message_blank_username'],
            'error_message_blank_password' => $config['error_message_blank_password'],
            'error_message_blank_passname' => $config['error_message_blank_passname'],
            'error_message_invalid_passname' => $config['error_message_invalid_passname'],
            'error_message_service_not_available' => $config['error_message_service_not_available'],
            'error_message_account_suspended' => $config['error_message_account_suspended'],
            'error_message_account_locked' => $config['error_message_account_locked'],
            'products' => $this->getProducts(),
            'useDafacoinBalanceMenu' => $useDafacoinBalanceMenu,
            'join_now_url' => $headerConfigs['registration_link']
        ];

        if ($isLoggedIn && $useDafacoinBalanceMenu) {
            $data['balanceExclusion'] = DCoin::getBalanceExclusions($headerConfigs);
            $data['currency'] = $playerInfo['currency'];
            $data['dafacoin_menu'] = DCoin::getAttachmentData($headerConfigs);
        }

        return $data;
    }

    private function getProducts()
    {
        try {
            $result = [];
            $products = $this->views->getViewById('products');

            foreach ($products as $product) {
                $instanceId = $product['field_product_instance_id'][0]['value'];
                if (array_key_exists($instanceId, Products::PRODUCT_MAPPING)) {
                    $result[Products::PRODUCT_MAPPING[$instanceId]] = [
                        'login_via' => $product['field_product_login_via'][0]['value'] ?? '',
                        'reg_via' => $product['field_registration_url'][0]['value'] ?? '',
                    ];
                }
            }
        } catch (\Exception $e) {
            $result = [];
        }

        return $result;
    }
}
