<?php

namespace App\Web\Component\Header;

use App\Plugins\Javascript\ScriptProviderInterface;

/**
 *
 */
class HeaderComponentScripts implements ScriptProviderInterface
{
    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        return [
            'username' => 'leandrew',
        ];
    }
}
