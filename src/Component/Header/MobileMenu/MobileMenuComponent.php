<?php

namespace App\MobileEntry\Component\Header\MobileMenu;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class MobileMenuComponent implements ComponentWidgetInterface
{
    /**
     * Defines the template path
     *
     * @return string
     */
    public function getTemplate()
    {
        return '@component/Header/MobileMenu/template.html.twig';
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
