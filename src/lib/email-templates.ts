interface WelcomeEmailParams {
  contactName: string
  contactFirstName: string
  conference: string
  yourName: string
  yourTitle: string
  yourCompany: string
  yourEmail: string
  yourPhone: string
  yourLinkedIn: string
  companyWebsite: string
  companyLinkedIn: string
  vcardUrl: string
}

interface NewUserWelcomeParams {
  userName: string
  userFirstName: string
  userEmail: string
  slug: string
  qrPageUrl: string
  profileUrl: string
  dashboardUrl: string
  loginUrl: string
}

export function generateWelcomeEmail(params: WelcomeEmailParams): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Great Meeting You!</title>
    <style>
        @media only screen and (max-width: 600px) {
            .mobile-stack {
                display: block !important;
                width: 100% !important;
                margin-bottom: 10px !important;
            }
            .mobile-padding {
                padding: 20px !important;
            }
            .service-card {
                margin-bottom: 15px !important;
            }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 600px;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 45px 35px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0 0 10px 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                                Great Connecting, ${params.contactFirstName}! 🤝
                            </h1>
                            <p style="color: #ffffff; margin: 0; font-size: 17px; opacity: 0.95;">
                                📍 ${params.conference}
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Personal Greeting -->
                    <tr>
                        <td style="padding: 35px 35px 25px 35px;" class="mobile-padding">
                            <p style="color: #333333; font-size: 17px; line-height: 1.6; margin: 0 0 18px 0;">
                                Hi <strong>${params.contactName}</strong>,
                            </p>
                            <p style="color: #333333; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
                                It was fantastic connecting with you at <strong>${params.conference}</strong>! I really enjoyed our conversation and wanted to follow up while everything is fresh in our minds.
                            </p>
                            <p style="color: #333333; font-size: 16px; line-height: 1.7; margin: 0;">
                                Here's a quick overview of how <strong>${params.yourCompany}</strong> can support your upcoming projects across Canada.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Who We Are -->
                    <tr>
                        <td style="padding: 0 35px 30px 35px;" class="mobile-padding">
                            <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-left: 5px solid #667eea; border-radius: 8px; padding: 25px;">
                                <tr>
                                    <td>
                                        <h2 style="color: #667eea; font-size: 22px; margin: 0 0 12px 0; font-weight: 700;">
                                            🇨🇦 Canada's Field Services Experts
                                        </h2>
                                        <p style="color: #555555; font-size: 16px; line-height: 1.7; margin: 0;">
                                            <strong>${params.yourCompany}</strong> specializes in nationwide project management, structured cabling, and field services coordination. We connect technology, people, and timelines with precision — delivering exceptional results from coast to coast.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Service Cards -->
                    <tr>
                        <td style="padding: 0 35px 30px 35px;" class="mobile-padding">
                            <h3 style="color: #333333; font-size: 20px; margin: 0 0 20px 0; font-weight: 700; text-align: center;">
                                What We Do Best
                            </h3>
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <!-- Service Card 1 -->
                                    <td width="33%" style="padding: 0 10px 0 0;" class="service-card">
                                        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 2px solid #e9ecef; border-radius: 8px; padding: 20px; text-align: center; height: 100%;">
                                            <tr>
                                                <td>
                                                    <div style="font-size: 36px; margin-bottom: 10px;">🏗️</div>
                                                    <h4 style="color: #667eea; font-size: 16px; margin: 0 0 10px 0; font-weight: 700;">Project Management</h4>
                                                    <p style="color: #666666; font-size: 14px; line-height: 1.5; margin: 0;">National coordination & delivery</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                    <!-- Service Card 2 -->
                                    <td width="33%" style="padding: 0 5px;" class="service-card">
                                        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 2px solid #e9ecef; border-radius: 8px; padding: 20px; text-align: center; height: 100%;">
                                            <tr>
                                                <td>
                                                    <div style="font-size: 36px; margin-bottom: 10px;">🔌</div>
                                                    <h4 style="color: #667eea; font-size: 16px; margin: 0 0 10px 0; font-weight: 700;">Structured Cabling</h4>
                                                    <p style="color: #666666; font-size: 14px; line-height: 1.5; margin: 0;">Professional installation & testing</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                    <!-- Service Card 3 -->
                                    <td width="33%" style="padding: 0 0 0 10px;" class="service-card">
                                        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 2px solid #e9ecef; border-radius: 8px; padding: 20px; text-align: center; height: 100%;">
                                            <tr>
                                                <td>
                                                    <div style="font-size: 36px; margin-bottom: 10px;">🚀</div>
                                                    <h4 style="color: #667eea; font-size: 16px; margin: 0 0 10px 0; font-weight: 700;">Field Services</h4>
                                                    <p style="color: #666666; font-size: 14px; line-height: 1.5; margin: 0;">Coast-to-coast coverage</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Social Proof -->
                    <tr>
                        <td style="padding: 0 35px 30px 35px;" class="mobile-padding">
                            <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 10px; padding: 25px; text-align: center;">
                                <tr>
                                    <td>
                                        <p style="color: #ffffff; font-size: 18px; margin: 0 0 15px 0; font-weight: 700;">
                                            ✨ Trusted Across Canada
                                        </p>
                                        <p style="color: #ffffff; font-size: 15px; line-height: 1.6; margin: 0; opacity: 0.95;">
                                            Hundreds of successful projects delivered nationwide. From small businesses to enterprise rollouts, we deliver on-time, every time.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- PDF Attachment Highlight -->
                    <tr>
                        <td style="padding: 0 35px 30px 35px;" class="mobile-padding">
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff7ed; border: 2px solid #fed7aa; border-radius: 10px; padding: 25px;">
                                <tr>
                                    <td>
                                        <h3 style="color: #c2410c; font-size: 19px; margin: 0 0 15px 0; font-weight: 700;">
                                            📎 Company Overview Attached
                                        </h3>
                                        <p style="color: #9a3412; font-size: 15px; line-height: 1.6; margin: 0 0 15px 0;">
                                            I've attached our <strong>Idea Networks Overview PDF</strong> which includes:
                                        </p>
                                        <ul style="color: #9a3412; font-size: 15px; line-height: 1.7; margin: 0; padding-left: 25px;">
                                            <li>Our core capabilities and services</li>
                                            <li>Past project examples and case studies</li>
                                            <li>What makes us different</li>
                                            <li>How we deliver value to clients</li>
                                        </ul>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Primary CTA -->
                    <tr>
                        <td style="padding: 0 35px 35px 35px;" class="mobile-padding">
                            <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 30px;">
                                <tr>
                                    <td style="text-align: center;">
                                        <p style="color: #ffffff; font-size: 22px; margin: 0 0 12px 0; font-weight: 700;">
                                            Let's Continue the Conversation
                                        </p>
                                        <p style="color: #ffffff; font-size: 16px; margin: 0 0 25px 0; line-height: 1.6; opacity: 0.95;">
                                            Have upcoming projects in Canada? I'd love to learn more about your needs and explore how we can support your success.
                                        </p>
                                        <a href="mailto:${params.yourEmail}?subject=Let's Discuss Projects - Following up from ${params.conference}&body=Hi ${params.yourName},%0D%0A%0D%0AI'd like to discuss potential opportunities for Idea Networks to support our projects." 
                                           style="display: inline-block; background-color: #ffffff; color: #667eea; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 17px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                                            📧 Reply to This Email
                                        </a>
                                        <p style="color: #ffffff; font-size: 14px; margin: 20px 0 0 0; opacity: 0.85;">
                                            Or call me directly at <a href="tel:${params.yourPhone}" style="color: #ffffff; font-weight: 700; text-decoration: underline;">${params.yourPhone}</a>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Next Steps Timeline -->
                    <tr>
                        <td style="padding: 0 35px 35px 35px;" class="mobile-padding">
                            <h3 style="color: #333333; font-size: 19px; margin: 0 0 20px 0; font-weight: 700; text-align: center;">
                                🗓️ What's Next?
                            </h3>
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td width="33%" style="padding: 15px; text-align: center; border-right: 1px solid #e9ecef;">
                                        <div style="font-size: 28px; margin-bottom: 8px;">✅</div>
                                        <p style="color: #10b981; font-size: 14px; font-weight: 700; margin: 0 0 5px 0;">We Connected</p>
                                        <p style="color: #999999; font-size: 12px; margin: 0;">At ${params.conference}</p>
                                    </td>
                                    <td width="33%" style="padding: 15px; text-align: center; border-right: 1px solid #e9ecef; background-color: #f8f9fa;">
                                        <div style="font-size: 28px; margin-bottom: 8px;">📧</div>
                                        <p style="color: #667eea; font-size: 14px; font-weight: 700; margin: 0 0 5px 0;">You Are Here</p>
                                        <p style="color: #999999; font-size: 12px; margin: 0;">Review our overview</p>
                                    </td>
                                    <td width="33%" style="padding: 15px; text-align: center;">
                                        <div style="font-size: 28px; margin-bottom: 8px;">🚀</div>
                                        <p style="color: #666666; font-size: 14px; font-weight: 700; margin: 0 0 5px 0;">Let's Chat</p>
                                        <p style="color: #999999; font-size: 12px; margin: 0;">Discuss your needs</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Contact Card -->
                    <tr>
                        <td style="padding: 0 35px 40px 35px;" class="mobile-padding">
                            <table width="100%" cellpadding="0" cellspacing="0" style="border: 2px solid #e9ecef; border-radius: 10px; overflow: hidden;">
                                <tr>
                                    <td style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 20px; border-bottom: 2px solid #e9ecef;">
                                        <h3 style="color: #333333; font-size: 18px; margin: 0; font-weight: 700;">
                                            📇 Save My Contact Information
                                        </h3>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 25px;">
                                        <table width="100%" cellpadding="10" cellspacing="0">
                                            <tr>
                                                <td style="color: #666666; font-size: 14px; width: 90px; font-weight: 600;">Name:</td>
                                                <td style="color: #333333; font-size: 15px; font-weight: 700;">${params.yourName}</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #666666; font-size: 14px; font-weight: 600;">Title:</td>
                                                <td style="color: #333333; font-size: 15px;">${params.yourTitle}</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #666666; font-size: 14px; font-weight: 600;">Company:</td>
                                                <td style="color: #333333; font-size: 15px;">${params.yourCompany}</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #666666; font-size: 14px; font-weight: 600;">Email:</td>
                                                <td>
                                                    <a href="mailto:${params.yourEmail}" style="color: #667eea; text-decoration: none; font-size: 15px; font-weight: 600;">
                                                        ${params.yourEmail}
                                                    </a>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #666666; font-size: 14px; font-weight: 600;">Phone:</td>
                                                <td>
                                                    <a href="tel:${params.yourPhone}" style="color: #667eea; text-decoration: none; font-size: 15px; font-weight: 600;">
                                                        ${params.yourPhone}
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <!-- Action Buttons -->
                                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 25px;">
                                            <tr>
                                                <td align="center">
                                                    <table cellpadding="0" cellspacing="0">
                                                        <tr>
                                                            <td style="padding: 5px;">
                                                                <a href="${params.vcardUrl}" 
                                                                   style="display: inline-block; background-color: #667eea; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 700;">
                                                                    💾 Save Contact
                                                                </a>
                                                            </td>
                                                            <td style="padding: 5px;">
                                                                <a href="${params.yourLinkedIn}" 
                                                                   style="display: inline-block; background-color: #0077b5; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 700;">
                                                                    💼 LinkedIn
                                                                </a>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 35px; text-align: center; border-top: 2px solid #e0e0e0;">
                            <p style="color: #333333; font-size: 16px; margin: 0 0 8px 0; font-weight: 700;">
                                ${params.yourCompany}
                            </p>
                            <p style="color: #666666; font-size: 14px; margin: 0 0 20px 0; font-style: italic;">
                                Connecting Technology, People, and Timelines with Precision
                            </p>
                            <table cellpadding="0" cellspacing="0" style="margin: 0 auto 20px auto;">
                                <tr>
                                    <td style="padding: 0 12px;">
                                        <a href="${params.companyWebsite}" style="color: #667eea; text-decoration: none; font-size: 14px; font-weight: 600;">
                                            🌐 Website
                                        </a>
                                    </td>
                                    <td style="padding: 0 12px; color: #cccccc; font-weight: 300;">|</td>
                                    <td style="padding: 0 12px;">
                                        <a href="${params.companyLinkedIn}" style="color: #667eea; text-decoration: none; font-size: 14px; font-weight: 600;">
                                            💼 Company
                                        </a>
                                    </td>
                                    <td style="padding: 0 12px; color: #cccccc; font-weight: 300;">|</td>
                                    <td style="padding: 0 12px;">
                                        <a href="${params.yourLinkedIn}" style="color: #667eea; text-decoration: none; font-size: 14px; font-weight: 600;">
                                            👤 ${params.yourName.split(' ')[0]}
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            <p style="color: #999999; font-size: 13px; margin: 0; line-height: 1.5;">
                                This email was sent because we connected at <strong>${params.conference}</strong>.<br>
                                Looking forward to working together! 🚀
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `.trim()
}

