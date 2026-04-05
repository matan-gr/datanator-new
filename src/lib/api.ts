export const fetchJson = async (url: string, options?: RequestInit, retries = 3) => {
  let lastError: any;
  for (let i = 0; i < retries; i++) {
    try {
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        ...(options?.headers as Record<string, string> || {}),
      };
      
      const hasContentType = Object.keys(headers).some(k => k.toLowerCase() === 'content-type');
      if (options?.body && typeof options.body === 'string' && !hasContentType) {
        headers['Content-Type'] = 'application/json';
      }

      const res = await fetch(url, {
        ...options,
        headers
      });
      
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error(`Expected JSON but got ${contentType}:`, text.substring(0, 200));
        throw new Error(`Invalid response format from ${url}`);
      }
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `HTTP error! status: ${res.status}`);
      }
      return data;
    } catch (error) {
      lastError = error;
      if (i < retries - 1) {
        console.warn(`Fetch attempt ${i + 1} failed for ${url}. Retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
      } else {
        console.error(`Fetch failed for ${url} after ${retries} attempts:`, error);
      }
    }
  }
  throw lastError;
};
