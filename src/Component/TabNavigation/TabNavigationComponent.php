<?php

namespace App\MobileEntry\Component\TabNavigation;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class TabNavigationComponent implements ComponentWidgetInterface
{

    /**
     *
     */
    public static function create($container)
    {
        return new static();
    }

    /**
     * Public constructor
     */
    public function __construct()
    {
    }

    /**
     * Defines the template path
     *
     * @return string
     */
    public function getTemplate()
    {
        return '@component/TabNavigation/template.html.twig';
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
