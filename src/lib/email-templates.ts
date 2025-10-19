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

export function generateWelcomeEmail(params: WelcomeEmailParams): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Great Meeting You!</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                                Great Meeting You, ${params.contactFirstName}!
                            </h1>
                            <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
                                ${params.conference}
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                Hi <strong>${params.contactName}</strong>,
                            </p>
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                It was fantastic connecting with you at <strong>${params.conference}</strong>! I wanted to follow up while our conversation is fresh and share how ${params.yourCompany} can support your projects.
                            </p>
                            
                            <!-- Value Proposition -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px;">
                                <tr>
                                    <td>
                                        <h2 style="color: #667eea; font-size: 20px; margin: 0 0 15px 0;">
                                            🇨🇦 Field Services Across Canada
                                        </h2>
                                        <p style="color: #555555; font-size: 15px; line-height: 1.6; margin: 0;">
                                            At <strong>${params.yourCompany}</strong>, we lead national project management and structured cabling rollouts across Canada — connecting technology, people, and timelines with precision. We're passionate about building smarter, more connected systems and delivering incredible customer experiences.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- CTA Box -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; padding: 25px; margin: 25px 0;">
                                <tr>
                                    <td style="text-align: center;">
                                        <p style="color: #ffffff; font-size: 18px; margin: 0 0 15px 0; font-weight: bold;">
                                            Have Field Services Opportunities in Canada?
                                        </p>
                                        <p style="color: #ffffff; font-size: 15px; margin: 0 0 20px 0; opacity: 0.95;">
                                            Let's discuss how we can support your projects with our nationwide coverage and expertise.
                                        </p>
                                        <a href="mailto:${params.yourEmail}?subject=Field Services Opportunity - Following up from ${params.conference}" 
                                           style="display: inline-block; background-color: #ffffff; color: #667eea; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                                            Get In Touch
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                                I've attached our company overview PDF that highlights our capabilities, past projects, and the value we bring to organizations like yours.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Contact Card -->
                    <tr>
                        <td style="padding: 0 30px 40px 30px;">
                            <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                                <tr>
                                    <td style="background-color: #f8f9fa; padding: 20px; border-bottom: 1px solid #e0e0e0;">
                                        <h3 style="color: #333333; font-size: 18px; margin: 0;">
                                            📇 My Contact Information
                                        </h3>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 20px;">
                                        <table width="100%" cellpadding="8" cellspacing="0">
                                            <tr>
                                                <td style="color: #666666; font-size: 14px; width: 80px;">Name:</td>
                                                <td style="color: #333333; font-size: 14px; font-weight: bold;">${params.yourName}</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #666666; font-size: 14px;">Title:</td>
                                                <td style="color: #333333; font-size: 14px;">${params.yourTitle}</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #666666; font-size: 14px;">Company:</td>
                                                <td style="color: #333333; font-size: 14px;">${params.yourCompany}</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #666666; font-size: 14px;">Email:</td>
                                                <td>
                                                    <a href="mailto:${params.yourEmail}" style="color: #667eea; text-decoration: none; font-size: 14px;">
                                                        ${params.yourEmail}
                                                    </a>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #666666; font-size: 14px;">Phone:</td>
                                                <td>
                                                    <a href="tel:${params.yourPhone}" style="color: #667eea; text-decoration: none; font-size: 14px;">
                                                        ${params.yourPhone}
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <!-- Action Buttons -->
                                        <table width="100%" cellpadding="10" cellspacing="0" style="margin-top: 20px;">
                                            <tr>
                                                <td align="center">
                                                    <a href="${params.vcardUrl}" 
                                                       style="display: inline-block; background-color: #667eea; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 14px; margin: 0 5px;">
                                                        💾 Save My Contact
                                                    </a>
                                                    <a href="${params.yourLinkedIn}" 
                                                       style="display: inline-block; background-color: #0077b5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 14px; margin: 0 5px;">
                                                        Connect on LinkedIn
                                                    </a>
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
                        <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                            <p style="color: #666666; font-size: 14px; margin: 0 0 15px 0;">
                                <strong>${params.yourCompany}</strong>
                            </p>
                            <p style="color: #666666; font-size: 13px; margin: 0 0 15px 0;">
                                Connecting Technology, People, and Timelines with Precision
                            </p>
                            <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                                <tr>
                                    <td style="padding: 0 10px;">
                                        <a href="${params.companyWebsite}" style="color: #667eea; text-decoration: none; font-size: 13px;">
                                            🌐 Website
                                        </a>
                                    </td>
                                    <td style="padding: 0 10px; color: #cccccc;">|</td>
                                    <td style="padding: 0 10px;">
                                        <a href="${params.companyLinkedIn}" style="color: #667eea; text-decoration: none; font-size: 13px;">
                                            💼 Company LinkedIn
                                        </a>
                                    </td>
                                    <td style="padding: 0 10px; color: #cccccc;">|</td>
                                    <td style="padding: 0 10px;">
                                        <a href="${params.yourLinkedIn}" style="color: #667eea; text-decoration: none; font-size: 13px;">
                                            👤 My LinkedIn
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            <p style="color: #999999; font-size: 12px; margin: 20px 0 0 0;">
                                This email was sent because we connected at ${params.conference}.
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

