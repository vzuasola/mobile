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

    private $url;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('player_session'),
            $container->get('uri')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($playerSession, $url)
    {
        $this->playerSession = $playerSession;
        $this->url = $url;
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

        return $data;
    }
}
