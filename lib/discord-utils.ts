// Discord's epoch: 2015-01-01T00:00:00.000Z, in ms since Unix epoch
const DISCORD_EPOCH = BigInt(1420070400000)

/**
 * Decodes a Discord snowflake ID into the Date it was created.
 * Useful for spotting newly-created ("alt") accounts in logs.
 */
export function snowflakeToDate(id: string): Date {
  const ms = (BigInt(id) >> BigInt(22)) + DISCORD_EPOCH
  return new Date(Number(ms))
}
