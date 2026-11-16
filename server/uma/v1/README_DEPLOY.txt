SHAKTI PANCHANG — UMA SERVER

You are already in MilesWeb File Manager:
  Root > myshivshakti.in > shaktipanchang
That folder currently has only index.html. Do not replace index.html.

Create folders inside shaktipanchang:
  uma/v1/

Upload these three files into uma/v1/:
  uma.php
  config.php
  .htaccess

Public URL:
  https://myshivshakti.in/shaktipanchang/uma/v1/uma.php

STEPS
1. Copy config.php.example to config.php on your computer.
2. Paste three keys into config.php. Do not send them in chat.
   - $XAI_API_KEY from https://console.x.ai (starts with xai-). Model is grok-4. Leave $XAI_ENABLED = true.
   - Gemini and OpenRouter keys from shakti-business/bhavya/v1/config.php.
   Order inside uma.php is already Grok, then Gemini, then OpenRouter.
   Adding only the XAI lines to Bhavya's config.php does nothing: that bhavya.php never calls xAI.
3. In File Manager, open shaktipanchang, Add New > Folder named uma.
   Open uma, Add New > Folder named v1.
   Upload uma.php, config.php and .htaccess into v1.
4. Open the URL in a browser. It must say "uma" and must NOT show the keys.
   https://myshivshakti.in/shaktipanchang/uma/v1/config.php must be forbidden (403).
5. The phone app uses this URL only after the next APK build.
   Until then Uma stays on the local engine.

Do not commit config.php. Do not put the keys in GitHub or in the APK.
