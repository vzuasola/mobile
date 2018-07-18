<?php

namespace App\MobileEntry\Component\Profiler;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;

/**
 *
 */
class ProfilerComponentScripts implements ComponentAttachmentInterface
{
    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('profiler')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($profiler)
    {
        $this->profiler = $profiler;
    }

    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        $data = [];

        $data['profileable'] = $this->profiler->isProfileable();

        return $data;
    }
}
