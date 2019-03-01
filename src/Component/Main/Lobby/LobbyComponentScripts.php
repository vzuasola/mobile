<?php

namespace App\MobileEntry\Component\Main\Lobby;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;
use App\MobileEntry\Services\Product\Products;

/**
 *
 */
class LobbyComponentScripts implements ComponentAttachmentInterface
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
            'product_alias' => Products::PRODUCT_ALIAS,
            'product_direct_integration' => Products::PRODUCT_DIRECT_INTEGRATION
        ];
    }
}
