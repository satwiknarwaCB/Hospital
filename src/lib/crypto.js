/**
 * NeuroBridge™ - Secure Bridge Encryption Utility
 * Simulates End-to-End Encryption (E2EE) logic
 * Ensures data is scrambled before storage
 */

const SECRET_SALT = 'neurobridge_secure_protocol_v1';

export const cryptoUtils = {
    /**
     * Scrambles content for storage
     * In a production app, this would use the recipient's public key
     */
    encrypt: (text) => {
        if (!text) return '';
        // Simulating AES Encryption by base64 encoding with a secure prefix
        const scrambled = btoa(unescape(encodeURIComponent(text + '||' + SECRET_SALT)));
        return `nb_enc_${scrambled}`;
    },

    /**
     * Unscrambles content for display
     */
    decrypt: (scrambledText) => {
        if (!scrambledText || !scrambledText.startsWith('nb_enc_')) return scrambledText;

        try {
            const raw = scrambledText.replace('nb_enc_', '');
            const decoded = decodeURIComponent(escape(atob(raw)));
            return decoded.split('||')[0]; // Remove salt
        } catch (e) {
            console.error("Decryption failed. Unrecognized key.");
            return "[Encrypted Message]";
        }
    }
};
