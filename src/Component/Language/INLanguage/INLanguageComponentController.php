<?php

namespace App\MobileEntry\Component\Language\INLanguage;

class INLanguageComponentController
{
    /**
     * @var App\Fetcher\Drupal\ConfigFetcher
     */
    private $configs;

    private $rest;


    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('config_fetcher'),
            $container->get('rest')
        );
    }

    /**
     * Public constructor
     */
    public function __construct(
        $configs,
        $rest
    ) {
        $this->configs = $configs;
        $this->rest = $rest;
    }


    /**
     * Defines the data to be passed to the twig template
     *
     * @return array
     */
    public function language($request, $response)
    {
        $data = [];

        try {
            $entrypageConfigs = $this->configs->getConfig('mobile_entrypage.entrypage_configuration');
        } catch (\Exception $e) {
            $entrypageConfigs = [];
        }

        $data['mobile_language_svg_class'] = $entrypageConfigs['mobile_language_svg_class'] ?? 'in-language';
        $data['mobile_india_language_select'] = $entrypageConfigs['mobile_language_select'] ?? 'Select your Language';
        $data['mobile_india_language_description'] =
            $entrypageConfigs['mobile_language_description_select'] ?? '';

        return $this->rest->output($response, $data);
    }
}
