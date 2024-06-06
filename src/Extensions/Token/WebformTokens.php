<?php

namespace App\MobileEntry\Extensions\Token;

use App\Plugins\Token\TokenExtensionInterface;
use App\Utils\LazyService;

/**
 *
 */
class WebformTokens implements TokenExtensionInterface
{
    const WEBFORM_CLASS = 'App\MobileEntry\Token\WebformsToken';
    const WEBFORM_FAQ_CLASS = 'App\MobileEntry\Token\FaqWebformsToken';

    public function setContainer($container)
    {
        $this->formFetcher = LazyService::createLazyDependency($container, 'form_fetcher');
    }

    /**
     * Alters the existing tokens
     */
    public function process(&$tokens)
    {
        try {
            $entrypageWebforms = $this->formFetcher->getFormsList();
            $faqWebforms = $this->formFetcher->withProduct('faqs')->getFormsList();

            foreach ($entrypageWebforms as $value) {
                $tokens["webform:$value"] = self::WEBFORM_CLASS;
            }

            foreach ($faqWebforms as $value) {
                $tokens["webformfaq:$value"] = self::WEBFORM_FAQ_CLASS;
            }
        } catch (\Exception $e) {
            // do nothing
        }
    }
}
