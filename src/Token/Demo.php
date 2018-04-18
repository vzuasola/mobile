<?php

namespace App\Web\Token;

use App\Plugins\Token\TokenInterface;
use Interop\Container\ContainerInterface;

/**
 *
 */
class Demo implements TokenInterface
{
    /**
     * Dependency injection
     *
     * @param ContainerInterface $container
     */
    public function setContainer(ContainerInterface $container)
    {
    }

    /**
     * {@inheritdoc}
     */
    public function getToken($options)
    {
        return 'webcomposer';
    }
}
