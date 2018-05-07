<?php

namespace App\MobileEntry\Component\Header\Balance;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class BalanceComponent implements ComponentWidgetInterface
{
    /**
     * Defines the template path
     *
     * @return string
     */
    public function getTemplate()
    {
        return '@component/Header/Balance/template.html.twig';
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
