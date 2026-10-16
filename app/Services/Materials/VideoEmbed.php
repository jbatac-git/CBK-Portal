<?php

namespace App\Services\Materials;

/**
 * Turns an admin-supplied video link into a safe embed source.
 *
 * Only a fixed set of hosts is accepted (plus direct https .mp4/.webm
 * files), and the embed URL is rebuilt from the extracted ID — the
 * original link is never echoed into an iframe as-is.
 */
class VideoEmbed
{
    public const YOUTUBE_HOSTS = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'];

    public const VIMEO_HOSTS = ['vimeo.com', 'player.vimeo.com'];

    public const DRIVE_HOSTS = ['drive.google.com'];

    /**
     * Null when the link is not a supported, parseable video URL.
     *
     * @return array{kind: 'youtube'|'vimeo'|'drive'|'direct', src: string}|null
     */
    public static function fromUrl(?string $url): ?array
    {
        if (! is_string($url) || $url === '' || filter_var($url, FILTER_VALIDATE_URL) === false) {
            return null;
        }

        $parts = parse_url($url);

        if (($parts['scheme'] ?? null) !== 'https' || empty($parts['host']) || isset($parts['user']) || isset($parts['pass'])) {
            return null;
        }

        $host = strtolower($parts['host']);
        $path = $parts['path'] ?? '/';
        parse_str($parts['query'] ?? '', $query);

        if (in_array($host, self::YOUTUBE_HOSTS, true)) {
            $id = self::youtubeId($host, $path, $query);

            return $id ? ['kind' => 'youtube', 'src' => "https://www.youtube-nocookie.com/embed/{$id}?rel=0&modestbranding=1"] : null;
        }

        if (in_array($host, self::VIMEO_HOSTS, true)) {
            // vimeo.com/123456, vimeo.com/channels/x/123456, player.vimeo.com/video/123456
            return preg_match('~/(\d{6,12})(?:/|$)~', $path, $m)
                ? ['kind' => 'vimeo', 'src' => "https://player.vimeo.com/video/{$m[1]}"]
                : null;
        }

        if (in_array($host, self::DRIVE_HOSTS, true)) {
            $id = preg_match('~^/file/d/([A-Za-z0-9_-]{10,})~', $path, $m)
                ? $m[1]
                : (is_string($query['id'] ?? null) && preg_match('/^[A-Za-z0-9_-]{10,}$/', $query['id']) ? $query['id'] : null);

            return $id ? ['kind' => 'drive', 'src' => "https://drive.google.com/file/d/{$id}/preview"] : null;
        }

        if (preg_match('~\.(mp4|webm)$~i', $path)) {
            return ['kind' => 'direct', 'src' => $url];
        }

        return null;
    }

    private static function youtubeId(string $host, string $path, array $query): ?string
    {
        $id = match (true) {
            $host === 'youtu.be' => explode('/', trim($path, '/'))[0] ?? null,
            $path === '/watch' => is_string($query['v'] ?? null) ? $query['v'] : null,
            (bool) preg_match('~^/(?:embed|shorts|live)/([^/]+)~', $path, $m) => $m[1],
            default => null,
        };

        return is_string($id) && preg_match('/^[A-Za-z0-9_-]{11}$/', $id) ? $id : null;
    }
}
