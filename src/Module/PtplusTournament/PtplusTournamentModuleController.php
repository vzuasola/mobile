<?php

namespace App\MobileEntry\Module\PtplusTournament;

use App\Drupal\Config;
use GuzzleHttp\Client;

class PtplusTournamentModuleController
{
    private $playerSession;
    private $config;
    private $rest;
    private $lang;
    private $player;
    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('rest'),
            $container->get('player_session'),
            $container->get('config_fetcher'),
            $container->get('lang'),
            $container->get('player')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($rest, $playerSession, $config, $lang, $player)
    {
        $this->rest = $rest;
        $this->playerSession = $playerSession;
        $this->config = $config;
        $this->lang = $lang;
        $this->player = $player;
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
