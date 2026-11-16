SHAKTI PANCHANG — UMA SERVER

Public URL:
  https://myshivshakti.in/shaktipanchang/uma/v1/uma.php

Upload these files into myshivshakti.in/shaktipanchang/uma/v1/:
  uma.php
  config.php (keep your existing config.php or copy from config.php.example)
  .htaccess

PRIORITY:
  Gemini (Vertex Express AQ.* or AI Studio AIza*) -> OpenRouter (openrouter/free) -> app's local engine

NOTES:
1. If using a standard Gemini Developer API key (starts with AIza...), or a Vertex AI Express key (starts with AQ...), set $GEMINI_MODEL = 'gemini-3.8-flash'; and $GEMINI_ENABLED = true;
2. $OPENROUTER_API_KEY uses 'openrouter/free' as automatic fallback.
3. Do not commit config.php. Do not put the keys in GitHub or in the APK.
