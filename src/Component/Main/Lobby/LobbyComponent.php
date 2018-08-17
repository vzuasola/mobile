<?php

namespace App\MobileEntry\Component\Main\Lobby;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class LobbyComponent implements ComponentWidgetInterface
{
    /**
     * Defines the template path
     *
     * @return string
     */
    public function getTemplate()
    {
        return '@component/Main/Lobby/template.html.twig';
    }

    /**
     * Defines the data to be passed to the twig template
     *
     * @return array
     */
    public function getData()
    {
        $data = [];

        return $data;
    }
}
