<?php

namespace App\MobileEntry\Component\Profiler;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class ProfilerComponent implements ComponentWidgetInterface
{
    /**
     *
     */
    public function getTemplate()
    {
        return '@component/Profiler/template.html.twig';
    }

    /**
     *
     */
    public function getData()
    {
        return [];
    }
}
