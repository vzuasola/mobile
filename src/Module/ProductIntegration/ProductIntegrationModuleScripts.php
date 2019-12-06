<?php

namespace App\MobileEntry\Module\ProductIntegration;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;
use App\MobileEntry\Services\Product\Products;

/**
 *
 */
class ProductIntegrationModuleScripts implements ComponentAttachmentInterface
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
            'productMapping' => Products::PLAYER_MATRIX_PRODUCT_MAPPING,
            'matrix' => $this->playerSession->getDetails()['isPlayerCreatedByAgent'] ?? false,
        ];
    }
}
