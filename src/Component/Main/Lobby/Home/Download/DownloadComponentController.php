<?php

namespace App\MobileEntry\Component\Main\Lobby\Download;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class DownloadComponentController
{
    /**
     * @var App\Fetcher\Drupal\MenuFetcher
     */
    private $menus;

    /**
     * @var App\Fetcher\Drupal\ConfigFetcher
     */
    private $configs;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('menu_fetcher'),
            $container->get('config_fetcher')
        );
    }

    /**
     *
     */
    public function __construct(
        $menus,
        $configs
    ) {
        $this->configs = $configs->withProduct($product->getProduct());
        $this->menus = $menus->withProduct($product->getProduct());
    }

    /**
     * Defines the data to be passed to the twig template
     *
     * @return array
     */
    public function downloadss($request, $response)
    {
        try {
            $data['downloads_menu'] = $this->menus->getMultilingualMenu('mobile-downloads');
        } catch (\Exception $e) {
            $data['downloads_menu'] = [];
        }

        try {
            $entrypageConfigs = $this->configs->getConfig('mobile_entrypage.entrypage_configuration');
            $data['all_apps_text'] = $entrypageConfigs['all_apps_text'];
        } catch (\Exception $e) {
            $data['all_apps_text'] = 'View All Apps Here';
        }

        return $this->rest->output($response, $data);
    }

    private function processSlides($data, $options)
    {

    }
}
