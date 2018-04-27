<?php

namespace App\MobileEntry\Component\Header\Menu;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class MenuComponent implements ComponentWidgetInterface
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
     * Defines the template path
     *
     * @return string
     */
    public function getTemplate()
    {
        return '@component/Header/Menu/template.html.twig';
    }

    /**
     * Defines the data to be passed to the twig template
     *
     * @return array
     */
    public function getData()
    {
        $data = [];

        // post login specific data

        $isLogin = $this->playerSession->isLogin();

        $data['is_login'] = $isLogin;

        if ($isLogin) {
            $data['username'] = $this->playerSession->getUsername();
        }

        return $data;
    }
}
