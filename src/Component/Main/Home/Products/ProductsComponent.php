<?php

namespace App\MobileEntry\Component\Main\Home\Products;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class ProductsComponent implements ComponentWidgetInterface
{
    /**
     * Defines the template path
     *
     * @return string
     */
    public function getTemplate()
    {
        return '@component/Main/Home/Products/template.html.twig';
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
