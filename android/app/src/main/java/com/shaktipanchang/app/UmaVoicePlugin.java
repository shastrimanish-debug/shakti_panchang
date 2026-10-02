package com.shaktipanchang.app;

import android.Manifest;
import android.content.Intent;
import android.os.Bundle;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;

import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import android.media.AudioAttributes;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.speech.tts.Voice;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@CapacitorPlugin(
    name = "UmaVoice",
    permissions = {
        @Permission(strings = { Manifest.permission.RECORD_AUDIO }, alias = "microphone")
    }
)
public class UmaVoicePlugin extends Plugin {
    private SpeechRecognizer recognizer;
    private PluginCall listenCall;
    private TextToSpeech tts;
    private boolean ttsReady = false;
    private PluginCall speakCall;
    private final List<Runnable> ttsQueue = new ArrayList<>();
    private final List<PluginCall> waitingSpeak = new ArrayList<>();

    @PluginMethod
    public void listen(PluginCall call) {
        if (getPermissionState("microphone") != PermissionState.GRANTED) {
            requestPermissionForAlias("microphone", call, "micPermsCallback");
            return;
        }
        startListen(call);
    }

    @PermissionCallback
    private void micPermsCallback(PluginCall call) {
        if (getPermissionState("microphone") == PermissionState.GRANTED) {
            startListen(call);
        } else {
            call.reject("Microphone permission denied");
        }
    }

    @PluginMethod
    public void stop(PluginCall call) {
        if (getActivity() == null) {
            call.resolve();
            return;
        }
        getActivity().runOnUiThread(() -> {
            if (recognizer != null) {
                recognizer.stopListening();
            }
            if (listenCall != null) {
                listenCall.resolve(new JSObject().put("text", ""));
                listenCall = null;
            }
        });
        call.resolve();
    }

