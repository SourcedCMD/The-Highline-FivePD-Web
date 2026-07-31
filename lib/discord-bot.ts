/**
 * Checks whether a Discord user holds the configured staff role in the configured guild.
 * Requires a bot that is a member of the guild, with the "Server Members Intent"
 * enabled in the Discord Developer Portal, and permission to view members.
 *
 * Needs these env vars: DISCORD_BOT_TOKEN, DISCORD_GUILD_ID, DISCORD_STAFF_ROLE_ID
 */
export async function checkIsStaff(discordUserId: string): Promise<boolean> {
  const botToken = process.env.DISCORD_BOT_TOKEN
  const guildId = process.env.DISCORD_GUILD_ID
  const staffRoleId = process.env.DISCORD_STAFF_ROLE_ID

  if (!botToken || !guildId || !staffRoleId) {
    console.warn(
      'Staff role check skipped: DISCORD_BOT_TOKEN, DISCORD_GUILD_ID, or DISCORD_STAFF_ROLE_ID is not set'
    )
    return false
  }

  try {
    const res = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/members/${discordUserId}`,
      {
        headers: { Authorization: `Bot ${botToken}` },
        cache: 'no-store',
      }
    )

    if (!res.ok) {
      // 404 = user isn't in the guild; anything else = treat as not-staff, but log it
      if (res.status !== 404) {
        console.error('Discord member lookup failed:', res.status, await res.text())
      }
      return false
    }

    const member = await res.json()
    const roles: string[] = member.roles || []
    return roles.includes(staffRoleId)
  } catch (err) {
    console.error('Discord staff role check failed:', err)
    return false
  }
}

export interface DiscordMessagePayload {
  embeds?: any[]
  components?: any[]
}

/**
 * Sends a message to a channel as the bot (not a webhook). Required for messages
 * that include interactive components (buttons/select menus), since interactions
 * only route to the application that owns the message.
 * Requires the bot to have Send Messages + Embed Links permission in that channel.
 */
export async function sendBotMessage(
  channelId: string,
  payload: DiscordMessagePayload
): Promise<{ id: string } | null> {
  const botToken = process.env.DISCORD_BOT_TOKEN
  if (!botToken) {
    console.warn('sendBotMessage skipped: DISCORD_BOT_TOKEN is not set')
    return null
  }

  try {
    const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bot ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      console.error('sendBotMessage failed:', res.status, await res.text())
      return null
    }
    return await res.json()
  } catch (err) {
    console.error('sendBotMessage error:', err)
    return null
  }
}

/**
 * Edits an existing bot message (used to reflect a status change made on the
 * website back into the original Discord message, or to remove the dropdown
 * after a decision is made in Discord).
 */
export async function editBotMessage(
  channelId: string,
  messageId: string,
  payload: DiscordMessagePayload
): Promise<boolean> {
  const botToken = process.env.DISCORD_BOT_TOKEN
  if (!botToken) {
    console.warn('editBotMessage skipped: DISCORD_BOT_TOKEN is not set')
    return false
  }

  try {
    const res = await fetch(
      `https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bot ${botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    )
    if (!res.ok) {
      console.error('editBotMessage failed:', res.status, await res.text())
      return false
    }
    return true
  } catch (err) {
    console.error('editBotMessage error:', err)
    return false
  }
}
