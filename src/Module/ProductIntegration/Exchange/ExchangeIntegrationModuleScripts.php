<?php

namespace App\MobileEntry\Module\ProductIntegration\Exchange;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;

/**
 *
 */
class ExchangeIntegrationModuleScripts implements ComponentAttachmentInterface
{
    /**
     * @var App\Player\PlayerSession
     */
    private $playerSession;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('player_session')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($playerSession)
    {
        $this->playerSession = $playerSession;
    }

    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        return [
            'authenticated' => $this->playerSession->isLogin(),
            'matrix' => $this->playerSession->getDetails()['isPlayerCreatedByAgent'] ?? false,
        ];
    }
}
