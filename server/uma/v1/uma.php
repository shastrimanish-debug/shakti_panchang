<?php
declare(strict_types=1);

/*
 * UMA AI SERVER — SHAKTI PANCHANG
 * Priority: Grok (xAI) -> Gemini -> OpenRouter
 * If every provider fails, the app uses its own local Vedic engine.
 * API keys stay in config.php. Never inside the APK.
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, x-license-token');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$config = __DIR__ . '/config.php';
if (!is_file($config)) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'config.php not found'], JSON_UNESCAPED_UNICODE);
    exit;
}
require_once $config;

function uma_configured(string $key, string $placeholder): bool {
    $key = trim($key);
    return $key !== '' && $key !== $placeholder;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode([
        'ok' => true,
        'service' => 'uma',
        'gemini' => !empty($GEMINI_ENABLED) && uma_configured((string)($GEMINI_API_KEY ?? ''), 'PASTE_YOUR_GEMINI_API_KEY_HERE'),
        'grok' => !empty($XAI_ENABLED) && uma_configured((string)($XAI_API_KEY ?? ''), 'PASTE_YOUR_XAI_API_KEY_HERE'),
        'openrouter' => !empty($OPENROUTER_ENABLED) && uma_configured((string)($OPENROUTER_API_KEY ?? ''), 'PASTE_YOUR_OPENROUTER_KEY_HERE'),
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'POST required'], JSON_UNESCAPED_UNICODE);
    exit;
}

$raw = file_get_contents('php://input');
$input = json_decode($raw ?: '', true);
if (!is_array($input)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid JSON'], JSON_UNESCAPED_UNICODE);
    exit;
}

$query = trim((string)($input['query'] ?? ''));
if ($query === '') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'query is required'], JSON_UNESCAPED_UNICODE);
    exit;
}

$maxLen = (int)($UMA_MAX_INPUT_LENGTH ?? 12000);
$clip = static function (string $text) use ($maxLen): string {
    $text = trim($text);
    if (function_exists('mb_substr')) {
        return mb_substr($text, 0, $maxLen);
    }
    return substr($text, 0, $maxLen);
};

$defaultSystem = <<<'PROMPT'
You are UMA (उमा), a Prakhand Vedic Jyotish Acharya with 50 years of Parashari, Jaimini and Nadi practice.
Answer the question that was just asked. The first two sentences must be the answer.
Do not paste the same four headings on every reply.
If the birth chart is already in the context, do not ask again for name, date, time or place.
Never invent a past year or an event that is not supported by the chart.
Give a remedy only when the question is about a problem or an upaya: one mantra, one japa count, and one daan for the planet that is actually weak.
Reply in the user's language. Never say you are an AI language model.
PROMPT;

$system = trim((string)($input['systemPrompt'] ?? ''));
if ($system === '') {
    $system = $defaultSystem;
}
$system = $clip($system);

$parts = ['उपयोगकर्ता का प्रश्न: "' . $clip($query) . '"'];
$panchang = trim((string)($input['panchangContext'] ?? ''));
$kundali = trim((string)($input['kundaliContext'] ?? ''));
if ($panchang !== '') {
    $parts[] = "[वर्तमान पंचांग]\n" . $clip($panchang);
}
if ($kundali !== '') {
    $parts[] = "[जन्म कुंडली]\n" . $clip($kundali);
} else {
    $parts[] = "[कुंडली स्थिति]: अभी कोई जन्म कुंडली लोड नहीं है। व्यक्तिगत फल पूछा हो तो सिद्धांत बताओ और कुंडली भरने को कहो।";
}

$history = $input['chatHistory'] ?? [];
if (is_array($history) && $history) {
    $lines = [];
    foreach (array_slice($history, -1 * (int)($UMA_MAX_MESSAGES ?? 8)) as $message) {
        if (!is_array($message)) {
            continue;
        }
        $who = (($message['sender'] ?? '') === 'uma') ? 'उमा' : 'यजमान';
        $text = $clip((string)($message['text'] ?? ''));
        if ($text !== '') {
            $lines[] = $who . ': ' . $text;
        }
    }
    if ($lines) {
        $parts[] = "[पूर्व संवाद]\n" . implode("\n", $lines);
    }
}
$parts[] = 'पहले दो वाक्य सीधे इसी प्रश्न का उत्तर हों। वही चार शीर्षक दोहराना मना है। कुंडली में जो नहीं है, वह घटना मत गढ़ो।';
$userPrompt = implode("\n\n", $parts);

function uma_reply(string $text, string $provider, string $model): void {
    $text = trim($text);
    $text = (string)preg_replace('/^```(?:\w+)?\s*/', '', $text);
    $text = trim((string)preg_replace('/\s*```$/', '', $text));
    if ($text === '') {
        return;
    }
    http_response_code(200);
    echo json_encode([
        'ok' => true,
        'text' => $text,
        'provider' => $provider,
        'model' => $model,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function uma_post(string $url, array $payload, array $headers, int $timeout): ?array {
    $body = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($body === false) {
        return null;
    }
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $body,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 8,
        CURLOPT_TIMEOUT => $timeout,
        CURLOPT_HTTPHEADER => $headers,
    ]);
    $response = curl_exec($ch);
    $status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($response === false || $status < 200 || $status >= 300) {
        return null;
    }
    $decoded = json_decode($response, true);
    return is_array($decoded) ? $decoded : null;
}

