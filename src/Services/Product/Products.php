<?php

namespace App\MobileEntry\Services\Product;

/**
 * Class to check for accounts
 */
class Products
{
    const PRODUCT_MAPPING = [
        'games' => 'mobile-games',
        'casino' => 'mobile-casino'
    ];

    const PRODUCT_DIRECT_INTEGRATION = [
        'mobile-sports' => 'sports'
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
        'virtual-sports' => [
            'virtual-sports',
            'virtual-world',
            'virtualsports',
            'virtual-network',
            'virtual-sports-coupon',
            'virtuals',
        ],
    ];
}
