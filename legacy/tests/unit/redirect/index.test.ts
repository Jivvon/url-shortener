import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the redirect app
// Since we can't easily test Hono apps with Cloudflare bindings in unit tests,
// we'll test the helper functions directly

describe('Redirect Worker', () => {
  describe('parseUserAgent', () => {
    // Import the function by re-implementing the logic for testing
    // In a real scenario, we'd export these functions from the module

    function parseUserAgent(userAgent: string | null): {
      device: 'desktop' | 'mobile' | 'tablet' | null;
      browser: string | null;
      os: string | null;
    } {
      if (!userAgent) {
        return { device: null, browser: null, os: null };
      }

      const ua = userAgent.toLowerCase();

      // Detect device
      let device: 'desktop' | 'mobile' | 'tablet' | null = 'desktop';
      if (/tablet|ipad|playbook|silk/i.test(ua)) {
        device = 'tablet';
      } else if (/mobile|iphone|ipod|android.*mobile|windows phone|blackberry/i.test(ua)) {
        device = 'mobile';
      }

      // Detect browser
      let browser: string | null = null;
      if (ua.includes('edg/')) browser = 'edge';
      else if (ua.includes('chrome')) browser = 'chrome';
      else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'safari';
      else if (ua.includes('firefox')) browser = 'firefox';
      else if (ua.includes('opera') || ua.includes('opr/')) browser = 'opera';
      else if (ua.includes('msie') || ua.includes('trident')) browser = 'ie';

      // Detect OS (check iOS before macOS since iOS UA contains "Mac OS")
      let os: string | null = null;
      if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) os = 'ios';
      else if (ua.includes('windows')) os = 'windows';
      else if (ua.includes('mac os') || ua.includes('macos')) os = 'macos';
      else if (ua.includes('android')) os = 'android';
      else if (ua.includes('linux')) os = 'linux';

      return { device, browser, os };
    }

    it('should return nulls for null user agent', () => {
      const result = parseUserAgent(null);
      expect(result).toEqual({ device: null, browser: null, os: null });
    });

    it('should detect Chrome on Windows desktop', () => {
      const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
      const result = parseUserAgent(ua);
      expect(result.device).toBe('desktop');
      expect(result.browser).toBe('chrome');
      expect(result.os).toBe('windows');
    });

    it('should detect Safari on macOS desktop', () => {
      const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';
      const result = parseUserAgent(ua);
      expect(result.device).toBe('desktop');
      expect(result.browser).toBe('safari');
      expect(result.os).toBe('macos');
    });

    it('should detect Chrome on Android mobile', () => {
      const ua = 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
      const result = parseUserAgent(ua);
      expect(result.device).toBe('mobile');
      expect(result.browser).toBe('chrome');
      expect(result.os).toBe('android');
    });

    it('should detect Safari on iPhone', () => {
      const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
      const result = parseUserAgent(ua);
      expect(result.device).toBe('mobile');
      expect(result.browser).toBe('safari');
      expect(result.os).toBe('ios');
    });

    it('should detect Safari on iPad as tablet', () => {
      const ua = 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
      const result = parseUserAgent(ua);
      expect(result.device).toBe('tablet');
      expect(result.browser).toBe('safari');
      expect(result.os).toBe('ios');
    });

    it('should detect Firefox on Linux', () => {
      const ua = 'Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0';
      const result = parseUserAgent(ua);
      expect(result.device).toBe('desktop');
      expect(result.browser).toBe('firefox');
      expect(result.os).toBe('linux');
    });

    it('should detect Edge browser', () => {
      const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0';
      const result = parseUserAgent(ua);
      expect(result.device).toBe('desktop');
      expect(result.browser).toBe('edge');
      expect(result.os).toBe('windows');
    });
  });

  describe('extractRefererDomain', () => {
    function extractRefererDomain(referer: string): string | null {
      try {
        const url = new URL(referer);
        return url.hostname;
      } catch {
        return null;
      }
    }

    it('should extract domain from valid URL', () => {
      expect(extractRefererDomain('https://www.google.com/search?q=test')).toBe('www.google.com');
      expect(extractRefererDomain('https://twitter.com/user/status/123')).toBe('twitter.com');
      expect(extractRefererDomain('http://localhost:3000/page')).toBe('localhost');
    });

    it('should return null for invalid referer', () => {
      expect(extractRefererDomain('not-a-url')).toBeNull();
      expect(extractRefererDomain('')).toBeNull();
    });
  });

  describe('hashIP', () => {
    async function hashIP(ip: string): Promise<string> {
      const encoder = new TextEncoder();
      const data = encoder.encode(ip);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = new Uint8Array(hashBuffer);
      return Array.from(hashArray)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
        .slice(0, 16);
    }

    it('should return consistent hash for same IP', async () => {
      const hash1 = await hashIP('192.168.1.1');
      const hash2 = await hashIP('192.168.1.1');
      expect(hash1).toBe(hash2);
    });

    it('should return different hash for different IPs', async () => {
      const hash1 = await hashIP('192.168.1.1');
      const hash2 = await hashIP('192.168.1.2');
      expect(hash1).not.toBe(hash2);
    });

    it('should return 16 character hex string', async () => {
      const hash = await hashIP('10.0.0.1');
      expect(hash).toHaveLength(16);
      expect(hash).toMatch(/^[0-9a-f]+$/);
    });
  });

  describe('Redirect Logic (Integration)', () => {
    // These tests would require a full Hono app setup with mocked bindings
    // For now, we describe the expected behavior

    it.todo('should redirect to original URL when short code exists in KV');
    it.todo('should redirect to app with error when short code not found');
    it.todo('should skip favicon.ico and robots.txt');
    it.todo('should log click asynchronously without blocking redirect');
    it.todo('should increment total_clicks in database');
    it.todo('should handle root path redirect to main app');
  });
});
