<?php

namespace App\Providers;

use Illuminate\Support\Facades\Hash;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Validator;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Validator::extend('correct_password', function ($attribute, $value, $parameters, $validator) {
            $user = auth()->user();

            return Hash::check($value, $user->password_hash);
        }, 'The :attribute is not correct for the current user.');
    }
}
