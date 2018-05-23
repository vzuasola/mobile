<?php

namespace App\MobileEntry\Component\Language;

use App\Plugins\ComponentWidget\AsyncComponentInterface;

class LanguageComponentAsync implements AsyncComponentInterface
{
    /**
     * @var App\Fetcher\AsyncDrupal\ConfigFetcher
     */
    private $configs;

    /**
     * @var App\Fetcher\AsyncDrupal\LanguageFetcher
     */
    private $languages;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('config_fetcher_async'),
            $container->get('language_fetcher_async')
        );
    }

    /**
     *
     */
    public function __construct($configs, $languages)
    {
        $this->configs = $configs;
        $this->languages = $languages;
    }

    /**
     *
     */
    public function getDefinitions()
    {
        return [
            $this->configs->getConfig('webcomposer_config.footer_configuration'),
            $this->languages->getLanguages(),
        ];
    }
}
