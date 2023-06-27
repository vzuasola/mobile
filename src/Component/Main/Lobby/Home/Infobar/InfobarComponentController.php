<?php

namespace App\MobileEntry\Component\Main\Lobby\Home\Infobar;

class InfobarComponentController
{
    /**
     * @var App\Fetcher\Drupal\Views
     */
    private $views;

    /**
     * @var App\Player\PlayerSession
     */
    private $playerSession;

    private $currentLanguage;

    private $translation;

    private $rest;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('views_fetcher'),
            $container->get('player_session'),
            $container->get('lang'),
            $container->get('translation_manager'),
            $container->get('rest')
        );
    }

    /**
     *
     */
    public function __construct(
        $views,
        $playerSession,
        $language,
        $translation,
        $rest
    ) {
        $this->views = $views;
        $this->playerSession = $playerSession;
        $this->currentLanguage = $language;
        $this->translation = $translation;
        $this->rest = $rest;
    }

    /**
     * Defines the data to be passed to the twig template
     *
     * @return array
     */
    public function infobar($request, $response)
    {

        $infoBarComponent = new InfobarComponent(
            $this->views,
            $this->playerSession,
            $this->currentLanguage,
            $this->translation
        );
        try {
            $data = $infoBarComponent->getData();
        } catch (\Exception $e) {
            $data['infobar'] = [];
        }


        return $this->rest->output($response, $data);
    }
}
