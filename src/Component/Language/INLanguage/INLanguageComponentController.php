<?php

namespace App\MobileEntry\Component\Language\INLanguage;

class INLanguageComponentController
{
    const INDIA_LANGUAGES = [
        'en-in' => 'in',
        'te' => 'te',
        'hi' => 'hi',
    ];

    /**
     * @var App\Fetcher\Drupal\ConfigFetcher
     */
    private $configs;

    private $rest;

    private $playerSession;

    private $language;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('config_fetcher'),
            $container->get('rest'),
            $container->get('player_session'),
            $container->get('language_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct(
        $configs,
        $rest,
        $playerSession,
        $language
    ) {
        $this->configs = $configs;
        $this->rest = $rest;
        $this->playerSession = $playerSession;
        $this->language = $language;
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

        $data['mobile_india_language_select'] = $entrypageConfigs['mobile_language_select'] ?? 'Select your Language';
        $data['mobile_india_language_description'] =
            $entrypageConfigs['mobile_language_description_select'] ?? '';

        return $this->rest->output($response, $data);
    }

    public function details($request, $response)
    {
        $data = [];

        try {
            $iCoreLang = strtolower($this->playerSession->getDetails()['locale']);
            $data['language'] = $this->language->getLanguages()[$iCoreLang]['prefix'] ?? 'in';
        } catch (\Exception $e) {
            $data = [];
        }

        return $this->rest->output($response, $data);
    }
}
