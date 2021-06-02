<?php

namespace App\MobileEntry\Module\GameIntegration\GPISode;

use App\Drupal\Config;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;

/**
 *
 */
class GPISodeModuleScripts implements ComponentAttachmentInterface
{
    private $playerSession;

    private $lang;

    const KEY = 'gpi_sode';

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('player_session'),
            $container->get('lang')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($playerSession, $lang)
    {
        $this->playerSession = $playerSession;
        $this->lang = $lang;
    }

    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        try {
            $data = [
                'authenticated' => $this->playerSession->isLogin(),
            ];
        } catch (\Exception $e) {
            $data = [];
        }

        return $data;
    }
}
