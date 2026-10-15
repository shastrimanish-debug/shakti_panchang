package com.shaktipanchang.app;

import android.Manifest;
import android.app.AlarmManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.widget.Toast;

import androidx.core.content.FileProvider;

import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;

import org.json.JSONArray;
import org.json.JSONObject;

@CapacitorPlugin(
    name = "UmaDevice",
    permissions = {
        @Permission(strings = { Manifest.permission.POST_NOTIFICATIONS }, alias = "notifications")
    }
)
public class UmaDevicePlugin extends Plugin {

    @PluginMethod
    public void sharePdf(PluginCall call) {
        String base64 = call.getString("base64");
        String fileName = call.getString("fileName", "Shakti-Panchang.pdf");
        if (base64 == null || base64.isEmpty()) {
            call.reject("Missing PDF data");
            return;
        }
        try {
            byte[] bytes = Base64.decode(base64, Base64.DEFAULT);
            File dir = new File(getContext().getCacheDir(), "pdf");
            if (!dir.exists() && !dir.mkdirs()) {
                call.reject("Could not create PDF folder");
                return;
            }
            File file = new File(dir, fileName.replaceAll("[\\\\/]", "_"));
            try (FileOutputStream out = new FileOutputStream(file)) {
                out.write(bytes);
            }
            Uri uri = FileProvider.getUriForFile(
                getContext(),
                getContext().getPackageName() + ".fileprovider",
                file
            );
            Intent send = new Intent(Intent.ACTION_SEND);
            send.setType("application/pdf");
            send.putExtra(Intent.EXTRA_STREAM, uri);
            send.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            send.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getActivity().startActivity(Intent.createChooser(send, "PDF साझा करें या सेव करें"));
            call.resolve();
        } catch (Exception e) {
            call.reject("PDF share failed", e);
        }
    }

