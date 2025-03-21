<?php

namespace App\MobileEntry\Component\Menu;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;
use App\MobileEntry\Services\Product\Products;

/**
 *
 */
class MenuComponentScripts implements ComponentAttachmentInterface
{
    private $menus;
    private $views;
    private $configs;
    private $playerSession;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('player_session'),
            $container->get('views_fetcher'),
            $container->get('menu_fetcher'),
            $container->get('config_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($playerSession, $views, $menus, $configs)
    {
        $this->playerSession = $playerSession;
        $this->views = $views;
        $this->menus = $menus;
        $this->configs = $configs;
    }

    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
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

        try {
            $headerConfigs = $this->configs->getConfig('webcomposer_config.header_configuration');
        } catch (\Exception $e) {
            $headerConfigs = [];
        }

        $useDafacoinBalanceMenu = \App\Utils\DCoin::isDafacoinEnabled($headerConfigs, $this->playerSession);
        return [
            'authenticated' => $this->playerSession->isLogin(),
            'products' => $this->getProducts(),
            'join_now_url' => $join_now_url ?? "",
            'useDafacoinBalanceMenu' => $useDafacoinBalanceMenu,
        ];
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
                        'login_via' => $product['field_product_login_via'][0]['value'],
                        'reg_via' => $product['field_registration_url'][0]['value'],
                    ];
                }
            }
        } catch (\Exception $e) {
            $result = [];
        }

        return $result;
    }
}
