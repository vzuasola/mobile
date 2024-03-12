<?php


namespace App\MobileEntry\Extensions\Forms\Validators;

/**
 * Default webform validator methods
 */
class Validators
{
    /**
     * Validation for invalid words
     * set to true because central reg submission
     * is thru javascript
     */
    public function invalidWords()
    {
        return true;
    }

    /**
     *
     */
    public function verifyPassword()
    {
        return true;
    }

    /**
     * Validation for username
     */
    public function notMatchUsername()
    {
        return true;
    }

    public function requireCapitalLetterValue()
    {
        return true;
    }

    public function requireLowerLetterValue()
    {
        return true;
    }

    public function requiredNumberValue()
    {
        return true;
    }

    public function newPasswordDifferentFromCurrent()
    {
        return true;
    }
}
