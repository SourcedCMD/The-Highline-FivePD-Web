import { createClient } from '@supabase/supabase-js'
import { editBotMessage } from '@/lib/discord-bot'
import { buildApplicationMessage, type ApplicationRow } from '@/lib/application-embed'

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

const ALLOWED_STATUSES = ['pending', 'accepted', 'denied', 'closed']

/**
 * The single place status changes go through, whether triggered from the staff
 * panel or from the Discord dropdown. Updates the database, then edits the
 * Discord message to match - so both surfaces always agree.
 */
export async function updateApplicationStatus(
  applicationId: string,
  status: string,
  reviewedBy: string
): Promise<{ ok: true; application: ApplicationRow } | { ok: false; error: string }> {
  if (!ALLOWED_STATUSES.includes(status)) {
    return { ok: false, error: 'Invalid status' }
  }

  const supabase = supabaseAdmin()
  const { data, error } = await supabase
    .from('applications')
    .update({
      status,
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', applicationId)
    .select()
    .single()

  if (error || !data) {
    console.error('Failed to update application status:', error)
    return { ok: false, error: 'Failed to update application' }
  }

  const app = data as ApplicationRow

  if (app.discord_message_id && app.discord_channel_id) {
    const { embeds, components } = buildApplicationMessage(app)
    await editBotMessage(app.discord_channel_id, app.discord_message_id, { embeds, components })
  }

  return { ok: true, application: app }
}
