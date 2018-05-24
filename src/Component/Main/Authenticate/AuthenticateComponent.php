<?php

namespace App\MobileEntry\Component\Main\Authenticate;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class AuthenticateComponent implements ComponentWidgetInterface
{
    /**
     * Defines the template path
     *
     * @return string
     */
    public function getTemplate()
    {
        return '@component/Main/Authenticate/template.html.twig';
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
