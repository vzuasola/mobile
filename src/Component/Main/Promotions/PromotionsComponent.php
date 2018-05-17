<?php

namespace App\MobileEntry\Component\Main\Promotions;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class PromotionsComponent implements ComponentWidgetInterface
{
    /**
     * Defines the template path
     *
     * @return string
     */
    public function getTemplate()
    {
        return '@component/Main/Promotions/template.html.twig';
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
