export interface CalendarEventItem {
  id: string;
  name: string;
  date: string; // ISO format or YYYY-MM-DD
  category?: string;
  description?: string;
  tithi?: string;
}

function formatDateToICS(dateStr: string): { start: string; end: string } {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const start = `${year}${month}${day}`;

  // Next day for all-day events in ICS standard
  const nextDay = new Date(d);
  nextDay.setDate(nextDay.getDate() + 1);
  const nextYear = nextDay.getFullYear();
  const nextMonth = String(nextDay.getMonth() + 1).padStart(2, '0');
  const nextDate = String(nextDay.getDate()).padStart(2, '0');
  const end = `${nextYear}${nextMonth}${nextDate}`;

  return { start, end };
}

export function generateSingleEventICS(item: CalendarEventItem): string {
  const { start, end } = formatDateToICS(item.date);
  const uid = `shakti-${item.id}-${start}@shaktipanchang.app`;
  const summary = `${item.name} (सनातन शक्ति पंचांग)`;
  const description = `${item.name} - ${item.category || 'व्रत एवं पर्व'}। ${item.description || ''} ${item.tithi ? `तिथि: ${item.tithi}` : ''}\n\nसनातन शक्ति वैदिक पंचांग द्वारा अनुशंसित।`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Shakti Panchang//Vedic Festivals//HI',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:शक्ति पंचांग व्रत एवं पर्व',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${start}T000000Z`,
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${end}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
    'STATUS:CONFIRMED',
    'TRANSP:TRANSPARENT',
    'BEGIN:VALARM',
    'TRIGGER:-PT12H',
    'ACTION:DISPLAY',
    `DESCRIPTION:कल है ${item.name}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function generateYearFestivalsICS(items: CalendarEventItem[], year: number): string {
  const events = items.map((item) => {
    const { start, end } = formatDateToICS(item.date);
    const uid = `shakti-${item.id}-${start}@shaktipanchang.app`;
    const summary = `${item.name} (शक्ति पंचांग)`;
    const desc = `${item.name} - ${item.category || 'व्रत / पर्व'}। ${item.description || ''} ${item.tithi ? `तिथि: ${item.tithi}` : ''}`;

    return [
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${start}T000000Z`,
      `DTSTART;VALUE=DATE:${start}`,
      `DTEND;VALUE=DATE:${end}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${desc.replace(/\n/g, '\\n')}`,
      'STATUS:CONFIRMED',
      'TRANSP:TRANSPARENT',
      'BEGIN:VALARM',
      'TRIGGER:-PT12H',
      'ACTION:DISPLAY',
      `DESCRIPTION:कल है ${item.name}`,
      'END:VALARM',
      'END:VEVENT',
    ].join('\r\n');
  });

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Shakti Panchang//Vedic Festivals Year Calendar//HI',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:शक्ति पंचांग - वर्ष ${year} के सभी व्रत व पर्व`,
    ...events,
    'END:VCALENDAR',
  ].join('\r\n');
}

export function downloadICSBlob(icsContent: string, fileName: string): void {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName.endsWith('.ics') ? fileName : `${fileName}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function getGoogleCalendarUrl(item: CalendarEventItem): string {
  const { start, end } = formatDateToICS(item.date);
  const title = encodeURIComponent(`${item.name} (शक्ति पंचांग)`);
  const details = encodeURIComponent(
    `${item.name} - ${item.category || 'व्रत एवं पर्व'}। ${item.description || ''}\n\nसनातन शक्ति पंचांग (https://shaktipanchang.app)`
  );
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}`;
}
