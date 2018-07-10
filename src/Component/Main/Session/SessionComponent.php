<?php

namespace App\MobileEntry\Component\Main\Session;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class SessionComponent implements ComponentWidgetInterface
{
    /**
     * Defines the template path
     *
     * @return string
     */
    public function getTemplate()
    {
        return '@component/Main/Session/template.html.twig';
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
