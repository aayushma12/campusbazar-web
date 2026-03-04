'use client';

import { useEffect, useRef } from 'react';
import type { EsewaPaymentData } from '@/types/payment';
import { ESEWA_CONFIG } from '@/lib/esewaApi';

interface EsewaCheckoutProps {
    paymentData: EsewaPaymentData;
    /** Called if the form takes longer than expected to submit */
    onTimeout?: () => void;
}

/**
 * EsewaCheckoutForm
 *
 * Renders a hidden HTML form with all eSewa-required fields and
 * auto-submits it to the eSewa payment gateway.
 *
 * IMPORTANT: This must be a form POST — eSewa's v2 API does NOT support
 * redirects or fetch calls. The browser must POST directly.
 *
 * Mount this component when you have the signed payment data from the backend.
 */
export default function EsewaCheckoutForm({ paymentData, onTimeout }: EsewaCheckoutProps) {
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        // Auto-submit after a short delay (gives React time to finish rendering)
        const timer = setTimeout(() => {
            // DEBUG: log exact values that will be submitted
            const signedFields = paymentData.signed_field_names.split(',');
            const debugData: Record<string, string> = {};
            signedFields.forEach(f => {
                const key = f.trim() as keyof typeof paymentData;
                debugData[f] = JSON.stringify(paymentData[key]); // JSON.stringify shows hidden chars
            });
            console.log('[eSewa] Submitting form to:', ESEWA_CONFIG.paymentUrl);
            console.log('[eSewa] Signed fields (exact values):', debugData);
            console.log('[eSewa] Full payload:', {
                amount: paymentData.amount,
                total_amount: paymentData.total_amount,
                transaction_uuid: paymentData.transaction_uuid,
                product_code: paymentData.product_code,
                signature: paymentData.signature,
            });
            formRef.current?.submit();
        }, 300);

        // Fallback: if still on page after 8s, something went wrong
        const fallback = setTimeout(() => {
            onTimeout?.();
        }, 8000);

        return () => {
            clearTimeout(timer);
            clearTimeout(fallback);
        };
    }, [onTimeout]);

    const fields: [string, string][] = [
        ['amount', paymentData.amount],
        ['tax_amount', paymentData.tax_amount],
        ['total_amount', paymentData.total_amount],
        ['transaction_uuid', paymentData.transaction_uuid],
        ['product_code', paymentData.product_code],
        ['product_service_charge', paymentData.product_service_charge],
        ['product_delivery_charge', paymentData.product_delivery_charge],
        ['success_url', paymentData.success_url],
        ['failure_url', paymentData.failure_url],
        ['signed_field_names', paymentData.signed_field_names],
        ['signature', paymentData.signature],
    ];

    return (
        <form
            ref={formRef}
            method="POST"
            action={ESEWA_CONFIG.paymentUrl}
            className="hidden"
            aria-hidden="true"
        >
            {fields.map(([name, value]) => (
                <input key={name} type="hidden" name={name} value={value} />
            ))}
        </form>
    );
}
