import ical from 'node-ical';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  meetUrl?: string;
  source: 'ZOHO' | 'LOCAL';
}

export async function fetchZohoCalendarEvents(icalUrl: string): Promise<CalendarEvent[]> {
  if (!icalUrl || !icalUrl.startsWith('http')) {
    return [];
  }

  try {
    const webEvents = await ical.async.fromURL(icalUrl);
    const parsedEvents: CalendarEvent[] = [];

    for (const k in webEvents) {
      const ev = webEvents[k] as any;
      if (ev && ev.type === 'VEVENT') {
        const start = ev.start ? new Date(ev.start) : new Date();
        const end = ev.end ? new Date(ev.end) : start;

        parsedEvents.push({
          id: ev.uid || k,
          title: ev.summary || 'Zoho Calendar Event',
          description: ev.description || '',
          startTime: start,
          endTime: end,
          location: ev.location || '',
          meetUrl: ev.url || (typeof ev.location === 'string' && ev.location.startsWith('http') ? ev.location : undefined),
          source: 'ZOHO',
        });
      }
    }

    return parsedEvents.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  } catch (error) {
    console.error('Failed to parse Zoho iCal feed:', error);
    return [];
  }
}
