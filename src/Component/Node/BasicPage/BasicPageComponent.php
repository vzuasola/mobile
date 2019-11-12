<?php

namespace App\MobileEntry\Component\Node\BasicPage;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class BasicPageComponent implements ComponentWidgetInterface
{
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
            $container->get('player_session')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($playerSession)
    {
        $this->playerSession = $playerSession;
    }
    /**
     * {@inheritdoc}
     */
    public function getTemplate($options = [])
    {
        return '@component/Node/BasicPage/template.html.twig';
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
