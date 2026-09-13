/**
 * Utility to generate clean wa.me deep links with pre-filled messages.
 */
export function formatPhoneNumber(phone: string): string {
  // Strip non-digit characters, but preserve leading digits
  return phone.replace(/[^\d]/g, '');
}

export function generateWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = formatPhoneNumber(phone);
  const encodedMessage = encodeURIComponent(message.trim());
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

export function getDefaultFollowUpTemplate(leadName: string, serviceType: string): string {
  const firstName = leadName.split(' ')[0] || leadName;
  
  if (serviceType === 'ODOO_CONSULTING') {
    return `Hi ${firstName}, hope you're having a productive week! Following up on our Odoo discussion—did you have a chance to review the scope and milestone breakdown? Let me know if you have any questions or if you'd like a quick 10-minute sync.`;
  } else if (serviceType === 'TRAINING') {
    return `Hi ${firstName}, hope all is well! I'm finalizing the schedule and syllabus materials for our upcoming Odoo training batch. Wanted to confirm if your team is ready or if you'd like to adjust the agenda topics?`;
  } else {
    return `Hi ${firstName}, following up on our advisory sync. Let me know how the recommendations are progressing and if you need my review on any blockers.`;
  }
}
