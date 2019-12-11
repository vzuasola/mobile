<?php

namespace App\MobileEntry\Module\PartnerMatrix;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;

/**
 *
 */
class PartnerMatrixModuleScripts implements ComponentAttachmentInterface
{
    const PM_DISABLED_PRODUCTS = [
        'exchange',
        'sports',
        'soda-casino',
        'casino',
        'virtual-sports'
    ];

    const PM_DISABLED_LINKS = [
        'mobile-menu-button|href' => [
            '/my-account'
        ],
        'menu-display-internal|class' => [
            'quicklinks-home',
            'quicklinks-notification',
            'quicklinks-promotions',
            'quicklinks-payments',
            'quicklinks-livechat',
            'quicklinks-contact',
            'quicklinks-change-password'
        ],
        'mobile-menu-footer|href' => [
            'dafabetaffiliates.com'
        ]
    ];

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
            'pm_disabled_products' => PartnerMatrixModuleScripts::PM_DISABLED_PRODUCTS,
            'pm_disabled_links' => PartnerMatrixModuleScripts::PM_DISABLED_LINKS,
        ];
    }
}
