<?php

namespace App\MobileEntry\Component\TabNavigation;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;
use App\MobileEntry\Services\Product\Products;

class TabNavigationComponentController
{
    /**
     * @var App\Fetcher\Drupal\ConfigFetcher
     */
    private $menus;
    private $url;
    private $rest;
    private $config;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('menu_fetcher'),
            $container->get('rest'),
            $container->get('uri'),
            $container->get('config_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($menus, $rest, $url, $config)
    {
        $this->menus = $menus;
        $this->rest = $rest;
        $this->url = $url;
        $this->config = $config;
    }

    /**
     * Retrieves Quick Nav Menu
     */
    public function quickNav($request, $response)
    {
        $productList = ['lottery', 'exchange'];
        try {
            $params = $request->getQueryParams();
            $keyword = 'entrypage';
            $data['quick_nav'] = [];
            $data['quick_nav_product'] = 'entrypage';
            $headerConfigs = $this->config->getConfig('webcomposer_config.header_configuration');
            $data['config_new_text'] = $headerConfigs['product_menu_new_tag'] ?? 'NEW';

            if ($params['keyword']) {
                $keywords = explode('/', $params['keyword']);
                $keyword = $keywords[1] ?? '/';
            }
            if (isset($params['product'])) {
                $product = ($params['product'] && in_array($params['product'], Products::PRODUCTS_WITH_CMS))
                    ? $params['product'] : 'mobile-entrypage';;
                $data['quick_nav_product'] = $alias = str_replace("mobile-", "", $product);
                if (in_array($alias, $productList)) {
                    $quickNavMenu = $this->menus->withProduct($product)
                                        ->getMultilingualMenu('quick-nav');
                    if (in_array($keyword, Products::PRODUCT_ALIAS[$alias])) {
                        foreach ($quickNavMenu as $menu) {
                            $menuAlias = '/' . $keyword . '/' . $menu['alias'];
                            if ($menu['alias'] === '/') {
                                $menuAlias = $menu['alias'] . $keyword;
                            }
                            $menu['alias'] = $this->url->generateUri($menuAlias, ['skip_parsers' => true]);
                            if (isset($menu['below'])) {
                                $submenus = [];
                                foreach ($menu['below'] as $submenu) {
                                    $submenu['alias'] = '/' . $keyword . '/' . $submenu['alias'];
                                    $submenu['alias'] =
                                        $this->url->generateUri($submenu['alias'], ['skip_parsers' => true]);
                                    $submenus[] = $submenu;
                                }
                                $menu['alias'] = $submenus[0]['alias'];
                                $menu['below'] = $submenus;
                            }
                            $data['quick_nav'][] = $menu;
                        }
                    }
                }
            }
        } catch (\Exception $e) {
            $data['quick_nav'] = [];
        }

        return $this->rest->output($response, $data);
    }
}
