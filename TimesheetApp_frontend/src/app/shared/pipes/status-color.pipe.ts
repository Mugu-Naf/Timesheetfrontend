import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'statusColor', standalone: true })
export class StatusColorPipe implements PipeTransform {
  transform(status: string): string {
    const map: Record<string, string> = {
      'Pending':   '#a16207',
      'Approved':  '#166534',
      'Rejected':  '#991b1b',
      'Cancelled': '#475569',
      'Present':   '#166534',
      'Absent':    '#991b1b',
      'HalfDay':   '#a16207',
      'Leave':     '#5b21b6',
      'Active':    '#166534',
      'Inactive':  '#475569',
    };
    return map[status] ?? '#475569';
  }
}
