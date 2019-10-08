<?php

namespace App\MobileEntry\Component\Node\InnerPage;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class InnerPageComponent implements ComponentWidgetInterface
{
    /**
     * {@inheritdoc}
     */
    public function getTemplate($options = [])
    {
        return '@component/Node/InnerPage/template.html.twig';
    }

    /**
     * {@inheritdoc}
     */
    public function getData($options = [])
    {
        $data['node'] = $options['node'];
        $data['quick_nav_key'] = isset($data['node']['field_quick_nav_key']) ?
                                $data['node']['field_quick_nav_key'][0]['value'] : '';

        return $data;
    }
}
