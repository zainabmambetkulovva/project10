import * as React from 'react';
import { cn } from '@/lib/utils';

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn('w-full caption-bottom text-sm', className)}
      {...props}
    >
      <thead className="[&_tr]:border-b">
        <tr className="border-b border-[#6B46C1]/20">
          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
            <span className="sr-only">Select</span>
          </th>
          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
            Header
          </th>
          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
            Header
          </th>
          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
            Header
          </th>
        </tr>
      </thead>
      <tbody className="[&_tr:last-child]:border-0">
        <tr className="border-b border-[#6B46C1]/20">
          <td className="p-4 align-middle">Cell</td>
          <td className="p-4 align-middle">Cell</td>
          <td className="p-4 align-middle">Cell</td>
          <td className="p-4 align-middle">Cell</td>
        </tr>
      </tbody>
    </table>
  </div>
));
Table.displayName = 'Table';

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn('[&_tr]:border-b', className)} {...props} />
));
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn('[&_tr:last-child]:border-0', className)}
    {...props}
  />
));
TableBody.displayName = 'TableBody';

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement> & {
    hover?: boolean;
  }
>(({ className, hover, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      'border-b border-[#6B46C1]/20 transition-colors hover:bg-[#2A274A]/30 data-[state=selected]:bg-[#2A274A]/50',
      hover ? 'cursor-pointer' : '',
      className
    )}
    {...props}
  />
));
TableRow.displayName = 'TableRow';

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'h-12 px-4 text-left align-middle font-medium text-muted-foreground',
      className
    )}
    {...props}
  />
));
TableHead.displayName = 'TableHead';

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn('p-4 align-middle', className)}
    {...props}
  />
));
TableCell.displayName = 'TableCell';

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn('mt-4 text-sm text-muted-foreground', className)}
    {...props}
  />
));
TableCaption.displayName = 'TableCaption';

export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
};
