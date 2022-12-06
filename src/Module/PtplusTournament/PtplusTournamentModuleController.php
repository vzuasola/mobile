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

        /**
     *
     * @param mixed $request
     * @param mixed $response
     * @return mixed
     */
    public function tournamentAPI($request, $response)
    {
        $data = $request->getParams();

        try {
            $status = $data['status'] ?? 2;
            $generalConfiguration = $this->tournamentConfiguration($data);
            $entityName = 'W2W' . $generalConfiguration['currency'];
            $lang = $generalConfiguration['language'];
            $client = new Client();
            $res = $client->request(
                'POST',
                $generalConfiguration['url'],
                [
                    'form_params' => [
                        'entity_name' => $entityName,
                        'entity_key' => $generalConfiguration['key_mapping'][$entityName],
                        'isMobile' => false,
                        'language' => $lang,
                        'currency' => $generalConfiguration['currency'],
                        'status' => $status
                    ],
                ]
            );

            $res = json_decode($res->getBody()->getContents());

            if ($res->code === 0) {
                return $this->rest->output($response, [
                    'data' => $res->data,
                    'message' => $res->message,
                    'status' => 200
                ]);
            }
        } catch (\Exception $e) {
            return $this->rest->output($response, [
                'data' => [],
                'message' => $e->getMessage(),
                'status' => 'failed'
            ]);
        }
    }

    /**
     *
     * @param mixed $data
     * @return mixed
     */
    public function tournamentConfiguration($data)
    {
        $settings =  $this->config->withProduct('mobile-ptplus')
        ->getConfig('webcomposer_config.tournament_settings');

        $urlMapping = [
            'leaderboard' => $settings['leaderboards_api'],
            'dailymission' => $settings['daily_mission_api'],
        ];

        $data['key_mapping'] = Config::parseMultidimensional($settings['key_mapping']);
        $data['url'] = $urlMapping[$data['type']];
        $data['default_key_name'] = Config::parseMultidimensional($settings['default_key_name_mapping']);
        $data['currency'] = $data['default_key_name'][strtolower($this->lang)];
        $lang = Config::parseMultidimensional($settings['api_language_mapping']);
        $data['language'] = $lang[$this->lang];
        $data['lang_mapping'] = $lang;
        $data['test'] = $lang;
        if ($this->playerSession->isLogin()) {
            $playerConfig = $this->player;

            $data['playerId']  = $playerConfig->getPlayerId();
            $data['currency']  = $playerConfig->getCurrency();
            $data['productId'] = $playerConfig->getProductId();
            $data['regLang']   = (string)$playerConfig->getLocale();
        }

        if ($data['currency'] === 'RMB') {
            $data['currency'] = 'CNY';
        }

        return $data;
    }
}
