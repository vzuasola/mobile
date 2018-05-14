<?php

namespace App\MobileEntry\Component\CasinoOption;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class CasinoOptionComponent implements ComponentWidgetInterface
{
    /**
     * Defines the template path
     *
     * @return string
     */
    public function getTemplate()
    {
        return '@component/CasinoOption/template.html.twig';
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
