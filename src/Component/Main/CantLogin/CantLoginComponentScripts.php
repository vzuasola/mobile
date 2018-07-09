<?php

namespace App\MobileEntry\Component\Main\CantLogin;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;

/**
 *
 */
class CantLoginComponentScripts implements ComponentAttachmentInterface
{
    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        return [
            'username' => 'leandrew',
            'messages' => [
                'CHANGE_FORGOTTEN_PASSWORD_FAILED' => "Change forgotten password FAILED",
                'CHANGE_FORGOTTEN_PASSWORD_SUCCESS' => "Change forgotten password success",
                'FORGOT_PASSWORD_FAILED' => "Forgot Password Failed password failed....",
                'FORGOT_PASSWORD_SUCCESS' => "Forgot Password success",
                'FORGOT_USERNAME_FAILED' => "Forgot Username Failed",
                'FORGOT_USERNAME_SUCCESS' => "Forgot Username Success",
                'INTERNAL_ERROR' => "Internal Server Error",
            ],
        ];
    }
}
