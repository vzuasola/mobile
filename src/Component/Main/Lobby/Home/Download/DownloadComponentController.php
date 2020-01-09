<?php

namespace App\MobileEntry\Component\Main\Lobby\Home\Download;

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

    private $product;

    private $rest;

    private $url;

    /**
     * @var App\Player\PlayerSession
     */
    private $playerSession;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('menu_fetcher'),
            $container->get('config_fetcher'),
            $container->get('product_resolver'),
            $container->get('rest'),
            $container->get('uri'),
            $container->get('player_session')
        );
    }

    /**
     *
     */
    public function __construct(
        $menus,
        $configs,
        $product,
        $rest,
        $url,
        $playerSession
    ) {
        $this->configs = $configs->withProduct($product->getProduct());
        $this->menus = $menus->withProduct($product->getProduct());
        $this->rest = $rest;
        $this->url = $url;
        $this->playerSession = $playerSession;
    }

    /**
     * Defines the data to be passed to the twig template
     *
     * @return array
     */
    public function downloads($request, $response)
    {
        try {
            $data['downloads_menu']  = $this->menus->getMultilingualMenu('mobile-downloads');
        } catch (\Exception $e) {
            $data['downloads_menu'] = [];
        }

        try {
            $data['all_apps_text'] = $this->configs->getConfig('mobile_entrypage.entrypage_configuration');
        } catch (\Exception $e) {
            $data['all_apps_text'] = [];
        }

        $data['partnerMatrix'] = $this->playerSession->getDetails()['isPlayerCreatedByAgent'] ?? false;

        return $this->rest->output($response, $data);
    }
}
