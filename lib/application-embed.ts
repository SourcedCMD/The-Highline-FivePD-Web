export interface ApplicationRow {
  id: string
  department_id: string
  department_name: string
  user_id: string
  user_email: string
  username: string
  age: number
  experience: string
  why_join: string
  what_can_you_bring: string
  availability: string
  previous_experience: string | null
  submitted_at: string
  status: string
  reviewed_by: string | null
  reviewed_at: string | null
  discord_message_id?: string | null
  discord_channel_id?: string | null
}

const STATUS_COLOR: Record<string, number> = {
  pending: 0x4a9eff,
  accepted: 0x2ecc71,
  denied: 0xe74c3c,
  closed: 0x95a5a6,
}

const STATUS_LABEL: Record<string, string> = {
  pending: '🟦 Pending Review',
  accepted: '✅ Accepted',
  denied: '❌ Denied',
  closed: '🔒 Closed',
}

function truncate(text: string | null | undefined, max = 1024): string {
  if (!text) return 'N/A'
  return text.length > max ? text.slice(0, max - 3) + '...' : text
}

export function buildApplicationMessage(app: ApplicationRow) {
  const color = STATUS_COLOR[app.status] ?? STATUS_COLOR.pending

  const infoEmbed = {
    title: `📝 ${app.department_name} Application`,
    color,
    fields: [
      { name: 'Applicant', value: app.username, inline: true },
      { name: 'Discord ID', value: app.user_id, inline: true },
      { name: 'Age', value: String(app.age), inline: true },
      { name: 'Email', value: app.user_email || 'N/A', inline: true },
      { name: 'Status', value: STATUS_LABEL[app.status] ?? app.status, inline: true },
      { name: 'Submitted', value: `<t:${Math.floor(new Date(app.submitted_at).getTime() / 1000)}:R>`, inline: true },
      ...(app.reviewed_by
        ? [
            {
              name: 'Reviewed By',
              value: `${app.reviewed_by}${app.reviewed_at ? ` · <t:${Math.floor(new Date(app.reviewed_at).getTime() / 1000)}:R>` : ''}`,
              inline: false,
            },
          ]
        : []),
    ],
    footer: { text: 'The Highline · Application' },
  }

  const answersEmbed = {
    title: '📋 Application Answers',
    color,
    fields: [
      { name: '💼 Roleplay Experience', value: truncate(app.experience), inline: false },
      { name: '❓ Why do you want to join?', value: truncate(app.why_join), inline: false },
      { name: '✨ What can you bring?', value: truncate(app.what_can_you_bring), inline: false },
      { name: '📅 Availability', value: truncate(app.availability), inline: false },
      ...(app.previous_experience
        ? [{ name: '🏢 Previous Department/Staff Experience', value: truncate(app.previous_experience), inline: false }]
        : []),
    ],
    timestamp: new Date().toISOString(),
  }

  const components =
    app.status === 'pending'
      ? [
          {
            type: 1, // action row
            components: [
              {
                type: 3, // string select menu
                custom_id: `app_status_${app.id}`,
                placeholder: 'Select a decision...',
                min_values: 1,
                max_values: 1,
                options: [
                  { label: 'Accept', value: 'accepted', description: 'Accept this application', emoji: { name: '✅' } },
                  { label: 'Deny', value: 'denied', description: 'Deny this application', emoji: { name: '❌' } },
                  { label: 'Close', value: 'closed', description: 'Close without a decision', emoji: { name: '🔒' } },
                ],
              },
            ],
          },
        ]
      : [] // decision made - no more dropdown

  return { embeds: [infoEmbed, answersEmbed], components }
}
