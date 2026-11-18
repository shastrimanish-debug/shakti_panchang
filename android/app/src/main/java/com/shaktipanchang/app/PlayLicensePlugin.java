package com.shaktipanchang.app;

import android.app.Activity;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Context;
import android.content.SharedPreferences;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.os.Handler;
import android.os.Looper;
import android.provider.MediaStore;

import com.android.billingclient.api.AcknowledgePurchaseParams;
import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.PendingPurchasesParams;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.QueryPurchasesParams;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Locale;

/**
 * Google Play Billing v8 integration for One-Time Lifetime VIP product "shakti"
 * (purchase option "premium-99"), plus backward compatibility with legacy
 * "shakti_annual" subscriptions and a persistent 7-day trial stamp.
 */
@CapacitorPlugin(name = "PlayLicense")
public class PlayLicensePlugin extends Plugin implements PurchasesUpdatedListener {
    static final String PRODUCT_ID = "shakti";
    static final String PURCHASE_OPTION_ID = "premium-99";
    static final String LEGACY_SUBS_PRODUCT_ID = "shakti_annual";

    private static final long TRIAL_MS = 7L * 24 * 60 * 60 * 1000;
    private static final long CLOCK_ROLLBACK_TOLERANCE_MS = 120_000L;
    private static final long MEDIASTORE_REFRESH_MS = 15L * 60 * 1000;
    private static final String FILE_NAME = "shakti-panchang-trial-v25.txt";
    private static final String INTERNAL_FILE_NAME = "sp-trial-anchor.dat";
    private static final String PREFS_NAME = "shakti_play_license_prefs";
    private static final String PREF_ANCHOR = "trial_anchor_v25";
    private static final String PREF_PLAY_CACHE = "play_owned_cache_v1";

    private BillingClient billingClient;
    private PluginCall purchaseCall;
    private boolean playOwned;
    private boolean playLifetime;
    private boolean pendingPurchaseIsInApp = true;

    @PluginMethod
    public void status(PluginCall call) {
        loadPlayCache();
        readAnchor();
        connect(new Runnable() {
            @Override
            public void run() {
                queryOwned(new Runnable() {
                    @Override
                    public void run() {
                        call.resolve(snapshot());
                    }
                });
            }
        }, call, false);
    }

    @PluginMethod
    public void purchase(PluginCall call) {
        purchaseCall = call;
        connect(new Runnable() {
            @Override
            public void run() {
                queryProductsAndBuy(call);
            }
        }, call, true);
    }

    private void connect(final Runnable then, final PluginCall call, final boolean rejectOnFailure) {
        Activity activity = getActivity();
        if (activity == null) {
            if (rejectOnFailure) {
                purchaseCall = null;
                call.reject("ऐप स्क्रीन तैयार नहीं है।");
            } else {
                call.resolve(snapshot());
            }
            return;
        }
        if (billingClient != null && billingClient.isReady()) {
            then.run();
            return;
        }
        billingClient = BillingClient.newBuilder(activity)
            .setListener(this)
            .enablePendingPurchases(
                PendingPurchasesParams.newBuilder().enableOneTimeProducts().build()
            )
            .build();
        billingClient.startConnection(new BillingClientStateListener() {
            @Override
            public void onBillingSetupFinished(BillingResult result) {
                if (result.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                    then.run();
                } else {
                    if (rejectOnFailure) {
                        purchaseCall = null;
                        call.reject("Google Play बिलिंग नहीं खुली। Play Store से इंस्टॉल ऐप पर ही सदस्यता बनेगी।");
                    } else {
                        call.resolve(snapshot());
                    }
                }
            }

            @Override
            public void onBillingServiceDisconnected() {
            }
        });
    }

