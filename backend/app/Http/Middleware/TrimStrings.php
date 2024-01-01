<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\TrimStrings as Middleware;

class TrimStrings extends Middleware
{
    /**
     * The names of the attributes that should not be trimmed.
     *
     * @var array<int, string>
     */
    protected $except = [
        "currentPassword",
        "current_password",
        "newPassword",
        "new_password",
        "confirmPassword",
        "confirm_password",
        "confirmNewPassword",
        "confirm_new_password",
        "passwordConfirmation",
        "passwordReg",
        "passwordLog",
        'current_password',
        'password',
        'password_confirmation',
    ];
}
