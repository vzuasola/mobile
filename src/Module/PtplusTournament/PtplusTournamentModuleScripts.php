<?php

namespace App\MobileEntry\Module\PtplusTournament;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;

/**
 *
 */
class PtplusTournamentModuleScripts implements ComponentAttachmentInterface
{
    private $playerSession;
    private $config;
    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('player_session'),
            $container->get('config_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($playerSession, $config)
    {
        $this->playerSession = $playerSession;
        $this->config = $config;
    }

    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        try {
            $settings =  $this->config->withProduct('mobile-ptplus')
                ->getConfig('webcomposer_config.tournament_api_configuration');
            $api['url'] = $settings['api_url'] ?? "https://ptplus-b.hotspin88.com/loginFromGame?data=";
            $api['casino'] = $settings['api_casino'] ?? 'goldencircle'; 

        } catch (\Exception $e) {
            $api['url'] = "https://ptplus-b.hotspin88.com/loginFromGame?data=";
            $api['casino'] = $settings['api_casino'] ?? 'goldencircle'; 
        }

        return [
            'authenticated' => $this->playerSession->isLogin(),
            'playerId' =>  $this->playerSession->getDetails()['playerId'] ?? '',
            'apiUrl' => $api['url'],
            'apiCasino' => $api['casino']
        ];
    }
}