    private void queryOwned(final Runnable then) {
        if (billingClient == null || !billingClient.isReady()) {
            loadPlayCache();
            then.run();
            return;
        }

        // 1. Check primary One-Time Product (INAPP: "shakti")
        QueryPurchasesParams inappParams = QueryPurchasesParams.newBuilder()
            .setProductType(BillingClient.ProductType.INAPP)
            .build();
        billingClient.queryPurchasesAsync(inappParams, (inappResult, inappPurchases) -> {
            boolean foundInApp = false;
            if (inappResult.getResponseCode() == BillingClient.BillingResponseCode.OK && inappPurchases != null) {
                for (Purchase purchase : inappPurchases) {
                    if (purchase.getPurchaseState() == Purchase.PurchaseState.PURCHASED
                        && (purchase.getProducts().contains(PRODUCT_ID)
                            || purchase.getProducts().contains(LEGACY_SUBS_PRODUCT_ID))) {
                        foundInApp = true;
                        acknowledge(purchase);
                    }
                }
            }

            final boolean hasInApp = foundInApp;

            // 2. Also check Subscription purchases (SUBS: legacy "shakti_annual" or "shakti")
            QueryPurchasesParams subsParams = QueryPurchasesParams.newBuilder()
                .setProductType(BillingClient.ProductType.SUBS)
                .build();
            billingClient.queryPurchasesAsync(subsParams, (subsResult, subsPurchases) -> {
                boolean foundSubs = false;
                if (subsResult.getResponseCode() == BillingClient.BillingResponseCode.OK && subsPurchases != null) {
                    for (Purchase purchase : subsPurchases) {
                        if (purchase.getPurchaseState() == Purchase.PurchaseState.PURCHASED
                            && (purchase.getProducts().contains(PRODUCT_ID)
                                || purchase.getProducts().contains(LEGACY_SUBS_PRODUCT_ID))) {
                            foundSubs = true;
                            acknowledge(purchase);
                        }
                    }
                }
                playLifetime = hasInApp;
                playOwned = hasInApp || foundSubs;
                savePlayCache(playOwned, playLifetime);
                then.run();
            });
        });
    }

    private void acknowledge(Purchase purchase) {
        if (purchase.isAcknowledged() || billingClient == null) return;
        AcknowledgePurchaseParams params = AcknowledgePurchaseParams.newBuilder()
            .setPurchaseToken(purchase.getPurchaseToken())
            .build();
        billingClient.acknowledgePurchase(params, billingResult -> { });
    }

    private void queryProductsAndBuy(final PluginCall call) {
        // Primary: One-Time Product "shakti" (Purchase Option "premium-99")
        QueryProductDetailsParams.Product inappProduct = QueryProductDetailsParams.Product.newBuilder()
            .setProductId(PRODUCT_ID)
            .setProductType(BillingClient.ProductType.INAPP)
            .build();
        QueryProductDetailsParams inappParams = QueryProductDetailsParams.newBuilder()
            .setProductList(Collections.singletonList(inappProduct))
            .build();

        billingClient.queryProductDetailsAsync(inappParams, (result, queryResult) -> {
            List<ProductDetails> detailsList = queryResult == null ? null : queryResult.getProductDetailsList();
            if (result.getResponseCode() == BillingClient.BillingResponseCode.OK
                && detailsList != null && !detailsList.isEmpty()) {
                launchInAppPurchase(detailsList.get(0), call);
                return;
            }
            // Fallback: check if configured under SUBS ("shakti" or legacy "shakti_annual")
            querySubsFallbackAndBuy(call);
        });
    }

    private void launchInAppPurchase(ProductDetails details, final PluginCall call) {
        String selectedOfferToken = pickOneTimeOfferToken(details);
        BillingFlowParams.ProductDetailsParams.Builder productParamsBuilder =
            BillingFlowParams.ProductDetailsParams.newBuilder()
                .setProductDetails(details);
        if (selectedOfferToken != null && !selectedOfferToken.isEmpty()) {
            productParamsBuilder.setOfferToken(selectedOfferToken);
        }

        pendingPurchaseIsInApp = true;
        BillingFlowParams flow = BillingFlowParams.newBuilder()
            .setProductDetailsParamsList(Collections.singletonList(productParamsBuilder.build()))
            .build();

        launchBillingOnMainThread(flow, call);
    }

