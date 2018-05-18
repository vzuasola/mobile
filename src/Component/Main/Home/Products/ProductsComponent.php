<?php

namespace App\MobileEntry\Component\Main\Home\Products;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class ProductsComponent implements ComponentWidgetInterface
{
    /**
     * @var App\Fetcher\Drupal\ConfigFetcher
     */
    private $config;

    /**
     * @var App\Fetcher\Drupal\ViewsFetcher
     */
    private $views;

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
            $container->get('views_fetcher'),
            $container->get('config_fetcher'),
            $container->get('player_session')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($views, $config, $playerSession)
    {
        $this->views = $views;
        $this->config = $config;
        $this->playerSession = $playerSession;
    }


    /**
     * Defines the template path
     *
     * @return string
     */
    public function getTemplate()
    {
        return '@component/Main/Home/Products/template.html.twig';
    }

    /**
     * Defines the data to be passed to the twig template
     *
     * @return array
     */
    public function getData()
    {
        $data = [];
        $data['is_logged_in'] = $this->playerSession->isLogin();

        try {
            $data['product_tiles'] = $this->getEntity();
        } catch (\Exception $e) {
            $data['product_tiles'] = [];
        }

        try {
            $data['config_new_text'] = $this->config
                ->getConfig('webcomposer_config.header_configuration')['product_menu_new_tag'];
        } catch (\Exception $e) {
            $data['config_new_text'] = [];
        }

        return $data;
    }

    private function getEntity()
    {
        $result = [];
        $tiles = $this->views->getViewById('product_lobby_tiles_entity');

        foreach ($tiles as $key => $tile) {
            if (isset($tile['field_product_lobby_url_post_log'][0]['uri'])) {
                $encode = base64_encode($tile['field_product_lobby_url_post_log'][0]['uri']);
                $tile['field_post_login_url_encoded'] = $encode;
            }

            $result[$key] = $tile;
        }

        return $result;
    }
}
