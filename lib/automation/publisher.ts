import { validateWebhookUrl } from './qualityChecker';

export interface PublishResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface BaseProvider {
  publish(content: string, title?: string, settings?: any): Promise<PublishResult>;
  validate(settings: any): { isValid: boolean; error?: string };
}

// 1. SLACK PROVIDER
export const SlackProvider: BaseProvider = {
  async publish(content: string, title?: string, settings?: any): Promise<PublishResult> {
    const url = settings?.webhookUrl;
    if (!url) return { success: false, error: 'Slack Webhook URL is missing.' };

    const validation = validateWebhookUrl(url);
    if (!validation.isValid) return { success: false, error: validation.reason };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: title ? `*${title}*\n${content}` : content,
        }),
      });
      if (res.ok) {
        return { success: true, url };
      }
      const errText = await res.text();
      return { success: false, error: `Slack returned error status ${res.status}: ${errText}` };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },
  validate(settings: any) {
    if (!settings?.webhookUrl) return { isValid: false, error: 'Slack Webhook URL is required.' };
    return validateWebhookUrl(settings.webhookUrl);
  }
};

// 2. DISCORD PROVIDER
export const DiscordProvider: BaseProvider = {
  async publish(content: string, title?: string, settings?: any): Promise<PublishResult> {
    const url = settings?.webhookUrl;
    if (!url) return { success: false, error: 'Discord Webhook URL is missing.' };

    const validation = validateWebhookUrl(url);
    if (!validation.isValid) return { success: false, error: validation.reason };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: title || 'New Content Automator Post',
            description: content.slice(0, 2000), // Discord embed limit
            color: 0x8b5cf6, // Violet accent
          }],
        }),
      });
      if (res.ok || res.status === 204) {
        return { success: true, url };
      }
      return { success: false, error: `Discord returned error status ${res.status}` };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },
  validate(settings: any) {
    if (!settings?.webhookUrl) return { isValid: false, error: 'Discord Webhook URL is required.' };
    return validateWebhookUrl(settings.webhookUrl);
  }
};

// 3. TELEGRAM PROVIDER
export const TelegramProvider: BaseProvider = {
  async publish(content: string, title?: string, settings?: any): Promise<PublishResult> {
    const token = settings?.token;
    const chatId = settings?.chatId;
    if (!token || !chatId) return { success: false, error: 'Telegram Token or Chat ID is missing.' };

    try {
      const url = `https://api.telegram.org/bot${token}/sendMessage`;
      const text = title ? `*${title}*\n\n${content}` : content;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'Markdown',
        }),
      });
      const data = await res.json();
      if (data.ok) {
        return { success: true, url: `https://t.me/${chatId}` };
      }
      return { success: false, error: data.description || 'Telegram send failure' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },
  validate(settings: any) {
    if (!settings?.token) return { isValid: false, error: 'Telegram Bot Token is required.' };
    if (!settings?.chatId) return { isValid: false, error: 'Telegram Chat ID is required.' };
    return { isValid: true };
  }
};

