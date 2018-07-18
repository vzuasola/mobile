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
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('player_session'),
            $container->get('config_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($playerSession, $config)
    {
        $this->playerSession = $playerSession;
        $this->config = $config;
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

        $data['is_login'] = $this->playerSession->isLogin();

        return $data;
    }
}
