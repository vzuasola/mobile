<?php

namespace App\MobileEntry\Component\Main\Basic;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class BasicComponent implements ComponentWidgetInterface
{
    /**
     * Defines the template path
     *
     * @return string
     */
    public function getTemplate()
    {
        return '@component/Main/Basic/template.html.twig';
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