    @PluginMethod
    public void saveImage(PluginCall call) {
        String base64 = call.getString("base64");
        String fileName = call.getString("fileName", "Shakti-Panchang-HD.png");
        if (base64 == null || base64.isEmpty()) {
            call.reject("Missing image data");
            return;
        }
        try {
            if (base64.contains(",")) {
                base64 = base64.substring(base64.indexOf(',') + 1);
            }
            byte[] bytes = Base64.decode(base64, Base64.DEFAULT);
            String cleanName = fileName.replaceAll("[\\\\/]", "_");
            if (!cleanName.toLowerCase().endsWith(".png")) {
                cleanName = cleanName + ".png";
            }

            ContentResolver resolver = getContext().getContentResolver();
            ContentValues values = new ContentValues();
            values.put(MediaStore.Images.Media.DISPLAY_NAME, cleanName);
            values.put(MediaStore.Images.Media.MIME_TYPE, "image/png");
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                values.put(MediaStore.Images.Media.RELATIVE_PATH, Environment.DIRECTORY_PICTURES + "/ShaktiPanchang");
                values.put(MediaStore.Images.Media.IS_PENDING, 1);
            }

            Uri uri = resolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values);
            if (uri != null) {
                try (OutputStream out = resolver.openOutputStream(uri)) {
                    if (out != null) {
                        out.write(bytes);
                    }
                }
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    values.clear();
                    values.put(MediaStore.Images.Media.IS_PENDING, 0);
                    resolver.update(uri, values, null, null);
                }
                if (getActivity() != null) {
                    getActivity().runOnUiThread(() ->
                        Toast.makeText(getContext(), "HD पंचांग चित्र गैलरी में सेव हो गया!", Toast.LENGTH_LONG).show()
                    );
                }
                JSObject ret = new JSObject();
                ret.put("ok", true);
                ret.put("uri", uri.toString());
                call.resolve(ret);
                return;
            }
            // Fallback to native chooser if MediaStore insert returned null
            shareImageInternal(bytes, cleanName, "");
            call.resolve();
        } catch (Exception e) {
            call.reject("Image save failed", e);
        }
    }

    @PluginMethod
    public void shareImage(PluginCall call) {
        String base64 = call.getString("base64");
        String fileName = call.getString("fileName", "Shakti-Panchang-HD.png");
        String text = call.getString("text", "");
        if (base64 == null || base64.isEmpty()) {
            call.reject("Missing image data");
            return;
        }
        try {
            if (base64.contains(",")) {
                base64 = base64.substring(base64.indexOf(',') + 1);
            }
            byte[] bytes = Base64.decode(base64, Base64.DEFAULT);
            shareImageInternal(bytes, fileName.replaceAll("[\\\\/]", "_"), text);
            call.resolve();
        } catch (Exception e) {
            call.reject("Image share failed", e);
        }
    }

    private void shareImageInternal(byte[] bytes, String fileName, String text) throws Exception {
        File dir = new File(getContext().getCacheDir(), "images");
        if (!dir.exists() && !dir.mkdirs()) {
            throw new IllegalStateException("Could not create images folder");
        }
        File file = new File(dir, fileName);
        try (FileOutputStream out = new FileOutputStream(file)) {
            out.write(bytes);
        }
        Uri uri = FileProvider.getUriForFile(
            getContext(),
            getContext().getPackageName() + ".fileprovider",
            file
        );
        Intent send = new Intent(Intent.ACTION_SEND);
        send.setType("image/png");
        send.putExtra(Intent.EXTRA_STREAM, uri);
        if (text != null && !text.isEmpty()) {
            send.putExtra(Intent.EXTRA_TEXT, text);
        }
        send.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
        send.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getActivity().startActivity(Intent.createChooser(send, "पंचांग कार्ड साझा करें"));
    }

    @PluginMethod
    public void openUrl(PluginCall call) {
        String url = call.getString("url");
        if (url == null || url.isEmpty()) {
            call.reject("Missing url");
            return;
        }
        try {
            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Could not open link", e);
        }
    }

    private boolean askingNotification;
    private final java.util.ArrayList<PluginCall> notificationQueue = new java.util.ArrayList<>();

    @PluginMethod
    public void scheduleReminder(PluginCall call) {
        if (Build.VERSION.SDK_INT >= 33 && getPermissionState("notifications") != PermissionState.GRANTED) {
            notificationQueue.add(call);
            if (!askingNotification) {
                askingNotification = true;
                requestPermissionForAlias("notifications", call, "reminderPerms");
            }
            return;
        }
        armReminder(call);
    }

    @PermissionCallback
    private void reminderPerms(PluginCall call) {
        askingNotification = false;
        java.util.ArrayList<PluginCall> pending = new java.util.ArrayList<>(notificationQueue);
        notificationQueue.clear();
        if (getPermissionState("notifications") != PermissionState.GRANTED) {
            for (PluginCall waiting : pending) {
                if (waiting != null && !waiting.equals(call)) waiting.reject("Notification permission denied");
            }
            if (call != null) call.reject("Notification permission denied");
            return;
        }
        boolean armedCall = false;
        for (PluginCall waiting : pending) {
            if (waiting == null) continue;
            if (waiting.equals(call)) armedCall = true;
            armReminder(waiting);
        }
        if (!armedCall && call != null) armReminder(call);
    }

    @PluginMethod
    public void cancelReminder(PluginCall call) {
        String id = call.getString("id", "0");
        int nid = alarmId(id);
        Intent intent = new Intent(getContext(), ReminderReceiver.class);
        PendingIntent pi = PendingIntent.getBroadcast(
            getContext(),
            nid,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        AlarmManager am = (AlarmManager) getContext().getSystemService(Context.ALARM_SERVICE);
        if (am != null) am.cancel(pi);
        pi.cancel();
        call.resolve();
    }

    private void armReminder(PluginCall call) {
        String id = call.getString("id", "0");
        String title = call.getString("title", "शक्ति पंचांग");
        String body = call.getString("body", "शुभ समय स्मरण");
        Long when = call.getLong("timestamp");
        if (when == null) {
            call.reject("Missing time");
            return;
        }
        int nid = alarmId(id);
        Intent intent = new Intent(getContext(), ReminderReceiver.class);
        intent.putExtra("title", title);
        intent.putExtra("body", body);
        intent.putExtra("nid", nid);
        PendingIntent pi = PendingIntent.getBroadcast(
            getContext(),
            nid,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        AlarmManager am = (AlarmManager) getContext().getSystemService(Context.ALARM_SERVICE);
        long at = Math.max(when, System.currentTimeMillis() + 1500);
        if (am != null) {
            am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi);
        }
        persistAlarm(getContext(), id, title, body, at);
        JSObject ret = new JSObject();
        ret.put("ok", true);
        call.resolve(ret);
    }

    static void ensureChannel(Context context) {
        if (Build.VERSION.SDK_INT < 26) return;
        NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;
        NotificationChannel channel = new NotificationChannel(
            "shakti_reminders",
            "शुभ स्मरण",
            NotificationManager.IMPORTANCE_HIGH
        );
        channel.setDescription("व्रत, चौघड़िया और शुभ समय की सूचना");
        nm.createNotificationChannel(channel);
    }

    private static int alarmId(String id) {
        return id == null ? 1 : (id.hashCode() & 0x7fffffff);
    }

    private static void persistAlarm(Context ctx, String id, String title, String body, long when) {
        try {
            SharedPreferences sp = ctx.getSharedPreferences("sp_alarms", Context.MODE_PRIVATE);
            JSONArray arr = new JSONArray(sp.getString("items", "[]"));
            JSONArray next = new JSONArray();
            long now = System.currentTimeMillis();
            for (int i = 0; i < arr.length(); i++) {
                JSONObject old = arr.getJSONObject(i);
                if (id.equals(old.optString("id"))) continue;
                if (old.optLong("at") < now - 3600000L) continue;
                next.put(old);
            }
            JSONObject item = new JSONObject();
            item.put("id", id);
            item.put("title", title);
            item.put("body", body);
            item.put("at", when);
            next.put(item);
            sp.edit().putString("items", next.toString()).apply();
        } catch (Exception ignored) {
        }
    }

    public static void restoreAlarms(Context ctx) {
        try {
            SharedPreferences sp = ctx.getSharedPreferences("sp_alarms", Context.MODE_PRIVATE);
            JSONArray arr = new JSONArray(sp.getString("items", "[]"));
            AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
            if (am == null) return;
            long now = System.currentTimeMillis();
            for (int i = 0; i < arr.length(); i++) {
                JSONObject item = arr.getJSONObject(i);
                long at = item.optLong("at");
                if (at < now + 1000) continue;
                int nid = alarmId(item.optString("id"));
                Intent intent = new Intent(ctx, ReminderReceiver.class);
                intent.putExtra("title", item.optString("title"));
                intent.putExtra("body", item.optString("body"));
                intent.putExtra("nid", nid);
                PendingIntent pi = PendingIntent.getBroadcast(
                    ctx,
                    nid,
                    intent,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                );
                am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi);
            }
        } catch (Exception ignored) {
        }
    }
}
