<?php

namespace App\MobileEntry\Component\Footer;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

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

    /**
     * @var App\Fetcher\Drupal\ConfigFetcher
     */
    private $configs;

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
            $container->get('config_fetcher'),
            $container->get('block_utils')
        );
    }

    /**
     * Public constructor
     */
    public function __construct(
        $menus,
        $views,
        $configs,
        $blockUtils
    ) {
        $this->menus = $menus;
        $this->views = $views;
        $this->configs = $configs;
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
}
