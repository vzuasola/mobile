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

    private $playerSession;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('menu_fetcher'),
            $container->get('config_fetcher'),
            $container->get('player_session')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($menus, $configs, $playerSession)
    {
        $this->menus = $menus;
        $this->configs = $configs;
        $this->playerSession = $playerSession;
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
        try {
            $menuClass = [
                1 => 'app-download-full-width',
                2 => 'app-download-col-2',
                3 => 'app-download-col-3 push',
                4 => 'col-3',
            ];

            $menuClassMore = [
                5 => 'app-download-full-width',
                6 => 'app-download-col-2',
                7 => 'app-download-col-3 push',
                8 => 'col-3'
            ];
            $data['downloads_menu']  = $this->menus->getMultilingualMenu('mobile-downloads');
            $data['menu_class'] = $menuClass[count($data['downloads_menu'])] ?? 'col-3';
            $data['menu_class_more'] = $menuClassMore[count($data['downloads_menu'])] ?? 'col-3';
        } catch (\Exception $e) {
            $data['downloads_menu'] = [];
        }

        try {
            $data['entrypage_config'] = $this->configs->getConfig('mobile_entrypage.entrypage_configuration');
        } catch (\Exception $e) {
            $data['entrypage_config'] = [];
        }

        $data['partnerMatrix'] = $this->playerSession->getDetails()['isPlayerCreatedByAgent'] ?? false;

        return $data;
    }
}
