<?php
declare(strict_types=1);

/*
 * UMA AI SERVER — SHAKTI PANCHANG (v6 — Gemini 3.8 Flash / Auth Key AQ. or AIza + OpenRouter)
 * Priority: Gemini (generativelanguage.googleapis.com + aiplatform.googleapis.com) -> OpenRouter
 * If both fail, the app uses its own local Vedic engine.
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
        'version' => 6,
        'gemini' => !empty($GEMINI_ENABLED) && uma_configured((string)($GEMINI_API_KEY ?? ''), 'PASTE_YOUR_GEMINI_API_KEY_HERE'),
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

$rawLang = strtolower(substr(trim((string)($input['lang'] ?? 'hi')), 0, 2));
$lang = in_array($rawLang, ['hi', 'en', 'gu'], true) ? $rawLang : 'hi';

$maxLen = (int)($UMA_MAX_INPUT_LENGTH ?? 16000);
$clip = static function (string $text, int $limit = 0) use ($maxLen): string {
    $text = trim($text);
    $cap = $limit > 0 ? $limit : $maxLen;
    if (function_exists('mb_substr')) {
        return mb_substr($text, 0, $cap);
    }
    return substr($text, 0, $cap);
};

$langRule = match ($lang) {
    'en' => 'LANGUAGE RULE: Respond naturally in clear, articulate English. Keep any sacred Sanskrit shlokas in Devanagari followed by a brief English meaning when helpful.',
    'gu' => 'LANGUAGE RULE: Respond naturally in pure, warm Gujarati script (ગુજરાતી લિપિ). Keep sacred Sanskrit shlokas in Devanagari followed by a brief Gujarati meaning when helpful.',
    default => 'LANGUAGE RULE: Respond naturally in clear, warm Devanagari Hindi (or conversational Hindi if the user writes in Hinglish). Include brief Sanskrit shlokas only when truly fitting.',
};
$chipLangName = match ($lang) {
    'en' => 'English',
    'gu' => 'Gujarati',
    default => 'Hindi',
};

$defaultSystem = <<<PROMPT
You are "UMA" (उमा) — an intelligent, warm, articulate AI companion and scholar of Sanatan Dharma, Vedic Jyotish (Parashari, Jaimini, KP, Nadi), Chaldean/Pythagorean Numerology (Ank Shastra), Vastu, Panchang, Hindu scriptures, AND everyday life, career, relationships, business, mindset, technology, and general knowledge.

{$langRule}

CORE CONVERSATIONAL INTELLIGENCE (Respond with the clarity and depth of Gemini / ChatGPT):
1. ANSWER THE EXACT QUESTION DIRECTLY & NATURALLY:
   - Read the user's message and conversation history carefully and answer directly what they actually asked, with genuine depth, clarity, nuance, and warmth.
   - If the user asks a general question (motivation, relationship advice, business/career decision, scripture story/meaning, science, daily life, or a follow-up like "explain simply" / "give examples"), answer naturally like a super-smart conversational AI — do NOT force a rigid astrology report template or dump Lagna/Dasha boilerplate where it wasn't asked.
   - If the user asks about astrology, Kundali, marriage timing, career yogas, Panchang, Muhurat, Numerology (Mulank/Bhagyank/Namank/Lo Shu), or Vedic remedies, weave in the REAL verified planets, houses, Dashas, and numbers from the provided context. Never invent chart facts, and NEVER mention Grahan Yoga unless Rahu/Ketu truly conjoins Sun/Moon in the context.
   - Only produce a structured multi-section astrology report or 6-point Upay Parchi when the user explicitly requests a full chart reading or remedy slip.

2. CLEAN FORMATTING & NATURAL TONE:
   - Use crisp paragraphs, **bold** key points, and clean bullet lists where helpful.
   - Match length to the question: brief and direct for quick questions; thorough and structured for complex questions.

3. FOLLOW-UP SUGGESTIONS:
   - At the very end of your response, add a separator and 3 relevant clickable follow-up questions in {$chipLangName} using this exact marker:
---
[अगले प्रश्न]:
• Question 1
• Question 2
• Question 3
PROMPT;

$system = trim((string)($input['systemPrompt'] ?? ''));
if ($system === '' || strlen($system) < 80) {
    $system = $defaultSystem;
}
$system = $clip($system, 8000);

$panchang = trim((string)($input['panchangContext'] ?? ''));
$kundali = trim((string)($input['kundaliContext'] ?? ''));
$contextParts = [];
if ($panchang !== '') {
    $contextParts[] = "[Today's Panchang]\n" . $clip($panchang, 3000);
}
if ($kundali !== '') {
    $contextParts[] = "[Verified User Horoscope / Numerology Context — use ONLY if relevant to the user's question]\n" . $clip($kundali, 5000);
}
$contextParts[] = "[User Message]\n" . $clip($query, 4000);
$currentUserMessage = implode("\n\n", $contextParts);

// Build normalized multi-turn history
$maxMsgs = max(2, min(16, (int)($UMA_MAX_MESSAGES ?? 10)));
$openAiTurns = [];
$geminiTurns = [];
$history = $input['chatHistory'] ?? [];
if (is_array($history) && $history) {
    foreach (array_slice($history, -$maxMsgs) as $msg) {
        if (!is_array($msg)) {
            continue;
        }
        $txt = $clip((string)($msg['text'] ?? ''), 2500);
        if ($txt === '') {
            continue;
        }
        $isUma = (($msg['sender'] ?? '') === 'uma');
        if (count($openAiTurns) === 0 && $isUma) {
            continue;
        }
        $oRole = $isUma ? 'assistant' : 'user';
        $gRole = $isUma ? 'model' : 'user';

        $lastIdx = count($openAiTurns) - 1;
        if ($lastIdx >= 0 && $openAiTurns[$lastIdx]['role'] === $oRole) {
            $openAiTurns[$lastIdx]['content'] .= "\n\n" . $txt;
            $geminiTurns[$lastIdx]['parts'][0]['text'] .= "\n\n" . $txt;
        } else {
            $openAiTurns[] = ['role' => $oRole, 'content' => $txt];
            $geminiTurns[] = ['role' => $gRole, 'parts' => [['text' => $txt]]];
        }
    }
    $lastIdx = count($openAiTurns) - 1;
    if ($lastIdx >= 0 && $openAiTurns[$lastIdx]['role'] === 'user') {
        if (trim($openAiTurns[$lastIdx]['content']) === trim($query)) {
            array_pop($openAiTurns);
            array_pop($geminiTurns);
        } else {
            $openAiTurns[] = ['role' => 'assistant', 'content' => 'Understood.'];
            $geminiTurns[] = ['role' => 'model', 'parts' => [['text' => 'Understood.']]];
        }
    }
}

function uma_reply(string $text, string $provider, string $model, array $fallbackReason = []): void {
    $text = trim($text);
    $text = (string)preg_replace('/^```(?:\w+)?\s*/', '', $text);
    $text = trim((string)preg_replace('/\s*```$/', '', $text));
    if ($text === '') {
        return;
    }
    $out = [
        'ok' => true,
        'text' => $text,
        'provider' => $provider,
        'model' => $model,
    ];
    if ($fallbackReason) {
        $out['fallbackReason'] = $fallbackReason;
    }
    http_response_code(200);
    echo json_encode($out, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function uma_extract_openai_text(array $decoded): string {
    $content = $decoded['choices'][0]['message']['content'] ?? '';
    if (is_string($content)) {
        return $content;
    }
    if (is_array($content)) {
        $out = '';
        foreach ($content as $part) {
            if (is_array($part) && isset($part['text']) && is_string($part['text'])) {
                $out .= $part['text'];
            }
        }
        return $out;
    }
    return '';
}

function uma_post(string $url, array $payload, array $headers, int $timeout): array {
    $body = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($body === false) {
        return ['ok' => false, 'status' => 0, 'error' => 'json_encode_failed', 'data' => null];
    }
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $body,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_TIMEOUT => $timeout,
        CURLOPT_HTTPHEADER => $headers,
    ]);
    $response = curl_exec($ch);
    $status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlErr = curl_error($ch);
    curl_close($ch);

    if ($response === false) {
        return ['ok' => false, 'status' => $status, 'error' => $curlErr ?: 'curl_failed', 'data' => null];
    }
    $decoded = json_decode($response, true);
    if ($status < 200 || $status >= 300 || !is_array($decoded)) {
        $errMsg = is_array($decoded)
            ? (string)($decoded['error']['message'] ?? $decoded['error'] ?? ('HTTP_' . $status))
            : ('HTTP_' . $status);
        return ['ok' => false, 'status' => $status, 'error' => substr($errMsg, 0, 140), 'data' => null];
    }
    return ['ok' => true, 'status' => $status, 'error' => '', 'data' => $decoded];
}

