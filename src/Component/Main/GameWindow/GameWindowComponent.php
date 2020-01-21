<?php

namespace App\MobileEntry\Component\Main\GameWindow;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class GameWindowComponent implements ComponentWidgetInterface
{
    /**
     * Defines the template path
     *
     * @return string
     */
    public function getTemplate()
    {
        return '@component/Main/GameWindow/template.html.twig';
    }

    /**
     * Defines the data to be passed to the twig template
     *
     * @return array
     */
    public function getData()
    {
        return [];
    }
}