    private void querySubsFallbackAndBuy(final PluginCall call) {
        QueryProductDetailsParams.Product primarySubs = QueryProductDetailsParams.Product.newBuilder()
            .setProductId(PRODUCT_ID)
            .setProductType(BillingClient.ProductType.SUBS)
            .build();
        QueryProductDetailsParams.Product legacySubs = QueryProductDetailsParams.Product.newBuilder()
            .setProductId(LEGACY_SUBS_PRODUCT_ID)
            .setProductType(BillingClient.ProductType.SUBS)
            .build();
        QueryProductDetailsParams subsParams = QueryProductDetailsParams.newBuilder()
            .setProductList(Arrays.asList(primarySubs, legacySubs))
            .build();

        billingClient.queryProductDetailsAsync(subsParams, (result, queryResult) -> {
            List<ProductDetails> detailsList = queryResult == null ? null : queryResult.getProductDetailsList();
            if (result.getResponseCode() != BillingClient.BillingResponseCode.OK
                || detailsList == null || detailsList.isEmpty()) {
                purchaseCall = null;
                call.reject("Play Console में उत्पाद 'shakti' ('premium-99') अभी उपलब्ध नहीं हुआ। कृपया Play Store से इंस्टॉल ऐप पर जांचें।");
                return;
            }

            ProductDetails chosen = detailsList.get(0);
            for (ProductDetails candidate : detailsList) {
                if (PRODUCT_ID.equals(candidate.getProductId())) {
                    chosen = candidate;
                    break;
                }
            }

            String offer = pickSubsOffer(chosen);
            if (offer == null) {
                purchaseCall = null;
                call.reject("सदस्यता का ऑफर नहीं मिला।");
                return;
            }

            pendingPurchaseIsInApp = false;
            BillingFlowParams.ProductDetailsParams productParams = BillingFlowParams.ProductDetailsParams.newBuilder()
                .setProductDetails(chosen)
                .setOfferToken(offer)
                .build();
            BillingFlowParams flow = BillingFlowParams.newBuilder()
                .setProductDetailsParamsList(Collections.singletonList(productParams))
                .build();

            launchBillingOnMainThread(flow, call);
        });
    }

    private void launchBillingOnMainThread(final BillingFlowParams flow, final PluginCall call) {
        new Handler(Looper.getMainLooper()).post(() -> {
            Activity activity = getActivity();
            if (activity == null) {
                purchaseCall = null;
                call.reject("ऐप स्क्रीन तैयार नहीं है।");
                return;
            }
            BillingResult launched = billingClient.launchBillingFlow(activity, flow);
            int code = launched.getResponseCode();
            if (code == BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED) {
                queryOwned(() -> {
                    PluginCall active = purchaseCall;
                    purchaseCall = null;
                    if (active != null) active.resolve(snapshot());
                });
                return;
            }
            if (code != BillingClient.BillingResponseCode.OK) {
                purchaseCall = null;
                call.reject("Google Play भुगतान स्क्रीन नहीं खुली।");
            }
        });
    }

    private String pickOneTimeOfferToken(ProductDetails details) {
        List<ProductDetails.OneTimePurchaseOfferDetails> offerList = details.getOneTimePurchaseOfferDetailsList();
        if (offerList != null && !offerList.isEmpty()) {
            String fallback = null;
            for (ProductDetails.OneTimePurchaseOfferDetails offer : offerList) {
                String token = offer.getOfferToken();
                if (token == null || token.isEmpty()) continue;
                if (fallback == null) fallback = token;
                if (PURCHASE_OPTION_ID.equalsIgnoreCase(offer.getPurchaseOptionId())) {
                    return token;
                }
            }
            if (fallback != null) return fallback;
        }
        ProductDetails.OneTimePurchaseOfferDetails single = details.getOneTimePurchaseOfferDetails();
        return single != null ? single.getOfferToken() : null;
    }

    private String pickSubsOffer(ProductDetails details) {
        List<ProductDetails.SubscriptionOfferDetails> offers = details.getSubscriptionOfferDetails();
        if (offers == null || offers.isEmpty()) return null;
        String fallback = offers.get(0).getOfferToken();
        for (ProductDetails.SubscriptionOfferDetails offer : offers) {
            if (PURCHASE_OPTION_ID.equalsIgnoreCase(offer.getBasePlanId())) {
                return offer.getOfferToken();
            }
        }
        for (ProductDetails.SubscriptionOfferDetails offer : offers) {
            if (offer.getPricingPhases() == null) continue;
            for (ProductDetails.PricingPhase phase : offer.getPricingPhases().getPricingPhaseList()) {
                if (phase.getPriceAmountMicros() == 0) return offer.getOfferToken();
            }
        }
        return fallback;
    }

