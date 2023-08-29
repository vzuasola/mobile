<?php

namespace App\MobileEntry\Component\Header;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;
use App\MobileEntry\Services\Product\Products;

/**
 *
 */
class HeaderComponentScripts implements ComponentAttachmentInterface
{
    private $playerSession;

    private $configs;

    private $views;

    private $menus;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('player_session'),
            $container->get('config_fetcher'),
            $container->get('views_fetcher'),
            $container->get('menu_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($playerSession, $configs, $views, $menus)
    {
        $this->playerSession = $playerSession;
        $this->configs = $configs;
        $this->views = $views;
        $this->menus = $menus;
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

        try {
            $data['top_menu'] = $this->menus->getMultilingualMenu('mobile-pre-login');

            foreach ($data['top_menu'] as $top_menu) {
                if (stristr($top_menu['attributes']['class'], 'join-btn')) {
                    $join_now_url = $top_menu['uri'];
                    break;
                }
            }
        } catch (\Exception $e) {
            $data['top_menu'] = [];
        }

        $isLoggedIn = $this->playerSession->isLogin();
        $useDafacoinBalanceMenu = $headerConfigs['dafacoin_balance_toggle'];

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
            'join_now_url' => $join_now_url ?? "",
        ];

        if ($isLoggedIn && $useDafacoinBalanceMenu) {
            $data['currency'] = $playerInfo['currency'];
            $data['dafacoin_popup_display_time'] = $headerConfigs['dafacoin_notification_popup_display_time'];
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
