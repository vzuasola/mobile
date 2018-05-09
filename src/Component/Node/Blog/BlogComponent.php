<?php

namespace App\MobileEntry\Component\Node\Blog;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class BlogComponent implements ComponentWidgetInterface
{
    /**
     * {@inheritdoc}
     */
    public function getTemplate($options = [])
    {
        return '@component/Node/Blog/template.html.twig';
    }

    /**
     * {@inheritdoc}
     */
    public function getData($options = [])
    {
        $data['node'] = $options['node'];

        return $data;
    }
}
