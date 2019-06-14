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
        return [];
    }


    // private function arrangeBlocks($data)
    // {
    //     $batch = [];
    //     if (count($data) === 4) {
    //         while (count($data) > 0) {
    //             $batch[] = array_splice($data, 0, 2, []);
    //         }

    //         return $batch;
    //     }

    //     if (count($data) === 7) {
    //         while (count($data) > 0) {
    //             $batch[] = array_splice($data, 0, 4, []);
    //         }

    //         return $batch;
    //     }

    //     while (count($data) > 0) {
    //         $batch[] = array_splice($data, 0, 3, []);
    //     }

    //     return $batch;
    // }
}
