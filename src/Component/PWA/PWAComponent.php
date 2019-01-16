<?php

namespace App\MobileEntry\Component\PWA;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class PWAComponent implements ComponentWidgetInterface
{
    /**
     * Defines the template path
     *
     * @return string
     */
    public function getTemplate()
    {
        return '@component/PWA/template.html.twig';
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
