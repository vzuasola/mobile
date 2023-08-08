<?php

namespace App\MobileEntry\Component\FooterDeferSVG\FooterIcons;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class FooterIconsComponent implements ComponentWidgetInterface
{

    /**
     *
     */
    public static function create($container)
    {
        return new static();
    }

    /**
     * {@inheritdoc}
     */
    public function getTemplate()
    {
        return '@component/FooterDeferSVG/FooterIcons/template.html.twig';
    }

    public function getData()
    {
        return [];
    }
}
