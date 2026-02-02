import { api } from "@/lib/api-client";

/**
 * ファイルダウンロード
 * @param url 
 * @param fileName 
 */
export async function downloadFile(url: string, fileName: string) {

    const res = await api.get(url, {
        withCredentials: true,
        responseType: "blob",
    });

    const contentType = res.headers["content-type"] || "text/csv";
    const blob = new Blob([res.data], { type: contentType });

    const link = document.createElement("a");

    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", sanitizeFileName(fileName));
    document.body.appendChild(link);
    link.click();
    link.remove();
}

/**
 * ファイル名サニタイズ
 * @param name 
 * @returns 
 */
function sanitizeFileName(name: string): string {

    const WINDOWS_RESERVED = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i;
    const MAX_LENGTH = 200;

    let sanitized = name
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
        .replace(/^\.+/, '_')
        .normalize('NFC')
        .replace(/[\u200B-\u200F\u202A-\u202E]/g, '');

    // Windows予約語チェック
    const baseName = sanitized.replace(/\.[^.]+$/, '');
    if (WINDOWS_RESERVED.test(baseName)) {
        sanitized = '_' + sanitized;
    }

    // 長さチェック
    if (sanitized.length > MAX_LENGTH) {
        const ext = sanitized.match(/\.[^.]+$/)?.[0] || '';
        sanitized = sanitized.slice(0, MAX_LENGTH - ext.length) + ext;
    }

    return sanitized || 'unnamed';
}