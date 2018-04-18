<?php

namespace App\MobileEntry\Component\Slider;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class SliderComponent implements ComponentWidgetInterface
{
    /**
     * Defines the template path
     *
     * @return string
     */
    public function getTemplate()
    {
        return '@component/Slider/template.html.twig';
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
