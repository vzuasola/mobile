<?php

namespace App\MobileEntry\Component\Main\ChangePassword;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class ChangePasswordComponent implements ComponentWidgetInterface
{
    /**
     * {@inheritdoc}
     */
    public function getTemplate()
    {
        return '@component/Main/ChangePassword/template.html.twig';
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