$timeout = max(10, min(18, (int)($UMA_TIMEOUT_SECONDS ?? 16)));
$maxOut = max(800, (int)($UMA_MAX_OUTPUT_TOKENS ?? 1600));
$providerErrors = [];

// 1. GEMINI (Tries Gemini API generativelanguage.googleapis.com AND Vertex/Agent Platform if AQ.* key)
$geminiKey = trim((string)($GEMINI_API_KEY ?? ''));
$geminiModel = trim((string)($GEMINI_MODEL ?? 'gemini-3.8-flash'));
if (!empty($GEMINI_ENABLED) && uma_configured($geminiKey, 'PASTE_YOUR_GEMINI_API_KEY_HERE')) {
    $geminiContents = array_merge(
        $geminiTurns,
        [['role' => 'user', 'parts' => [['text' => $currentUserMessage]]]]
    );
    $geminiPayload = [
        'systemInstruction' => ['parts' => [['text' => $system]]],
        'contents' => $geminiContents,
        'generationConfig' => [
            'temperature' => 0.7,
            'maxOutputTokens' => $maxOut,
        ],
    ];
    $geminiHeaders = [
        'Content-Type: application/json',
        'x-goog-api-key: ' . $geminiKey,
    ];

    $geminiTimeout = min($timeout, 10);
    $glModels = array_values(array_unique(array_filter([
        $geminiModel !== '' ? $geminiModel : null,
        'gemini-3.8-flash',
        'gemini-3.5-flash-lite',
        'gemini-3.1-flash-lite',
        'gemini-2.5-flash',
    ])));
    foreach ($glModels as $gm) {
        $url = 'https://generativelanguage.googleapis.com/v1beta/models/'
            . rawurlencode($gm)
            . ':generateContent';
        $res = uma_post($url, $geminiPayload, $geminiHeaders, $geminiTimeout);
        if ($res['ok'] && is_array($res['data'])) {
            $text = '';
            foreach (($res['data']['candidates'][0]['content']['parts'] ?? []) as $part) {
                if (isset($part['text']) && is_string($part['text'])) {
                    $text .= $part['text'];
                }
            }
            uma_reply($text, 'gemini', $gm);
        }
        $providerErrors['gemini:' . $gm] = $res['status'] . ' ' . $res['error'];
        if (in_array($res['status'], [401, 402, 403], true)) {
            break;
        }
    }

    if (str_starts_with($geminiKey, 'AQ.')) {
        $vertexModels = array_values(array_unique(array_filter([
            ($geminiModel !== '' && $geminiModel !== 'gemini-flash-latest') ? $geminiModel : null,
            'gemini-3.8-flash',
            'gemini-2.5-flash',
        ])));
        foreach ($vertexModels as $vm) {
            $url = 'https://aiplatform.googleapis.com/v1/publishers/google/models/'
                . rawurlencode($vm)
                . ':generateContent';
            $res = uma_post($url, $geminiPayload, $geminiHeaders, $timeout);
            if ($res['ok'] && is_array($res['data'])) {
                $text = '';
                foreach (($res['data']['candidates'][0]['content']['parts'] ?? []) as $part) {
                    if (isset($part['text']) && is_string($part['text'])) {
                        $text .= $part['text'];
                    }
                }
                uma_reply($text, 'gemini', $vm);
            }
            $providerErrors['gemini_vertex:' . $vm] = $res['status'] . ' ' . $res['error'];
            if (in_array($res['status'], [401, 402, 403], true)) {
                break;
            }
        }
    }
}

