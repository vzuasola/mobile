<?php

namespace App\Web\Section;

use App\Plugins\Section\AsyncSectionInterface;
use Interop\Container\ContainerInterface;

class Exception404 implements AsyncSectionInterface
{
    /**
     * Dependency injection
     *
     * @param ContainerInterface $container
     */
    public function setContainer(ContainerInterface $container)
    {
        $this->config = $container->get('config_fetcher_async');
    }

    /**
     * @{inheritdoc}
     */
    public function getSectionDefinition(array $options)
    {
        return [
            'base' => $this->config->getGeneralConfigById('page_not_found'),
        ];
    }

    /**
     * @{inheritdoc}
     */
    public function processDefinition($data, array $options)
    {
        $result = [];

        if (isset($data['base'])) {
            $result = $data['base'];
        }

        return $result;
    }
}
