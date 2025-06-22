// Email service for generating work order content
// Since you have your own email client, this service generates the content
// that can be copied and sent through your existing email system

interface WorkOrderEmailData {
  workOrderId: number;
  clientName: string;
  clientEmail: string;
  workOrderTitle: string;
  amount: number;
  companyName: string;
  companyLogo?: string;
  signatureUrl: string;
  terms: string;
}

export async function generateWorkOrderEmailContent(
  workOrderId: number,
  approveRequestId: string,
  workOrderData: WorkOrderEmailData
): Promise<{ subject: string; html: string; text: string }> {
  const logoHtml = workOrderData.companyLogo ? 
    `<img src="${workOrderData.companyLogo}" alt="${workOrderData.companyName}" style="max-height: 80px; margin-bottom: 20px;">` : 
    '';

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Work Order - ${workOrderData.workOrderTitle}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #0066cc; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { margin-bottom: 20px; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .work-order-details { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .amount { font-size: 24px; color: #0066cc; font-weight: bold; }
        .signature-button { background: #0066cc; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; font-weight: bold; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">${logoHtml}</div>
        <h1>Work Order Agreement</h1>
        <p><strong>${workOrderData.companyName}</strong></p>
      </div>

      <div class="content">
        <h2>Hello ${workOrderData.clientName},</h2>
        
        <p>Thank you for your business! Please review and sign the work order below to get started on your project.</p>

        <div class="work-order-details">
          <h3>Project Details</h3>
          <p><strong>Project:</strong> ${workOrderData.workOrderTitle}</p>
          <p><strong>Client:</strong> ${workOrderData.clientName}</p>
          <p><strong>Total Amount:</strong> <span class="amount">$${workOrderData.amount.toLocaleString()}</span></p>
          <p><strong>Payment Terms:</strong> ${workOrderData.terms}</p>
        </div>

        <div style="text-align: center;">
          <a href="${workOrderData.signatureUrl}" class="signature-button">
            Review & Sign Work Order
          </a>
        </div>

        <p><strong>What happens next?</strong></p>
        <ol>
          <li>Click the button above to review the complete work order</li>
          <li>Sign the document electronically</li>
          <li>We'll begin work immediately upon receiving your signature</li>
          <li>You'll receive updates throughout the project</li>
        </ol>

        <p>If you have any questions about this work order, please don't hesitate to contact us.</p>
      </div>

      <div class="footer">
        <p>This work order was sent by ${workOrderData.companyName}</p>
        <p>Powered by ApproveMe Electronic Signatures</p>
      </div>
    </body>
    </html>
  `;

  const emailText = `
Hello ${workOrderData.clientName},

Thank you for your business! Please review and sign the work order for "${workOrderData.workOrderTitle}".

Project Details:
- Total Amount: $${workOrderData.amount.toLocaleString()}
- Payment Terms: ${workOrderData.terms}

To review and sign: ${workOrderData.signatureUrl}

If you have any questions, please contact us.

Best regards,
${workOrderData.companyName}
  `.trim();

  return {
    subject: `Work Order: ${workOrderData.workOrderTitle} - Signature Required`,
    html: emailHtml,
    text: emailText
  };
}

export function generateSignedNotificationContent(
  workOrderId: number,
  clientName: string,
  signedDocumentUrl: string
): { subject: string; html: string; text: string } {
  return {
    subject: `Work Order Signed - ${clientName}`,
    html: `
      <h2>Work Order Signed!</h2>
      <p><strong>Client:</strong> ${clientName}</p>
      <p><strong>Work Order ID:</strong> #${workOrderId}</p>
      <p><strong>Signed Document:</strong> <a href="${signedDocumentUrl}">Download PDF</a></p>
      <p>You can now begin work on this project.</p>
    `,
    text: `
Work Order Signed!

Client: ${clientName}
Work Order ID: #${workOrderId}
Signed Document: ${signedDocumentUrl}

You can now begin work on this project.
    `.trim()
  };
}