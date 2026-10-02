package com.shaktipanchang.app;

import android.content.Context;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Locale;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;
import java.util.TimeZone;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.WebSocket;
import okhttp3.WebSocketListener;

/** Indian woman voice: hi-IN-SwaraNeural. Needs internet. */
public final class IndianVoice {
    private static final String TOKEN = "6A5AA1D4EAFF4E9FB37E23D68491D6F4";
    private static final String VOICE = "hi-IN-SwaraNeural";
    private static final OkHttpClient CLIENT = new OkHttpClient.Builder()
        .connectTimeout(12, TimeUnit.SECONDS)
        .readTimeout(25, TimeUnit.SECONDS)
        .build();

    private IndianVoice() {}

    public static File synthesize(Context context, String text) throws Exception {
        String spoken = text == null ? "" : text.trim();
        if (spoken.isEmpty()) throw new IllegalArgumentException("empty");
        File cached = new File(context.getFilesDir(), "uma-" + cacheKey(spoken) + ".mp3");
        if (cached.exists() && cached.length() > 400) return cached;
        byte[] mp3 = request(spoken);
        if (mp3.length < 400) throw new IllegalStateException("no audio");
        try (FileOutputStream fos = new FileOutputStream(cached)) {
            fos.write(mp3);
        }
        return cached;
    }

    private static byte[] request(String text) throws Exception {
        String gec = secMsGec();
        String id = UUID.randomUUID().toString().replace("-", "");
        String url = "wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1"
            + "?TrustedClientToken=" + TOKEN
            + "&ConnectionId=" + id
            + "&Sec-MS-GEC=" + gec
            + "&Sec-MS-GEC-Version=1-143.0.3650.75";
        java.text.SimpleDateFormat fmt = new java.text.SimpleDateFormat(
            "EEE MMM dd yyyy HH:mm:ss 'GMT+0000 (Coordinated Universal Time)'",
            Locale.US
        );
        fmt.setTimeZone(TimeZone.getTimeZone("UTC"));
        String stamp = fmt.format(new java.util.Date());
        String ssml = "<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'>"
            + "<voice name='" + VOICE + "'>"
            + "<prosody pitch='-4Hz' rate='-6%' volume='+0%'>"
            + escape(text)
            + "</prosody></voice></speak>";
        String config = "X-Timestamp:" + stamp + "\r\n"
            + "Content-Type:application/json; charset=utf-8\r\n"
            + "Path:speech.config\r\n\r\n"
            + "{\"context\":{\"synthesis\":{\"audio\":{\"metadataoptions\":{\"sentenceBoundaryEnabled\":\"false\",\"wordBoundaryEnabled\":\"false\"},\"outputFormat\":\"audio-24khz-48kbitrate-mono-mp3\"}}}}";
        String payload = "X-RequestId:" + id + "\r\n"
            + "Content-Type:application/ssml+xml\r\n"
            + "X-Timestamp:" + stamp + "Z\r\n"
            + "Path:ssml\r\n\r\n"
            + ssml;

        ByteArrayOutputStream audio = new ByteArrayOutputStream();
        CountDownLatch done = new CountDownLatch(1);
        AtomicReference<Exception> failure = new AtomicReference<>();
        Request request = new Request.Builder()
            .url(url)
            .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0")
            .header("Origin", "chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold")
            .header("Pragma", "no-cache")
            .header("Cache-Control", "no-cache")
            .build();
        WebSocket socket = CLIENT.newWebSocket(request, new WebSocketListener() {
            @Override
            public void onOpen(WebSocket webSocket, Response response) {
                webSocket.send(config);
                webSocket.send(payload);
            }

            @Override
            public void onMessage(WebSocket webSocket, String textMessage) {
                if (textMessage != null && textMessage.contains("Path:turn.end")) {
                    done.countDown();
                    webSocket.close(1000, "done");
                }
            }

            @Override
            public void onMessage(WebSocket webSocket, okio.ByteString bytes) {
                byte[] raw = bytes.toByteArray();
                if (raw.length < 2) return;
                int headerLen = ((raw[0] & 0xff) << 8) | (raw[1] & 0xff);
                int body = 2 + headerLen;
                if (body > raw.length) return;
                String header = new String(raw, 2, headerLen, StandardCharsets.UTF_8);
                if (header.contains("Path:audio") && header.contains("audio/mpeg")) {
                    audio.write(raw, body, raw.length - body);
                }
            }

            @Override
            public void onFailure(WebSocket webSocket, Throwable t, Response response) {
                failure.set(t instanceof Exception ? (Exception) t : new Exception(t));
                done.countDown();
            }

            @Override
            public void onClosed(WebSocket webSocket, int code, String reason) {
                done.countDown();
            }
        });
        if (!done.await(22, TimeUnit.SECONDS)) {
            socket.cancel();
            throw new Exception("voice timeout");
        }
        if (failure.get() != null && audio.size() < 400) throw failure.get();
        return audio.toByteArray();
    }

    private static String cacheKey(String text) throws Exception {
        byte[] hash = MessageDigest.getInstance("SHA-256").digest(text.getBytes(StandardCharsets.UTF_8));
        StringBuilder hex = new StringBuilder();
        for (int i = 0; i < 8; i++) hex.append(String.format(Locale.US, "%02x", hash[i]));
        return hex.toString();
    }

    private static String secMsGec() throws Exception {
        double ticks = System.currentTimeMillis() / 1000.0;
        ticks += 11644473600.0;
        ticks -= ticks % 300.0;
        ticks *= 1e7;
        String raw = String.format(Locale.US, "%.0f%s", ticks, TOKEN);
        byte[] hash = MessageDigest.getInstance("SHA-256").digest(raw.getBytes(StandardCharsets.US_ASCII));
        StringBuilder hex = new StringBuilder();
        for (byte b : hash) hex.append(String.format(Locale.US, "%02X", b));
        return hex.toString();
    }

    private static String escape(String text) {
        return text
            .replace("&", "&" + "amp;")
            .replace("<", "&" + "lt;")
            .replace(">", "&" + "gt;")
            .replace("\"", "")
            .replace("*", "")
            .replace("#", "");
    }
}
