<?php

namespace App\MobileEntry\Component\Footer;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;
use App\MobileEntry\Services\Product\Products;

class FooterComponent implements ComponentWidgetInterface
{
    /**
     * @var App\Fetcher\Drupal\MenuFetcher
     */
    private $menus;

    /**
     * @var App\Fetcher\Drupal\ViewsFetcher
     */
    private $views;
    private $viewsFloating;

    /**
     * @var App\Fetcher\Drupal\ConfigFetcher
     */
    private $configs;

    private $asset;

    private $product;

    /**
     * Block utility helper
     *
     * @var object
     */
    private $blockUtils;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('menu_fetcher'),
            $container->get('views_fetcher'),
            $container->get('product_resolver'),
            $container->get('config_fetcher'),
            $container->get('asset'),
            $container->get('block_utils')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($menus, $views, $product, $configs, $asset, $blockUtils)
    {
        $this->menus = $menus;
        $this->views = $views;
        $this->product = $product;
        $this->configs = $configs;
        $this->viewsFloating = $views->withProduct($product->getProduct());
        $this->asset = $asset;
        $this->blockUtils = $blockUtils;
    }

    /**
     * Defines the template path
     *
     * @return string
     */
    public function getTemplate()
    {
        return '@component/Footer/template.html.twig';
    }

    /**
     * Defines the data to be passed to the twig template
     *
     * @return array
     */
    public function getData()
    {
        $data = [];
        $data['back_to_top'] = true;
        $data['copyright'] = 'Copyright';

        try {
            $data['sponsors'] = $this->views->getViewById('mobile_sponsor_list_v2');
        } catch (\Exception $e) {
            $data['sponsors'] = [];
        }

        try {
            $data['footer_menu'] = $this->menus->getMultilingualMenu('mobile-footer');
        } catch (\Exception $e) {
            $data['footer_menu'] = [];
        }

        try {
            $floatingFooter = [];
            $floatingFooter = $this->viewsFloating->getViewById('floating_footer');
            if (!empty($floatingFooter)) {
                $floatingFooter = $this->dataConvert($floatingFooter);
            }
            $data['floatingFooter'] = $floatingFooter;
        } catch (\Exception $e) {
            $data['floatingFooter'] = [];
        }

        try {
            $data['entrypage_config'] = $this->configs->getConfig('mobile_entrypage.entrypage_configuration');
        } catch (\Exception $e) {
            $data['entrypage_config'] = [];
        }

        try {
            $footerConfigs = $this->configs->getConfig('webcomposer_config.footer_configuration');
            $data['cookie_notification'] = $footerConfigs['cookie_notification']['value'] ?? 'cookie notification';
            $data['country_codes'] = $footerConfigs['country_codes'] ?? '';

            if (!empty($footerConfigs['back_to_top_title'])) {
                $data['back_to_top'] = !$this->blockUtils->isVisibleOn($footerConfigs['back_to_top_title']);
            }
        } catch (\Exception $e) {
            $footerConfigs = [];
            $data['cookie_notification'] = 'Cookie Notification';
            $data['country_codes'] = '';
        }

        return $data;
    }

    /**
     * Data convert and sort
     *
     * @return array
     */
    public function dataConvert($floatingFooter)
    {
        $footerTabs = [];
        foreach ($floatingFooter as $key => $tab) {
            if ($tab['field_status_tab'][0]['value']) {
                $footerTabs[$key]['name_tab'] = strtolower($tab['name'][0]['value']);
                $footerTabs[$key]['label_tab'] = $tab['field_label_tab'][0]['value'];
                $footerTabs[$key]['icon_tab'] = $this->asset->generateAssetUri(
                    $tab['field_icon_tab'][0]['url'],
                    ['product' => $this->product->getProduct()]
                );
                $footerTabs[$key]['active_icon_tab'] = $this->asset->generateAssetUri(
                    $tab['field_active_icon_tab'][0]['url'],
                    ['product' => $this->product->getProduct()]
                );
                $footerTabs[$key]['status_tab'] = $tab['field_status_tab'][0]['value'];
                $footerTabs[$key]['weight'] = $tab['weight'][0]['value'];
                $footerTabs[$key]['page_url'] = $tab['field_page_url'][0]['value'] ?? "";
            }
        }
        $counts = array_map(function ($v) {
            return $v['weight'];
        }, $footerTabs);

        array_multisort($counts, SORT_ASC, SORT_NUMERIC, $footerTabs);

        return $footerTabs;
    }
}
