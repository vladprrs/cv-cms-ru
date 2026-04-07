'use server';

import { getProfile, getJobs, getAllHighlightsWithJobs } from '@/app/actions';
import { isAuthEnabled } from '@/lib/auth-config';

export interface ResumeContacts {
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  telegram?: string;
}

export interface ResumeData {
  name: string;
  contacts: ResumeContacts;
  summary: string;
  experience: {
    company: string;
    role: string;
    period: string;
    bullets: string[];
  }[];
  skills: string[];
  education: { institution: string; degree: string; period: string }[];
}

export async function generateResume(
  vacancyText: string,
  webhookUrl?: string,
): Promise<{ data?: ResumeData; error?: string }> {
  if (!isAuthEnabled()) {
    return { error: 'Auth not configured — use client-side generation' };
  }

  const { auth } = await import('@/auth');
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Not authenticated' };
  }

  if (!vacancyText || vacancyText.length < 50) {
    return { error: 'Job description must be at least 50 characters' };
  }

  // Determine which endpoint to use
  const isServiceMode = !webhookUrl;
  let targetUrl: string;

  if (isServiceMode) {
    const serviceUrl = process.env.SERVICE_WEBHOOK_URL;
    if (!serviceUrl) {
      return { error: 'Service endpoint not configured' };
    }
    targetUrl = serviceUrl;
  } else {
    try {
      new URL(webhookUrl);
    } catch {
      return { error: 'Invalid webhook URL' };
    }
    targetUrl = webhookUrl;
  }

  // Consume credit for service mode
  let usageRecordId: string | undefined;
  if (isServiceMode) {
    const { consumeCredit } = await import('@/app/actions/credits');
    const creditResult = await consumeCredit();
    if (!creditResult.success) {
      return { error: creditResult.error };
    }
    usageRecordId = creditResult.usageRecordId;
  }

  // Fetch all user data server-side and send it directly to the webhook
  const [profileData, jobsList, highlightsWithJobs] = await Promise.all([
    getProfile(),
    getJobs(),
    getAllHighlightsWithJobs(),
  ]);

  const highlightsData = {
    profile: { fullName: profileData?.fullName || '' },
    jobs: jobsList.map(j => ({
      id: j.id,
      company: j.company,
      role: j.role,
      start_date: j.startDate,
      end_date: j.endDate,
    })),
    highlights: highlightsWithJobs.map(h => ({
      id: h.id,
      title: h.title,
      content: h.content,
      type: h.type,
      company: h.job?.company || '',
      role: h.job?.role || '',
      period: (h.job?.startDate || '') + ' - ' + (h.job?.endDate || 'present'),
      start_date: h.startDate,
      end_date: h.endDate,
      domains: h.domains,
      skills: h.skills,
      keywords: h.keywords,
      metrics: h.metrics,
    })),
  };

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vacancyText,
        highlightsData,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('n8n webhook error:', response.status, errorBody);

      // Refund credit on service error
      if (isServiceMode && usageRecordId) {
        const { refundCredit } = await import('@/app/actions/credits');
        await refundCredit(usageRecordId);
      }

      return { error: 'Failed to generate resume. Please try again.' };
    }

    const result = await response.json();

    // The agent returns the resume as a JSON string in result.resume
    let resumeData: ResumeData;
    if (typeof result.resume === 'string') {
      // Strip markdown code fences if present
      let cleaned = result.resume.trim();
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
      }
      resumeData = JSON.parse(cleaned);
    } else if (result.resume && typeof result.resume === 'object') {
      resumeData = result.resume;
    } else if (result.data) {
      resumeData = typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
    } else {
      // Try parsing the whole result
      resumeData = result;
    }

    // Inject contacts and name from profile DB (not from LLM)
    if (profileData) {
      const contacts: ResumeContacts = {};
      if (profileData.email) contacts.email = profileData.email;
      if (profileData.phone) contacts.phone = profileData.phone;
      if (profileData.location) contacts.location = profileData.location;
      if (profileData.linkedin) contacts.linkedin = profileData.linkedin;
      if (profileData.github) contacts.github = profileData.github;
      if (profileData.website) contacts.website = profileData.website;
      if (profileData.telegram) contacts.telegram = profileData.telegram;
      resumeData.contacts = contacts;
      if (profileData.fullName) resumeData.name = profileData.fullName;
    }

    // Validate AI response — only check experience (name is injected from profile above)
    if (!Array.isArray(resumeData.experience) || resumeData.experience.length === 0) {
      // Refund credit on invalid response
      if (isServiceMode && usageRecordId) {
        const { refundCredit } = await import('@/app/actions/credits');
        await refundCredit(usageRecordId);
      }
      return { error: 'AI agent did not return any experience entries. Please try again.' };
    }

    return { data: resumeData };
  } catch (err) {
    console.error('Resume generation error:', err);

    // Refund credit on any error
    if (isServiceMode && usageRecordId) {
      const { refundCredit } = await import('@/app/actions/credits');
      await refundCredit(usageRecordId);
    }

    return { error: 'Failed to generate resume. Please try again.' };
  }
}
