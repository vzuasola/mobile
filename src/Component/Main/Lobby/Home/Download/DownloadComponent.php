<?php

namespace App\MobileEntry\Component\Main\Lobby\Home\Download;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class DownloadComponent implements ComponentWidgetInterface
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
     * Public constructor
     */
    public function __construct($menus, $configs)
    {
        $this->menus = $menus;
        $this->configs = $configs;
    }


    /**
     * Defines the template path
     *
     * @return string
     */
    public function getTemplate()
    {
        return '@component/Main/Lobby/Home/Download/template.html.twig';
    }

    /**
     * Defines the data to be passed to the twig template
     *
     * @return array
     */
    public function getData()
    {
        $data = [];

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

        return $data;
    }


    private function arrangeBlocks($data)
    {
        $batch = [];
        if (count($data) === 4) {
            while (count($data) > 0) {
                $batch[] = array_splice($data, 0, 2, []);
            }

            return $batch;
        }

        while (count($data) > 0) {
            $batch[] = array_splice($data, 0, 3, []);
        }

        return $batch;
    }
}
