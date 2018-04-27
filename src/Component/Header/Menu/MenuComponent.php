<?php

namespace App\MobileEntry\Component\Header\Menu;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class MenuComponent implements ComponentWidgetInterface
{
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
        return [];
    }
}