    @Override
    public void onPurchasesUpdated(BillingResult result, List<Purchase> purchases) {
        PluginCall call = purchaseCall;
        purchaseCall = null;
        int code = result.getResponseCode();
        if (code == BillingClient.BillingResponseCode.USER_CANCELED) {
            if (call != null) call.reject("भुगतान रद्द हुआ।");
            return;
        }
        if (code == BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED) {
            queryOwned(() -> {
                if (call != null) call.resolve(snapshot());
            });
            return;
        }
        if (code == BillingClient.BillingResponseCode.OK && purchases != null) {
            boolean anyPending = false;
            for (Purchase purchase : purchases) {
                if (purchase.getPurchaseState() == Purchase.PurchaseState.PURCHASED) {
                    playOwned = true;
                    if (pendingPurchaseIsInApp || purchase.getProducts().contains(PRODUCT_ID)) {
                        playLifetime = true;
                    }
                    acknowledge(purchase);
                } else if (purchase.getPurchaseState() == Purchase.PurchaseState.PENDING) {
                    anyPending = true;
                }
            }
            if (playOwned) {
                savePlayCache(playOwned, playLifetime);
            }
            if (!playOwned && anyPending) {
                if (call != null) {
                    call.reject("भुगतान अभी लंबित (Pending) है। Google Play से पुष्टि होते ही ऐप स्वतः अनलॉक हो जाएगा।");
                }
                return;
            }
            if (call != null) call.resolve(snapshot());
            return;
        }
        if (call != null) call.reject("Google Play भुगतान पूरा नहीं हुआ।");
    }

    private JSObject snapshot() {
        long now = System.currentTimeMillis();
        Anchor anchor = readAnchor();
        long effectiveNow = Math.max(now, anchor.maxSeen);
        boolean tampered = anchor.tampered;
        boolean trial = !tampered && now < anchor.start + TRIAL_MS && effectiveNow < anchor.start + TRIAL_MS;
        boolean entitled = playOwned || trial;
        long end = playOwned
            ? (playLifetime ? now + 100L * 365 * 86400000L : now + 365L * 86400000L)
            : anchor.start + TRIAL_MS;
        long days = playOwned && playLifetime
            ? 36500
            : (entitled ? Math.max(1, (long) Math.ceil((end - effectiveNow) / 86400000.0)) : 0);

        JSObject out = new JSObject();
        out.put("entitled", entitled);
        out.put("playOwned", playOwned);
        out.put("kind", playOwned ? (playLifetime ? "lifetime" : "annual") : (trial ? "trial" : "none"));
        out.put("daysRemaining", days);
        out.put("expiresAt", end);
        out.put("issuedAt", anchor.start);
        out.put("tampered", tampered);
        out.put(
            "reason",
            entitled
                ? ""
                : (tampered
                    ? "समय परिवर्तन का पता चला। ₹99 / $1 की आजीवन सदस्यता Google Play से लें।"
                    : "७ दिन का परीक्षण समाप्त। ₹99 / $1 की आजीवन सदस्यता Google Play से लें।")
        );
        return out;
    }

    private static final class Anchor {
        long start;
        long maxSeen;
        boolean tampered;
    }

    private void savePlayCache(boolean owned, boolean lifetime) {
        try {
            Context context = getContext();
            if (context == null) return;
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            if (!owned) {
                prefs.edit().remove(PREF_PLAY_CACHE).apply();
                return;
            }
            String payload = (owned ? "1" : "0") + "|" + (lifetime ? "1" : "0");
            String body = payload + "|" + signPlayCache(owned, lifetime);
            prefs.edit().putString(PREF_PLAY_CACHE, body).apply();
        } catch (Exception ignored) {
        }
    }

    private void loadPlayCache() {
        try {
            Context context = getContext();
            if (context == null) return;
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            String raw = prefs.getString(PREF_PLAY_CACHE, null);
            if (raw == null || raw.isEmpty()) return;
            String[] parts = raw.trim().split("\\|");
            if (parts.length != 3) return;
            boolean owned = "1".equals(parts[0]);
            boolean lifetime = "1".equals(parts[1]);
            if (signPlayCache(owned, lifetime).equals(parts[2])) {
                playOwned = owned;
                playLifetime = lifetime;
            }
        } catch (Exception ignored) {
        }
    }

