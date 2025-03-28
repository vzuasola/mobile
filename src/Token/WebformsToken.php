<?php

namespace App\MobileEntry\Token;

use App\Plugins\Token\TokenInterface;
use Interop\Container\ContainerInterface;

/**
 * Token class for Webform placeholder tokens
 */
class WebformsToken implements TokenInterface
{
    /**
     * Dependency injection
     *
     * @param ContainerInterface $container
     */
    public function setContainer(ContainerInterface $container)
    {
        $this->webform = $container->get('mobile_epg_webform');
        $this->parser = $container->get('token_parser');
    }

    /**
     * Returns the replacement data for this specific token class
     */
    public function getToken($options)
    {
        $formId = str_replace('webform:', '', $options['key']);
        try {
            $form = $this->webform->getForm($formId, true);
            $render = $this->parser->processTokens($form);
        } catch (\Exception $e) {
            // Do nothing
        }

        return $render ?? null;
    }
}