$timeout = (int)($UMA_TIMEOUT_SECONDS ?? 22);
$maxOut = (int)($UMA_MAX_OUTPUT_TOKENS ?? 1200);

$xaiKey = trim((string)($XAI_API_KEY ?? ''));
$xaiModel = trim((string)($XAI_MODEL ?? 'grok-4'));
if (!empty($XAI_ENABLED) && uma_configured($xaiKey, 'PASTE_YOUR_XAI_API_KEY_HERE')) {
    $decoded = uma_post('https://api.x.ai/v1/chat/completions', [
        'model' => $xaiModel,
        'temperature' => 0.6,
        'max_tokens' => $maxOut,
        'messages' => [
            ['role' => 'system', 'content' => $system],
            ['role' => 'user', 'content' => $userPrompt],
        ],
    ], [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $xaiKey,
    ], $timeout);
    if (is_array($decoded)) {
        uma_reply((string)($decoded['choices'][0]['message']['content'] ?? ''), 'grok', $xaiModel);
    }
}

$geminiKey = trim((string)($GEMINI_API_KEY ?? ''));
$geminiModel = trim((string)($GEMINI_MODEL ?? 'gemini-2.5-flash'));
if (!empty($GEMINI_ENABLED) && uma_configured($geminiKey, 'PASTE_YOUR_GEMINI_API_KEY_HERE')) {
    $url = 'https://generativelanguage.googleapis.com/v1beta/models/'
        . rawurlencode($geminiModel)
        . ':generateContent?key=' . rawurlencode($geminiKey);
    $decoded = uma_post($url, [
        'systemInstruction' => ['parts' => [['text' => $system]]],
        'contents' => [['role' => 'user', 'parts' => [['text' => $userPrompt]]]],
        'generationConfig' => [
            'temperature' => 0.6,
            'maxOutputTokens' => $maxOut,
        ],
    ], ['Content-Type: application/json'], $timeout);
    if (is_array($decoded)) {
        $text = '';
        foreach (($decoded['candidates'][0]['content']['parts'] ?? []) as $part) {
            if (isset($part['text']) && is_string($part['text'])) {
                $text .= $part['text'];
            }
        }
        uma_reply($text, 'gemini', $geminiModel);
    }
}

$orKey = trim((string)($OPENROUTER_API_KEY ?? ''));
$orModel = trim((string)($OPENROUTER_MODEL ?? 'openrouter/free'));
if (!empty($OPENROUTER_ENABLED) && uma_configured($orKey, 'PASTE_YOUR_OPENROUTER_KEY_HERE')) {
    $decoded = uma_post('https://openrouter.ai/api/v1/chat/completions', [
        'model' => $orModel,
        'temperature' => 0.6,
        'max_tokens' => $maxOut,
        'messages' => [
            ['role' => 'system', 'content' => $system],
            ['role' => 'user', 'content' => $userPrompt],
        ],
    ], [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $orKey,
        'HTTP-Referer: https://myshivshakti.in',
        'X-Title: SHAKTI PANCHANG - UMA',
    ], $timeout);
    if (is_array($decoded)) {
        uma_reply((string)($decoded['choices'][0]['message']['content'] ?? ''), 'openrouter', $orModel);
    }
}

http_response_code(200);
echo json_encode([
    'ok' => false,
    'error' => 'ALL_UNAVAILABLE',
], JSON_UNESCAPED_UNICODE);
exit;
