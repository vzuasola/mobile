<?php

namespace App\MobileEntry\Component\Node;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class NodeComponent implements ComponentWidgetInterface
{
    /**
     * {@inheritdoc}
     */
    public function getTemplate($options = [])
    {
        return '@component/Node/template.html.twig';
    }

    /**
     * {@inheritdoc}
     */
    public function getData($options = [])
    {
        $data['node'] = $options['node'];
        $data['type'] = $options['node']['type'][0]['target_id'];

        return $data;
    }
}
