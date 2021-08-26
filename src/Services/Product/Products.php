<?php

namespace App\MobileEntry\Services\Product;

/**
 * Class to check for accounts
 */
class Products
{
    const PRODUCT_MAPPING = [
        'games' => 'mobile-games',
        'casino' => 'mobile-casino',
        'casino-gold' => 'mobile-casino-gold',
        'live-dealer' => 'mobile-live-dealer',
        'lottery' => 'mobile-lottery',
        'exchange' => 'mobile-exchange',
        'arcade' => 'mobile-arcade',
        'soda-casino' => 'mobile-soda-casino',
        'virtual-sports' => 'mobile-virtuals',
        'ptplus' => 'mobile-ptplus',
    ];

    const PRODUCT_DIRECT_INTEGRATION = [
        'mobile-sports' => 'sports',
        'mobile-sports-df' => 'sports-df'
    ];

    const PRODUCT_ALIAS = [
        'casino' => [
            'casino',
            'dafa888',
            '888',
            'yulechang',
            'xuanzhuan',
            'duchang',
            'casino-gold',
            'gold',
            'daebak',
        ],
        'sports' => [
            'sports',
            'football',
            'soccer',
            'goal',
            'cup',
            'match168',
        ],
        'sports-df' => [
            'sports-df',
            'dffootball',
            'dfsoccer',
            'dfgoal',
            'dfcup',
            'dfmatch168',
        ],
        'lottery' => [
            'keno',
            'lottery',
            'lotto-numbers',
            'numbers',
            'draw',
            'live-draws',
        ],
        'live-dealer' => [
            'live-dealer',
            'macau',
            'live',
            'live-games',
            'xianchang',
            'zhenren',
        ],
        'games' => [
            'games',
            'slots',
            'flashgames',
            'laohuji',
            'playflash',
            'spinwin',
        ],
        'exchange' => [
            'exchange',
            'cricket',
            'indiabet',
            'cric-exchange',
            'betting-exchange',
        ],
        'arcade' => [
            'arcade',
            'youxi',
            'xiaoyouxi',
            'fun',
            'amusement',
            'arcade-room',
            'fish-hunter',
            'fish',
            'fishing',
            'buyu',
            'buyuwang',
            'buyudaren',
        ],
        'virtuals' => [
            'virtual-sports',
            'virtual-world',
            'virtualsports',
            'virtual-network',
            'virtual-sports-coupon',
            'virtuals',
        ],
        'casino-gold' => [
            'casino-gold',
            'gold',
            'jin',
            'elite',
            'vip',
            'exclusive',
        ],
        'soda-casino' => [
            'soda-casino',
            'suda',
            'soda',
            'sodabt',
            'sodfa',
            'sda',
            'ptplus',
            'playtechplus',
            'casinoplus',
            'slotsplus',
            'slots-tournament',
            'casino-gamification'
        ],
        'ptplus' => [
            'ptplus',
        ],
    ];

    const PLAYER_MATRIX_PRODUCT_MAPPING = [
        'mobile-sports' => 'sports-df',
        'mobile-exchange' => 'sports-df',
        'mobile-casino' => 'live-dealer',
        'mobile-casino-gold' => 'live-dealer',
        'mobile-soda-casino' => 'live-dealer',
    ];

    const PRODUCTCODE_MAPPING = [
        'games' => 'mobile-games',
        'casino' => 'mobile-casino',
        'casino-gold' => 'mobile-casino-gold',
        'live-dealer' => 'mobile-live-dealer',
        'lottery' => 'mobile-lottery',
        'exchange' => 'mobile-exchange',
        'arcade' => 'mobile-arcade',
        'soda-casino' => 'mobile-soda-casino',
        'virtual-sports' => 'mobile-virtuals',
        'sports' => 'mobile-sports',
        'sports-df' => 'mobile-sports-df',
        'ptplus' => 'mobile-ptplus',
    ];

    const PRODUCTS_WITH_CMS = [
        'mobile-entrypage',
        'mobile-casino',
        'mobile-casino-gold',
        'mobile-live-dealer',
        'mobile-lottery',
        'mobile-exchange',
        'mobile-arcade',
        'mobile-virtuals',
        'mobile-soda-casino',
        'mobile-games'
    ];
}
