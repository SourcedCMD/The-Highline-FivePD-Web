// Discord's epoch: 2015-01-01T00:00:00.000Z, in ms since Unix epoch
const DISCORD_EPOCH = 1420070400000n

/**
 * Decodes a Discord snowflake ID into the Date it was created.
 * Useful for spotting newly-created ("alt") accounts in logs.
 */
export function snowflakeToDate(id: string): Date {
  const ms = (BigInt(id) >> 22n) + DISCORD_EPOCH
  return new Date(Number(ms))
}
