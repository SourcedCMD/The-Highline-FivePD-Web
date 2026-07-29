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
