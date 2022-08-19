<?php

namespace App\MobileEntry\Module\PtplusTournament;

class PtplusTournamentModuleController
{
    private $playerSession;
    private $config;
    private $rest;
    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('rest'),
            $container->get('player_session'),
            $container->get('config_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($rest, $playerSession, $config)
    {
        $this->rest = $rest;
        $this->playerSession = $playerSession;
        $this->config = $config;
    }

    public function unsupported($request, $response)
    {
        try {
            $config =  $this->config->withProduct('mobile-ptplus')
                ->getConfig('webcomposer_config.tournament_settings');

            $data['title'] = $config['title'] ?? '';
            $data['message'] = $config['message']['value'] ?? '';
            $data['button'] = $config['button_text'] ?? '';
            $data['status'] = true;
        } catch (\Exception $e) {
            $data['status'] = false;
        }

        return $this->rest->output($response, $data);
    }
}