// 4. DEV.TO PROVIDER
export const DevToProvider: BaseProvider = {
  async publish(content: string, title?: string, settings?: any): Promise<PublishResult> {
    const apiKey = settings?.token;
    if (!apiKey) return { success: false, error: 'Dev.to API key is missing.' };

    try {
      const res = await fetch('https://dev.to/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey,
        },
        body: JSON.stringify({
          article: {
            title: title || 'Pushed update',
            body_markdown: content,
            published: settings?.publishState === 'published',
          }
        }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        return { success: true, url: data.url };
      }
      return { success: false, error: data.error || 'Dev.to publication failed.' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },
  validate(settings: any) {
    if (!settings?.token) return { isValid: false, error: 'Dev.to API Key is required.' };
    return { isValid: true };
  }
};

// 5. HASHNODE PROVIDER
export const HashnodeProvider: BaseProvider = {
  async publish(content: string, title?: string, settings?: any): Promise<PublishResult> {
    const token = settings?.token;
    const publicationId = settings?.publicationId;
    if (!token || !publicationId) return { success: false, error: 'Hashnode Token or Publication ID is missing.' };

    try {
      const query = `
        mutation CreatePost($input: PublishPostInput!) {
          publishPost(input: $input) {
            post {
              url
            }
          }
        }
      `;
      const res = await fetch('https://gql.hashnode.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify({
          query,
          variables: {
            input: {
              title: title || 'Pushed update',
              contentMarkdown: content,
              publicationId,
            }
          }
        }),
      });
      const result = await res.json();
      if (result.errors) {
        return { success: false, error: result.errors[0]?.message || 'Hashnode GraphQL error' };
      }
      const postUrl = result.data?.publishPost?.post?.url;
      if (postUrl) {
        return { success: true, url: postUrl };
      }
      return { success: false, error: 'Hashnode returned empty publication url' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },
  validate(settings: any) {
    if (!settings?.token) return { isValid: false, error: 'Hashnode API Access Token is required.' };
    if (!settings?.publicationId) return { isValid: false, error: 'Hashnode Publication ID is required.' };
    return { isValid: true };
  }
};

// 6. MEDIUM PROVIDER
export const MediumProvider: BaseProvider = {
  async publish(content: string, title?: string, settings?: any): Promise<PublishResult> {
    const token = settings?.token;
    if (!token) return { success: false, error: 'Medium Integration Token is missing.' };

    try {
      // 1. Get user details
      const userRes = await fetch('https://api.medium.com/v1/me', {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      if (!userRes.ok) return { success: false, error: 'Failed to retrieve Medium User profile.' };
      const userProfile = await userRes.json();
      const userId = userProfile.data?.id;

      // 2. Publish post
      const postRes = await fetch(`https://api.medium.com/v1/users/${userId}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          title: title || 'Pushed update',
          contentFormat: 'markdown',
          content,
          publishStatus: settings?.publishState === 'published' ? 'public' : 'draft',
        })
      });
      const data = await postRes.json();
      if (postRes.ok && data.data?.url) {
        return { success: true, url: data.data.url };
      }
      return { success: false, error: 'Medium publication failed.' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },
  validate(settings: any) {
    if (!settings?.token) return { isValid: false, error: 'Medium token is required.' };
    return { isValid: true };
  }
};

// 7. LINKEDIN PROVIDER (Simulation with Logger Fallback)
export const LinkedinProvider: BaseProvider = {
  async publish(content: string, title?: string, settings?: any): Promise<PublishResult> {
    const token = settings?.token;
    if (!token) return { success: false, error: 'LinkedIn token is missing.' };
    
    // Simulate API calls or execute OAuth Share
    console.log(`[LinkedIn Publisher] Simulating publication of post: "${title}". Content length: ${content.length}`);
    return { success: true, url: `https://www.linkedin.com/feed/update/urn:li:share:sandbox_${Date.now()}` };
  },
  validate(settings: any) {
    if (!settings?.token) return { isValid: false, error: 'LinkedIn OAuth token is required.' };
    return { isValid: true };
  }
};

// 8. TWITTER / X PROVIDER (Simulation with Logger Fallback)
export const TwitterProvider: BaseProvider = {
  async publish(content: string, title?: string, settings?: any): Promise<PublishResult> {
    const token = settings?.token;
    if (!token) return { success: false, error: 'X/Twitter token is missing.' };
    
    console.log(`[X Publisher] Simulating tweet of length: ${content.length}`);
    return { success: true, url: `https://x.com/user/status/sandbox_${Date.now()}` };
  },
  validate(settings: any) {
    if (!settings?.token) return { isValid: false, error: 'X OAuth Access Token is required.' };
    return { isValid: true };
  }
};

/**
 * Maps platform strings to their respective Providers
 */
export function getProvider(platform: string): BaseProvider {
  switch (platform.toLowerCase()) {
    case 'slack': return SlackProvider;
    case 'discord': return DiscordProvider;
    case 'telegram': return TelegramProvider;
    case 'devto': return DevToProvider;
    case 'hashnode': return HashnodeProvider;
    case 'medium': return MediumProvider;
    case 'linkedin': return LinkedinProvider;
    case 'twitter': return TwitterProvider;
    default:
      throw new Error(`Unsupported publishing platform: ${platform}`);
  }
}