    private String signPlayCache(boolean owned, boolean lifetime) {
        try {
            String raw = (owned ? "1" : "0") + ":" + (lifetime ? "1" : "0") + ":shakti-play-v1";
            byte[] hash = MessageDigest.getInstance("SHA-256").digest(raw.getBytes(StandardCharsets.US_ASCII));
            StringBuilder hex = new StringBuilder();
            for (int i = 0; i < 8; i++) hex.append(String.format(Locale.US, "%02x", hash[i]));
            return hex.toString();
        } catch (Exception e) {
            return "0";
        }
    }

    private Anchor parseLayer(String raw) {
        if (raw == null) return null;
        String trimmed = raw.trim();
        if (trimmed.isEmpty()) return null;
        String[] parts = trimmed.split("\\|");
        Anchor parsed = new Anchor();
        try {
            if (parts.length == 3) {
                long start = Long.parseLong(parts[0]);
                long seen = Long.parseLong(parts[1]);
                if (!sign(start, seen).equals(parts[2])) {
                    parsed.tampered = true;
                    return parsed;
                }
                parsed.start = start;
                parsed.maxSeen = Math.max(start, seen);
                return parsed;
            }
            if (parts.length >= 4) {
                long start = Long.parseLong(parts[0]);
                long seen = Long.parseLong(parts[1]);
                boolean tampered = "1".equals(parts[2]);
                if (!sign4(start, seen, tampered).equals(parts[3])) {
                    parsed.tampered = true;
                    return parsed;
                }
                parsed.start = start;
                parsed.maxSeen = Math.max(start, seen);
                parsed.tampered = tampered;
                return parsed;
            }
        } catch (NumberFormatException ignored) {
        }
        parsed.tampered = true;
        return parsed;
    }

    private Anchor readAnchor() {
        long now = System.currentTimeMillis();
        Anchor[] layers = new Anchor[]{
            parseLayer(readPrefsAnchor()),
            parseLayer(readInternalFile()),
            parseLayer(readMediaStoreFile())
        };

        long earliestStart = 0;
        long highestSeen = 0;
        long previousMediaStoreSeen = layers[2] != null && !layers[2].tampered ? layers[2].maxSeen : 0;
        boolean tampered = false;

        for (Anchor layer : layers) {
            if (layer == null) continue;
            if (layer.tampered) {
                tampered = true;
            }
            if (layer.start > 1_000_000_000_000L && (earliestStart == 0 || layer.start < earliestStart)) {
                earliestStart = layer.start;
            }
            if (layer.maxSeen > highestSeen) {
                highestSeen = layer.maxSeen;
            }
        }

        if (earliestStart == 0 || earliestStart > now + CLOCK_ROLLBACK_TOLERANCE_MS) {
            if (earliestStart > now + CLOCK_ROLLBACK_TOLERANCE_MS) {
                tampered = true;
            }
            if (earliestStart == 0) {
                earliestStart = now;
            }
        }

        if (highestSeen > 0 && now + CLOCK_ROLLBACK_TOLERANCE_MS < highestSeen) {
            tampered = true;
        }

        long updatedSeen = Math.max(now, Math.max(highestSeen, earliestStart));

        Anchor result = new Anchor();
        result.start = earliestStart;
        result.maxSeen = updatedSeen;
        result.tampered = tampered;

        String serialized = earliestStart + "|" + updatedSeen + "|" + (tampered ? "1" : "0") + "|" + sign4(earliestStart, updatedSeen, tampered);
        writePrefsAnchor(serialized);
        writeInternalFile(serialized);

        boolean shouldRefreshMediaStore =
            layers[2] == null
            || layers[2].start != earliestStart
            || (tampered && !layers[2].tampered)
            || (updatedSeen - previousMediaStoreSeen >= MEDIASTORE_REFRESH_MS);
        if (shouldRefreshMediaStore) {
            writeMediaStoreFile(serialized);
        }

        return result;
    }

    private String readPrefsAnchor() {
        try {
            Context context = getContext();
            if (context == null) return null;
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            return prefs.getString(PREF_ANCHOR, null);
        } catch (Exception e) {
            return null;
        }
    }

    private void writePrefsAnchor(String body) {
        try {
            Context context = getContext();
            if (context == null) return;
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            prefs.edit().putString(PREF_ANCHOR, body).apply();
        } catch (Exception ignored) {
        }
    }

