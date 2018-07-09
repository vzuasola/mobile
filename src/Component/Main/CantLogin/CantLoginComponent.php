<?php

namespace App\MobileEntry\Component\Main\CantLogin;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class CantLoginComponent implements ComponentWidgetInterface
{
    /**
     * {@inheritdoc}
     */
    public function getTemplate()
    {
        return '@component/Main/CantLogin/template.html.twig';
    }

    /**
     * {@inheritdoc}
     */
    public function getData()
    {
        $data = [];

        $data['name'] = 'Drew';
        $data['title'] = 'Can\'t access your Dafabet Account?';

        return $data;
    }
}
