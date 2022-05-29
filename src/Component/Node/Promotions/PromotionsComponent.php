<?php

namespace App\MobileEntry\Component\Node\Promotions;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;
use Slim\Exception\NotFoundException;

class PromotionsComponent implements ComponentWidgetInterface
{
    /**
     * @var App\Player\PlayerSession
     */
    private $playerSession;
    /**
     * @var App\Fetcher\Drupal\ConfigFetcher
     */
    private $config;

    /**
     * @var App\Fetcher\AsyncDrupal\ViewsFetcher
     */
    private $views;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('player_session'),
            $container->get('config_fetcher'),
            $container->get('views_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($playerSession, $config, $views)
    {
        $this->playerSession = $playerSession;
        $this->config = $config;
        $this->views = $views;
    }

    /**
     * {@inheritdoc}
     */
    public function getTemplate($options = [])
    {
        return '@component/Node/Promotions/template.html.twig';
    }

    /**
     * {@inheritdoc}
     */
    public function getData($options = [])
    {
        try {
            $data['node'] = $options['node'];
        } catch (\Exception $e) {
            $data['node'] = [];
        }

        try {
            $gameProviders = $this->views->getViewById('games_providers');
        } catch (\Exception $e) {
            $gameProviders = [];
        }

        try {
            $gameSubproviders = $this->views->getViewById('games_subproviders');
        } catch (\Exception $e) {
            $gameSubproviders = [];
        }

        $data['is_login'] = $this->playerSession->isLogin();
        $data['game_provider'] = $gameProviders;
        $data['game_subprovider'] = $gameSubproviders;
        return $data;
    }
}