    private String readInternalFile() {
        try {
            Context context = getContext();
            if (context == null) return null;
            File file = new File(context.getFilesDir(), INTERNAL_FILE_NAME);
            if (!file.exists()) return null;
            try (InputStream in = new FileInputStream(file)) {
                ByteArrayOutputStream buf = new ByteArrayOutputStream();
                byte[] tmp = new byte[256];
                int n;
                while ((n = in.read(tmp)) > 0) buf.write(tmp, 0, n);
                return buf.toString(StandardCharsets.UTF_8.name());
            }
        } catch (Exception e) {
            return null;
        }
    }

    private void writeInternalFile(String body) {
        try {
            Context context = getContext();
            if (context == null) return;
            File file = new File(context.getFilesDir(), INTERNAL_FILE_NAME);
            try (FileOutputStream out = new FileOutputStream(file, false)) {
                out.write(body.getBytes(StandardCharsets.UTF_8));
            }
        } catch (Exception ignored) {
        }
    }

    private void writeMediaStoreFile(String body) {
        try {
            Context context = getContext();
            if (context == null) return;
            if (Build.VERSION.SDK_INT >= 29) {
                ContentResolver resolver = context.getContentResolver();
                Uri existing = findFile(resolver);
                if (existing != null) resolver.delete(existing, null, null);
                ContentValues values = new ContentValues();
                values.put(MediaStore.Downloads.DISPLAY_NAME, FILE_NAME);
                values.put(MediaStore.Downloads.MIME_TYPE, "text/plain");
                values.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/ShaktiPanchang");
                Uri uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
                if (uri == null) return;
                try (OutputStream out = resolver.openOutputStream(uri)) {
                    if (out != null) out.write(body.getBytes(StandardCharsets.UTF_8));
                }
            }
        } catch (Exception ignored) {
        }
    }

    private String readMediaStoreFile() {
        try {
            Context context = getContext();
            if (context == null || Build.VERSION.SDK_INT < 29) return null;
            Uri uri = findFile(context.getContentResolver());
            if (uri == null) return null;
            try (InputStream in = context.getContentResolver().openInputStream(uri)) {
                if (in == null) return null;
                ByteArrayOutputStream buf = new ByteArrayOutputStream();
                byte[] tmp = new byte[256];
                int n;
                while ((n = in.read(tmp)) > 0) buf.write(tmp, 0, n);
                return buf.toString(StandardCharsets.UTF_8.name());
            }
        } catch (Exception e) {
            return null;
        }
    }

    private Uri findFile(ContentResolver resolver) {
        Uri collection = MediaStore.Downloads.EXTERNAL_CONTENT_URI;
        String[] projection = new String[]{MediaStore.Downloads._ID};
        String selection = MediaStore.Downloads.DISPLAY_NAME + "=?";
        try (Cursor cursor = resolver.query(collection, projection, selection, new String[]{FILE_NAME}, null)) {
            if (cursor != null && cursor.moveToFirst()) {
                long id = cursor.getLong(0);
                return Uri.withAppendedPath(collection, String.valueOf(id));
            }
        } catch (Exception ignored) {
        }
        return null;
    }

    private String sign(long start, long seen) {
        try {
            String raw = start + ":" + seen + ":shakti-trial-v1";
            byte[] hash = MessageDigest.getInstance("SHA-256").digest(raw.getBytes(StandardCharsets.US_ASCII));
            StringBuilder hex = new StringBuilder();
            for (int i = 0; i < 8; i++) hex.append(String.format(Locale.US, "%02x", hash[i]));
            return hex.toString();
        } catch (Exception e) {
            return "0";
        }
    }

    private String sign4(long start, long seen, boolean tampered) {
        try {
            String raw = start + ":" + seen + ":" + (tampered ? "1" : "0") + ":shakti-trial-v2";
            byte[] hash = MessageDigest.getInstance("SHA-256").digest(raw.getBytes(StandardCharsets.US_ASCII));
            StringBuilder hex = new StringBuilder();
            for (int i = 0; i < 8; i++) hex.append(String.format(Locale.US, "%02x", hash[i]));
            return hex.toString();
        } catch (Exception e) {
            return "0";
        }
    }
}
