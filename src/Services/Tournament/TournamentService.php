<?php

namespace App\MobileEntry\Services\Tournament;

use App\Drupal\Config;
use GuzzleHttp\Client;
use DateTime;

/**
 * Service for Tournament
 */
class TournamentService
{
    private $playerSession;
    private $player;
    private $configs;
    private $currentLanguage;

    /**
     * @param mixed $container
     * @return static
     */
    public static function create($container)
    {
        return new static(
            $container->get('player_session'),
            $container->get('player'),
            $container->get('config_fetcher'),
            $container->get('lang')
        );
    }

    /**
     * @param mixed $playerSession
     * @param mixed $player
     * @param mixed $lang
     * @param mixed $configs
     * @return void
     */
    public function __construct($playerSession, $player, $configs, $currentLanguage)
    {
        $this->playerSession = $playerSession;
        $this->player = $player;
        $this->configs = $configs;
        $this->currentLanguage = $currentLanguage;
    }

    /**
     * Send Async Request To Tournament Side
     */
    public function tournamentAPIAsync($type, $status = 2)
    {
        try {
            $generalConfiguration = $this->tournamentConfiguration($type);
            $entityName = 'W2W' . $generalConfiguration['currency'];
            $lng = $generalConfiguration['language'];
            $client = new Client();
            return $client->requestAsync(
                'POST',
                $generalConfiguration['url'],
                [
                    'form_params' => [
                        'entity_name' => $entityName,
                        'entity_key' => $generalConfiguration['key_mapping'][$entityName],
                        'isMobile' => false,
                        'language' => $lng,
                        'currency' => $generalConfiguration['currency'],
                        'status' => $status
                    ],
                ]
            );
        } catch (\Exception $e) {
            return [];
        }
    }

    /**
     * Get Tournament Configuration
     */
    public function tournamentConfiguration($type)
    {
        $data = [];
        $settings =  $this->configs->withProduct('mobile-ptplus')
            ->getConfig('webcomposer_config.tournament_settings');

        $urlMapping = [
            'leaderboard' => $settings['leaderboards_api'],
            'dailymission' => $settings['daily_mission_api'],
        ];

        $data['key_mapping'] = Config::parseMultidimensional($settings['key_mapping']);
        $data['url'] = $urlMapping[$type];
        $data['default_key_name'] = Config::parseMultidimensional($settings['default_key_name_mapping']);
        $data['currency'] = $data['default_key_name'][strtolower($this->currentLanguage)];
        $langs = Config::parseMultidimensional($settings['api_language_mapping']);
        $data['language'] = $langs[$this->currentLanguage];
        $data['lang_mapping'] = $langs;

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

    /**
     * Filter Games By Type And Status
     */
    public function filterGamesByTypeStatus($id, $apiList)
    {
        foreach ($apiList['data'] as $value) {
            if ($value['id'] === intval($id)) {
                return [
                    'games' => json_encode($value['games']),
                    'start_time' => $value['start_time'],
                    'end_time' => $value['end_time']
                ];
            }
        }
    }

    /**
     * Get End Time by days, hours, minutes
     */
    public function getEndTime($dateEnd)
    {
        try {
            $currentDate = new \DateTime(date("Y-m-d H:i:s"), new \DateTimeZone(date_default_timezone_get()));
            $endDate = new \DateTime($dateEnd, new \DateTimeZone(date_default_timezone_get()));
            $dateInterval = $endDate->diff($currentDate);

            return [
                'days' => $dateInterval->d ?? '0',
                'hours' => $dateInterval->h ?? '0',
                'minutes' => $dateInterval->i ?? '0'
            ];
        } catch (\Exception $e) {
            return [
                'days' => 'x',
                'hours' => 'x',
                'minutes' => 'x'
            ];
        }
    }
}
