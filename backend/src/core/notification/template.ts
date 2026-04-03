export const templates = {
  bidAccepted: (businessName: string, tenderTitle: string, bidAmount: string, bidRef: string) => ({
    subject: `Bid Awarded – ${tenderTitle}`,
    html: `
      <div style="font-family:'Source Sans 3',Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e4e4e4;border-radius:12px;overflow:hidden;">
        
        <!-- Header -->
        <div style="background:#0a2540;padding:36px 40px 28px;position:relative;">
          <div style="font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:#c9a84c;margin-bottom:10px;">
            Government Tender Management System
          </div>
          <div style="font-family:'Playfair Display',Georgia,serif;font-size:26px;color:#f5f0e8;line-height:1.25;">
            Your bid has been<br/>awarded.
          </div>
          <div style="position:absolute;bottom:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#c9a84c,#e8d48b,#c9a84c);"></div>
        </div>

        <!-- Body -->
        <div style="background:#ffffff;padding:36px 40px;">
          <p style="font-size:15px;color:#555;margin-bottom:20px;font-weight:300;">Dear ${businessName},</p>

          <span style="display:inline-flex;align-items:center;gap:7px;padding:8px 16px;border-radius:4px;font-size:12px;font-weight:500;letter-spacing:1.5px;text-transform:uppercase;background:#f0f8f0;color:#2a6b2a;border:1px solid #b8ddb8;margin-bottom:24px;">
            ● Bid Accepted
          </span>

          <p style="font-size:15px;line-height:1.7;color:#1a1a1a;margin-bottom:28px;">
            We are pleased to inform you that your bid for the above-referenced tender has been reviewed and formally accepted by the issuing authority. The contract is hereby awarded to your organisation.
          </p>

          <!-- Info card -->
          <div style="border:1px solid #ebebeb;border-radius:8px;padding:18px 20px;margin-bottom:28px;background:#fafafa;">
            <div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #ebebeb;font-size:13px;">
              <span style="color:#888;font-weight:300;">Tender Title</span>
              <span style="color:#1a1a1a;font-weight:500;">${tenderTitle}</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #ebebeb;font-size:13px;">
              <span style="color:#888;font-weight:300;">Bid Amount</span>
              <span style="color:#1a1a1a;font-weight:500;">${bidAmount}</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #ebebeb;font-size:13px;">
              <span style="color:#888;font-weight:300;">Bid Reference</span>
              <span style="color:#1a1a1a;font-weight:500;">${bidRef}</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:7px 0;font-size:13px;">
              <span style="color:#888;font-weight:300;">Decision Date</span>
              <span style="color:#1a1a1a;font-weight:500;">${new Date().toLocaleDateString("en-GB", { day:"numeric", month:"long", year:"numeric" })}</span>
            </div>
          </div>

          <a href="#" style="display:block;text-align:center;background:#0a2540;color:#f5f0e8;padding:13px 28px;border-radius:6px;font-size:13px;font-weight:500;letter-spacing:1px;text-transform:uppercase;text-decoration:none;margin-bottom:28px;">
            View Award Details
          </a>

          <div style="border-top:1px solid #ebebeb;padding-top:20px;font-size:11.5px;color:#999;line-height:1.6;font-weight:300;">
            This is an official communication from the Government Tender Management System. Please do not reply to this email.
          </div>
        </div>
      </div>
    `,
    sms: `Congratulations ${businessName}! Your bid for "${tenderTitle}" (${bidRef}) has been accepted and the tender awarded to you.`,
  }),

  bidRejected: (businessName: string, tenderTitle: string, bidRef: string) => ({
    subject: `Bid Outcome Notification – ${tenderTitle}`,
    html: `
      <div style="font-family:'Source Sans 3',Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e4e4e4;border-radius:12px;overflow:hidden;">

        <!-- Header -->
        <div style="background:#1a1a1a;padding:36px 40px 28px;position:relative;">
          <div style="font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:#666;margin-bottom:10px;">
            Government Tender Management System
          </div>
          <div style="font-family:'Playfair Display',Georgia,serif;font-size:26px;color:#888;line-height:1.25;">
            Bid outcome<br/>notification.
          </div>
          <div style="position:absolute;bottom:0;left:0;right:0;height:3px;background:#333;"></div>
        </div>

        <!-- Body -->
        <div style="background:#ffffff;padding:36px 40px;">
          <p style="font-size:15px;color:#555;margin-bottom:20px;font-weight:300;">Dear ${businessName},</p>

          <span style="display:inline-flex;align-items:center;gap:7px;padding:8px 16px;border-radius:4px;font-size:12px;font-weight:500;letter-spacing:1.5px;text-transform:uppercase;background:#f8f0f0;color:#7a2a2a;border:1px solid #ddbbbb;margin-bottom:24px;">
            ● Bid Unsuccessful
          </span>

          <p style="font-size:15px;line-height:1.7;color:#1a1a1a;margin-bottom:28px;">
            Thank you for submitting your bid for the above-referenced tender. After careful evaluation, we regret to inform you that your bid was not selected for this award. We appreciate the effort and time invested in your proposal.
          </p>

          <!-- Info card -->
          <div style="border:1px solid #ebebeb;border-radius:8px;padding:18px 20px;margin-bottom:28px;background:#fafafa;">
            <div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #ebebeb;font-size:13px;">
              <span style="color:#888;font-weight:300;">Tender Title</span>
              <span style="color:#1a1a1a;font-weight:500;">${tenderTitle}</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #ebebeb;font-size:13px;">
              <span style="color:#888;font-weight:300;">Bid Reference</span>
              <span style="color:#1a1a1a;font-weight:500;">${bidRef}</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:7px 0;font-size:13px;">
              <span style="color:#888;font-weight:300;">Decision Date</span>
              <span style="color:#1a1a1a;font-weight:500;">${new Date().toLocaleDateString("en-GB", { day:"numeric", month:"long", year:"numeric" })}</span>
            </div>
          </div>

          <a href="#" style="display:block;text-align:center;background:transparent;color:#555;padding:13px 28px;border-radius:6px;font-size:13px;font-weight:500;letter-spacing:1px;text-transform:uppercase;text-decoration:none;margin-bottom:28px;border:1px solid #ccc;">
            Browse Open Tenders
          </a>

          <div style="border-top:1px solid #ebebeb;padding-top:20px;font-size:11.5px;color:#999;line-height:1.6;font-weight:300;">
            This is an official communication from the Government Tender Management System. Please do not reply to this email.
          </div>
        </div>
      </div>
    `,
    sms: `Dear ${businessName}, your bid for "${tenderTitle}" (${bidRef}) was not selected this time. Thank you for participating.`,
  }),
  accountApproved: (name: string) => ({
    subject: "Your account has been approved",
    html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <div style="background:#0a2540;padding:32px 40px;">
                <div style="font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:#c9a84c;margin-bottom:10px;">
                    Government Tender Management System
                </div>
                <div style="font-family:Georgia,serif;font-size:24px;color:#f5f0e8;">
                    Account Approved
                </div>
            </div>
            <div style="padding:36px 40px;background:#fff;">
                <p style="font-size:15px;color:#555;">Dear ${name},</p>
                <p style="font-size:15px;line-height:1.7;color:#1a1a1a;">
                    Your account has been reviewed and <strong>approved</strong> by our admin team.
                    You can now log in and access the platform.
                </p>
                <a href="${process.env.FRONTEND_URL}/login" 
                   style="display:block;text-align:center;background:#0a2540;color:#f5f0e8;padding:13px 28px;border-radius:6px;font-size:13px;text-decoration:none;margin-top:24px;">
                    Login to your account
                </a>
            </div>
        </div>
    `,
}),

accountRejected: (name: string) => ({
    subject: "Your account registration status",
    html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <div style="background:#1a1a1a;padding:32px 40px;">
                <div style="font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:#666;margin-bottom:10px;">
                    Government Tender Management System
                </div>
                <div style="font-family:Georgia,serif;font-size:24px;color:#888;">
                    Account Not Approved
                </div>
            </div>
            <div style="padding:36px 40px;background:#fff;">
                <p style="font-size:15px;color:#555;">Dear ${name},</p>
                <p style="font-size:15px;line-height:1.7;color:#1a1a1a;">
                    After review, your account registration has not been approved at this time.
                    Please contact support if you believe this is a mistake.
                </p>
            </div>
        </div>
    `,
}),
};
