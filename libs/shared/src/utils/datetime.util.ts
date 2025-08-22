export class DateTimeUtils {
  static getCurrentUnixTimestamp(): number {
    return Math.floor(Date.now() / 1000);
  }

  static convertUnixTimestampToDate(unixTimestamp: number): Date {
    return new Date(unixTimestamp * 1000);
  }

  static convertDateToUnixTimestamp(date: Date): number {
    return Math.floor(date.getTime() / 1000);
  }
}
