package com.ruben.controlfinanciero;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.util.Base64;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.OutputStream;
import java.util.Arrays;
import java.util.Set;

@CapacitorPlugin(name = "DocumentExport")
public class DocumentExportPlugin extends Plugin {
    private static final Set<String> ALLOWED_MIME = Set.of("application/pdf", "text/csv", "application/octet-stream");
    private static final int MAX_BYTES = 20 * 1024 * 1024;

    @PluginMethod
    public void save(PluginCall call) {
        String filename = call.getString("filename", "archivo");
        String mimeType = call.getString("mimeType", "");
        String dataBase64 = call.getString("dataBase64", "");
        if (!ALLOWED_MIME.contains(mimeType) || !filename.matches("[A-Za-z0-9._-]{1,120}") || dataBase64.length() > MAX_BYTES * 2) {
            call.reject("Archivo no permitido.");
            return;
        }
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType(mimeType);
        intent.putExtra(Intent.EXTRA_TITLE, filename);
        startActivityForResult(call, intent, "saveDocument");
    }

    @ActivityCallback
    private void saveDocument(PluginCall call, ActivityResult result) {
        if (result.getResultCode() != Activity.RESULT_OK || result.getData() == null || result.getData().getData() == null) {
            JSObject response = new JSObject();
            response.put("status", "cancelled");
            call.resolve(response);
            return;
        }
        byte[] bytes = null;
        try {
            bytes = Base64.decode(call.getString("dataBase64", ""), Base64.DEFAULT);
            if (bytes.length == 0 || bytes.length > MAX_BYTES) throw new IllegalArgumentException("Tamano no permitido.");
            Uri uri = result.getData().getData();
            try (OutputStream output = getContext().getContentResolver().openOutputStream(uri, "w")) {
                if (output == null) throw new IllegalStateException("No se pudo abrir el destino.");
                output.write(bytes);
                output.flush();
            }
            JSObject response = new JSObject();
            response.put("status", "saved");
            call.resolve(response);
        } catch (Exception error) {
            call.reject("No se pudo guardar el archivo.", error);
        } finally {
            if (bytes != null) Arrays.fill(bytes, (byte) 0);
        }
    }
}
