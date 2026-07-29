import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { verifySessionToken } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const cookieStore = await cookies()
    const token = cookieStore.get('discord-session')?.value
    const session = verifySessionToken<{ id: string }>(token)

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      department,
      departmentName,
      userId,
      userEmail,
      username,
      age,
      experience,
      whyJoin,
      whatCanYouBring,
      availability,
      previousExperience,
    } = body

    // Validate required fields
    if (!department || !userId || !age || !experience || !whyJoin || !whatCanYouBring || !availability) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Save to Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Block submission if a staff member has closed this department's applications
    const { data: deptStatus } = await supabase
      .from('department_status')
      .select('is_open')
      .eq('department_id', department)
      .maybeSingle()

    if (deptStatus && deptStatus.is_open === false) {
      return NextResponse.json(
        { error: 'Applications for this department are currently closed' },
        { status: 403 }
      )
    }

    const { error: dbError } = await supabase.from('applications').insert({
      department_id: department,
      department_name: departmentName,
      user_id: userId,
      user_email: userEmail,
      username: username,
      age: parseInt(age),
      experience,
      why_join: whyJoin,
      what_can_you_bring: whatCanYouBring,
      availability,
      previous_experience: previousExperience || null,
      submitted_at: new Date().toISOString(),
      status: 'pending',
    })

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to save application to database' },
        { status: 500 }
      )
    }

    // Helper function to truncate text for Discord embed limits
    const truncateText = (text: string, maxLength: number = 1024) => {
      if (!text) return 'N/A'
      return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text
    }

    // Send to Discord webhook
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL
    if (webhookUrl) {
      try {
        const embed = {
          title: `📝 New ${departmentName} Application`,
          description: `A new application has been submitted for **${departmentName}**\n\n**Application Details:**`,
          color: 0x4a9eff, // Blue color
          fields: [
            {
              name: '👤 Applicant Information',
              value: `**Username:** ${username}\n**Email:** ${userEmail}\n**Discord ID:** ${userId}`,
              inline: false,
            },
            {
              name: '🎂 Age',
              value: age.toString(),
              inline: true,
            },
            {
              name: '📋 Department',
              value: departmentName,
              inline: true,
            },
            {
              name: '━━━━━━━━━━━━━━━━━━━━━━',
              value: '\u200b', // Zero-width space for separator
              inline: false,
            },
            {
              name: '💼 Roleplay Experience',
              value: truncateText(experience),
              inline: false,
            },
            {
              name: '❓ Why do you want to join?',
              value: truncateText(whyJoin),
              inline: false,
            },
            {
              name: '✨ What can you bring?',
              value: truncateText(whatCanYouBring),
              inline: false,
            },
            {
              name: '📅 Availability',
              value: truncateText(availability),
              inline: false,
            },
          ],
          footer: {
            text: 'The Highline',
            icon_url: undefined,
          },
          timestamp: new Date().toISOString(),
        }

        // Add previous experience if provided
        if (previousExperience && previousExperience.trim()) {
          embed.fields.push({
            name: '🏢 Previous Department/Staff Experience',
            value: truncateText(previousExperience),
            inline: false,
          })
        }

        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            embeds: [embed],
          }),
        })

        if (!webhookResponse.ok) {
          console.error('Webhook error:', await webhookResponse.text())
          // Don't fail the request if webhook fails
        }
      } catch (webhookError) {
        console.error('Webhook error:', webhookError)
        // Don't fail the request if webhook fails
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Application submission error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
