<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Symfony\Component\HttpFoundation\Response;

class EnsureFrontendRequestsAreStateful
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        $statefulHosts = Config::get('sanctum.stateful', []);

        if ($this->isStatefulHost($request, $statefulHosts)) {
            return $this->addCookieToResponse($request, $next($request));
        }

        return $next($request);
    }

    /**
     * Check if the request originates from a stateful host.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  array  $statefulHosts
     * @return bool
     */
    private function isStatefulHost(Request $request, array $statefulHosts): bool
    {
        $refererHost = parse_url($request->headers->get('referer'), PHP_URL_HOST);
        return in_array($refererHost, $statefulHosts);
    }

    /**
     * Add the Sanctum cookie to the response.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Symfony\Component\HttpFoundation\Response  $response
     * @return \Symfony\Component\HttpFoundation\Response
     */
    private function addCookieToResponse(Request $request, Response $response): Response
    {
        $response->headers->setCookie(
            config('sanctum.cookie'),
            $request->session()->token(),
            config('sanctum.expiration'),
            null,
            null,
            config('sanctum.same_site'),
            config('app.debug') ? false : config('sanctum.secure'),
            false,
            config('sanctum.http_only', true),
        );

        return $response;
    }
}
