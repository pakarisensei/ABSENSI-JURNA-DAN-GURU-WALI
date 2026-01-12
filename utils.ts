
export const formatTanggal = (tanggalString: string): string => {
  if (!tanggalString) return '';
  const [tahun, bulan, tanggal] = tanggalString.split('-');
  return `${tanggal}/${bulan}/${tahun}`;
};

export const formatHariTanggal = (tanggalString: string): string => {
  if (!tanggalString) return '';
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const date = new Date(tanggalString + 'T00:00:00');
  return date.toLocaleDateString('id-ID', options);
};

export const getWeekNumber = (d: Date): { year: number; week: number } => {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return { year: date.getUTCFullYear(), week: weekNo };
};