// 2. OPENROUTER
$orKey = trim((string)($OPENROUTER_API_KEY ?? ''));
$orModel = trim((string)($OPENROUTER_MODEL ?? 'openrouter/free'));
if (!empty($OPENROUTER_ENABLED) && uma_configured($orKey, 'PASTE_YOUR_OPENROUTER_KEY_HERE')) {
    $orMessagesWithSys = array_merge(
        [['role' => 'system', 'content' => $system]],
        $openAiTurns,
        [['role' => 'user', 'content' => $currentUserMessage]]
    );
    $orMessagesInlineSys = array_merge(
        $openAiTurns,
        [['role' => 'user', 'content' => "[Instructions]\n" . $system . "\n\n" . $currentUserMessage]]
    );

    $orAttempts = [
        ['model' => $orModel, 'messages' => $orMessagesWithSys],
        ['model' => $orModel, 'messages' => $orMessagesInlineSys],
    ];

    foreach ($orAttempts as $idx => $attempt) {
        $res = uma_post('https://openrouter.ai/api/v1/chat/completions', [
            'model' => $attempt['model'],
            'temperature' => 0.7,
            'max_tokens' => $maxOut,
            'messages' => $attempt['messages'],
        ], [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $orKey,
            'HTTP-Referer: https://myshivshakti.in',
            'X-Title: SHAKTI PANCHANG - UMA',
        ], $timeout);
        if ($res['ok'] && is_array($res['data'])) {
            uma_reply(uma_extract_openai_text($res['data']), 'openrouter', $attempt['model'], $providerErrors);
        }
        $providerErrors['openrouter#' . $idx . ':' . $attempt['model']] = $res['status'] . ' ' . $res['error'];
        if (in_array($res['status'], [401, 402, 403], true)) {
            break;
        }
    }
}

http_response_code(200);
echo json_encode([
    'ok' => false,
    'error' => 'ALL_UNAVAILABLE',
    'details' => $providerErrors,
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
exit;
