export interface DiscordEmbed {
  title?: string
  description?: string
  color?: number
  fields?: { name: string; value: string; inline?: boolean }[]
  thumbnail?: { url: string }
  footer?: { text: string }
  timestamp?: string
}

/**
 * Fires a Discord embed to the given webhook URL. Never throws - logs and
 * swallows errors so a Discord/webhook outage can't break login or application flow.
 */
export async function postWebhookEmbed(webhookUrl: string | undefined, embed: DiscordEmbed) {
  return postWebhookEmbeds(webhookUrl, [embed])
}

/**
 * Fires multiple embeds in a single webhook message (Discord supports up to 10
 * embeds per message). Never throws - logs and swallows errors.
 */
export async function postWebhookEmbeds(webhookUrl: string | undefined, embeds: DiscordEmbed[]) {
  if (!webhookUrl) return

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds }),
    })
    if (!res.ok) {
      console.error('Webhook post failed:', res.status, await res.text())
    }
  } catch (err) {
    console.error('Webhook post error:', err)
  }
}
