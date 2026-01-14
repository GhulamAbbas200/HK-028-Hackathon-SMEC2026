
import { Expense } from '../types';

export const reportService = {
  exportToCSV: (expenses: Expense[]) => {
    const headers = ['Date', 'Merchant', 'Category', 'Amount', 'Currency'];
    const rows = expenses.map(e => [
      e.date,
      `"${e.merchant.replace(/"/g, '""')}"`,
      e.category,
      e.total.toFixed(2),
      e.currency
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `smartspend_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  generatePDFSummary: (expenses: Expense[]) => {
    // Basic PDF representation as a printable window since we shouldn't add external heavy libs
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const total = expenses.reduce((sum, e) => sum + e.total, 0);
    const content = `
      <html>
      <head>
        <title>Expense Summary Report</title>
        <style>
          body { font-family: sans-serif; padding: 40px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f4f4f4; }
          .header { text-align: center; margin-bottom: 40px; }
          .total { font-size: 24px; font-weight: bold; margin-top: 20px; text-align: right; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>SmartSpend AI - Financial Report</h1>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Merchant</th>
              <th>Category</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${expenses.map(e => `
              <tr>
                <td>${e.date}</td>
                <td>${e.merchant}</td>
                <td>${e.category}</td>
                <td>$${e.total.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="total">Grand Total: $${total.toFixed(2)}</div>
      </body>
      </html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  }
};