    private void startListen(PluginCall call) {
        if (getContext() == null || !SpeechRecognizer.isRecognitionAvailable(getContext())) {
            call.reject("Speech recognition is not available");
            return;
        }
        call.setKeepAlive(true);
        getActivity().runOnUiThread(() -> {
            if (recognizer != null) {
                recognizer.destroy();
                recognizer = null;
            }
            listenCall = call;
            recognizer = SpeechRecognizer.createSpeechRecognizer(getContext());
            recognizer.setRecognitionListener(new RecognitionListener() {
                @Override public void onReadyForSpeech(Bundle params) {}
                @Override public void onBeginningOfSpeech() {}
                @Override public void onRmsChanged(float rmsdB) {}
                @Override public void onBufferReceived(byte[] buffer) {}
                @Override public void onEndOfSpeech() {}

                @Override
                public void onError(int error) {
                    PluginCall pending = listenCall;
                    listenCall = null;
                    if (pending != null) {
                        pending.reject("listen error " + error);
                    }
                }

                @Override
                public void onResults(Bundle results) {
                    ArrayList<String> matches = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                    String text = (matches != null && !matches.isEmpty()) ? matches.get(0) : "";
                    JSObject ret = new JSObject();
                    ret.put("text", text);
                    PluginCall pending = listenCall;
                    listenCall = null;
                    if (pending != null) {
                        pending.resolve(ret);
                    }
                }

                @Override public void onPartialResults(Bundle partialResults) {}
                @Override public void onEvent(int eventType, Bundle params) {}
            });

            Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
            intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
            intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "hi-IN");
            intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, "hi-IN");
            intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, false);
            intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3);
            recognizer.startListening(intent);
        });
    }

    @PluginMethod
    public void speak(PluginCall call) {
        String text = call.getString("text", "");
        if (text == null || text.trim().isEmpty()) {
            call.resolve();
            return;
        }
        call.setKeepAlive(true);
        waitingSpeak.add(call);
        ensureTts(() -> speakNow(call, text.trim()));
    }

    @PluginMethod
    public void stopSpeaking(PluginCall call) {
        if (tts != null) tts.stop();
        PluginCall pending = speakCall;
        speakCall = null;
        if (pending != null) pending.resolve();
        call.resolve();
    }

    private void ensureTts(Runnable then) {
        if (tts != null && ttsReady) {
            then.run();
            return;
        }
        ttsQueue.add(then);
        if (tts != null) return;
        startEngine("com.google.android.tts");
    }

    private void startEngine(String engine) {
        if (tts != null) {
            tts.shutdown();
            tts = null;
        }
        ttsReady = false;
        TextToSpeech.OnInitListener listener = status -> {
            if (status != TextToSpeech.SUCCESS) {
                if ("com.google.android.tts".equals(engine)) {
                    new Handler(Looper.getMainLooper()).post(() -> startEngine(null));
                } else {
                    ttsQueue.clear();
                    List<PluginCall> stuck = new ArrayList<>(waitingSpeak);
                    waitingSpeak.clear();
                    for (PluginCall stuckCall : stuck) {
                        stuckCall.reject("Voice engine unavailable");
                    }
                }
                return;
            }
            configureScholarVoice();
            ttsReady = true;
            List<Runnable> pending = new ArrayList<>(ttsQueue);
            ttsQueue.clear();
            for (Runnable job : pending) job.run();
        };
        if (engine == null) {
            tts = new TextToSpeech(getContext(), listener);
        } else {
            tts = new TextToSpeech(getContext(), listener, engine);
        }
    }

    private void configureScholarVoice() {
        if (tts == null) return;
        tts.setLanguage(new Locale("hi", "IN"));
        Voice chosen = pickFemaleHindiVoice(tts.getVoices());
        if (chosen != null) tts.setVoice(chosen);
        // Slower than conversation, slightly lower than a young voice: a 40-year-old आचार्या.
        tts.setSpeechRate(0.76f);
        tts.setPitch(0.92f);
        if (Build.VERSION.SDK_INT >= 21) {
            tts.setAudioAttributes(new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_MEDIA)
                .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                .build());
        }
    }

    private Voice pickFemaleHindiVoice(Set<Voice> voices) {
        if (voices == null) return null;
        Voice best = null;
        int bestScore = Integer.MIN_VALUE;
        for (Voice voice : voices) {
            if (voice == null || voice.getLocale() == null) continue;
            String lang = voice.getLocale().toLanguageTag().toLowerCase(Locale.ROOT);
            if (!lang.startsWith("hi")) continue;
            String name = voice.getName() == null ? "" : voice.getName().toLowerCase(Locale.ROOT);
            int score = 10;
            if (lang.contains("-in")) score += 15;
            if (name.contains("hfc") || name.contains("hfd") || name.contains("hia")
                || name.contains("female") || name.contains("wavenet-a") || name.contains("wavenet-d")) {
                score += 80;
            }
            if (name.contains("neural") || name.contains("wavenet") || name.contains("studio") || name.contains("network")) {
                score += 30;
            }
            if (voice.getQuality() >= Voice.QUALITY_VERY_HIGH) score += 24;
            else if (voice.getQuality() >= Voice.QUALITY_HIGH) score += 12;
            if (name.contains("male") || name.contains("-hid") || name.contains("hie")
                || name.contains("wavenet-b") || name.contains("wavenet-c")) {
                score -= 70;
            }
            if (score > bestScore) {
                bestScore = score;
                best = voice;
            }
        }
        return best;
    }

    private void speakNow(PluginCall call, String text) {
        if (tts == null) {
            call.reject("Voice engine unavailable");
            return;
        }
        Voice chosen = pickFemaleHindiVoice(tts.getVoices());
        if (chosen != null) tts.setVoice(chosen);
        waitingSpeak.remove(call);
        PluginCall previous = speakCall;
        speakCall = call;
        if (previous != null) previous.resolve();
        String utteranceId = "uma-" + System.currentTimeMillis();
        tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
            @Override public void onStart(String id) {}

            @Override
            public void onDone(String id) {
                if (speakCall == call) {
                    speakCall = null;
                    call.resolve();
                }
            }

            @Override
            public void onError(String id) {
                if (speakCall == call) {
                    speakCall = null;
                    call.reject("Could not speak");
                }
            }
        });
        int queued = tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, utteranceId);
        if (queued == TextToSpeech.ERROR) {
            speakCall = null;
            call.reject("Could not speak");
        }
    }
}
