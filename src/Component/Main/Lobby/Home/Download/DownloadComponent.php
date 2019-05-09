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
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('menu_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($menus)
    {
        $this->menus = $menus;
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
            $data['downloads_menu'] = $this->arrangeBlocks($data['downloads_menu']);
        } catch (\Exception $e) {
            $data['downloads_menu'] = [];
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

        if (count($data) === 7) {
            while (count($data) > 0) {
                $batch[] = array_splice($data, 0, 4, []);
            }

            return $batch;
        }

        while (count($data) > 0) {
            $batch[] = array_splice($data, 0, 3, []);
        }

        return $batch;
    }
}
