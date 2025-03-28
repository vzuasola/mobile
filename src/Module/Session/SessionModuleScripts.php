<?php

namespace App\MobileEntry\Module\Session;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;

/**
 *
 */
class SessionModuleScripts implements ComponentAttachmentInterface
{
    /**
     * @var App\Fetcher\Drupal\ConfigFetcher
     */
    private $configs;

    /**
     * @var App\Player\PlayerSession
     */
    private $playerSession;

    private $idDomain;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('config_fetcher'),
            $container->get('player_session'),
            $container->get('id_domain')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($configs, $playerSession, $idDomain)
    {
        $this->configs = $configs;
        $this->playerSession = $playerSession;
        $this->idDomain = $idDomain;
    }

    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        $data = [];

        try {
            $data['authenticated'] = $this->playerSession->isLogin();
        } catch (\Exception $e) {
            $data['authenticated'] = false;
        }

        try {
            $data['hash'] = md5($this->playerSession->getToken());
        } catch (\Exception $e) {
            $data['hash'] = false;
        }

        try {
            $loginConfigs = $this->configs->getConfig('webcomposer_config.login_configuration');
        } catch (\Exception $e) {
            $loginConfigs = [];
        }

        $data['timeout'] = $loginConfigs['session_maxtime'] ?? 300;
        $data['timeout'] = (integer) $data['timeout'];

        return $data;
    }
}
