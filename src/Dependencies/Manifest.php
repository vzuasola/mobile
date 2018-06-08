<?php

namespace App\MobileEntry\Dependencies;

class Manifest
{
    public static function create($container)
    {
        $manifest = [];

        try {
            $cwd = getcwd();
            $raw = @file_get_contents("$cwd/mix-manifest.json");
            $raw = json_decode($raw, true);
        } catch (\Exception $e) {
            $raw = [];
        }

        foreach ($raw as $key => $value) {
            $key = ltrim($key, '/');
            $manifest[$key] = $value;
        }

        return $manifest;
    }
}
