<?php

namespace App\MobileEntry\Component\Main\Lobby\Home;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class HomeComponent implements ComponentWidgetInterface
{
    /**
     * Defines the template path
     *
     * @return string
     */
    public function getTemplate()
    {
        return '@component/Main/Lobby/Home/template.html.twig';
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
