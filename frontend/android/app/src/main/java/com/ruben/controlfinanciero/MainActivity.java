package com.ruben.controlfinanciero;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(DocumentExportPlugin.class);
        registerPlugin(ScreenProtectionPlugin.class);
        super.onCreate(savedInstanceState);
        ScreenProtectionPlugin.apply(this, ScreenProtectionPlugin.isEnabled(this));
    }
}
