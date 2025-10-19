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

export function generateNewUserWelcomeEmail(params: NewUserWelcomeParams): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Contact Exchange Pro!</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">
                                🎉 Welcome to Contact Exchange Pro!
                            </h1>
                            <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 18px; opacity: 0.95;">
                                Your contact exchange page is live, ${params.userFirstName}!
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                Hi <strong>${params.userName}</strong>,
                            </p>
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                Congratulations! Your Contact Exchange Pro account is set up and ready to revolutionize how you network at conferences. Say goodbye to business cards forever! 🚀
                            </p>
                            
                            <!-- QR Code Box -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; padding: 30px; margin: 25px 0; text-align: center;">
                                <tr>
                                    <td>
                                        <h2 style="color: #ffffff; font-size: 22px; margin: 0 0 15px 0;">
                                            📱 Your QR Code is Attached
                                        </h2>
                                        <p style="color: #ffffff; font-size: 15px; margin: 0 0 20px 0; opacity: 0.95;">
                                            Save the attached QR code to your phone, or visit your QR page and add it to your home screen for instant access at conferences.
                                        </p>
                                        <a href="${params.qrPageUrl}" 
                                           style="display: inline-block; background-color: #ffffff; color: #667eea; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; margin: 10px 0;">
                                            📲 Open My QR Page
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- How It Works -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 25px; margin: 25px 0; border-radius: 4px;">
                                <tr>
                                    <td>
                                        <h3 style="color: #667eea; font-size: 20px; margin: 0 0 15px 0;">
                                            🚀 How to Use at Conferences:
                                        </h3>
                                        <ol style="color: #555555; font-size: 15px; line-height: 1.8; margin: 0; padding-left: 20px;">
                                            <li><strong>Bookmark your QR page</strong> on your phone (link above)</li>
                                            <li><strong>At conferences</strong>, open the page and show your QR code</li>
                                            <li><strong>People scan it</strong>, submit their contact info with a selfie</li>
                                            <li><strong>View contacts</strong> anytime in your dashboard</li>
                                        </ol>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                                Everything you need is linked below. Welcome to the future of conference networking! 🌟
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Important Links -->
                    <tr>
                        <td style="padding: 0 30px 40px 30px;">
                            <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                                <tr>
                                    <td style="background-color: #f8f9fa; padding: 20px; border-bottom: 1px solid #e0e0e0;">
                                        <h3 style="color: #333333; font-size: 18px; margin: 0;">
                                            🔗 Your Important Links
                                        </h3>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 20px;">
                                        <table width="100%" cellpadding="12" cellspacing="0">
                                            <tr>
                                                <td style="color: #666666; font-size: 14px; vertical-align: top; width: 140px;">
                                                    <strong>QR Code Page:</strong>
                                                </td>
                                                <td style="font-size: 14px;">
                                                    <a href="${params.qrPageUrl}" style="color: #667eea; text-decoration: none; word-break: break-all;">
                                                        ${params.qrPageUrl}
                                                    </a>
                                                    <br>
                                                    <span style="color: #999999; font-size: 12px;">Bookmark this on your phone!</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #666666; font-size: 14px; vertical-align: top;">
                                                    <strong>Your Dashboard:</strong>
                                                </td>
                                                <td style="font-size: 14px;">
                                                    <a href="${params.dashboardUrl}" style="color: #667eea; text-decoration: none; word-break: break-all;">
                                                        ${params.dashboardUrl}
                                                    </a>
                                                    <br>
                                                    <span style="color: #999999; font-size: 12px;">View & manage your contacts</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #666666; font-size: 14px; vertical-align: top;">
                                                    <strong>Profile Page:</strong>
                                                </td>
                                                <td style="font-size: 14px;">
                                                    <a href="${params.profileUrl}" style="color: #667eea; text-decoration: none; word-break: break-all;">
                                                        ${params.profileUrl}
                                                    </a>
                                                    <br>
                                                    <span style="color: #999999; font-size: 12px;">People submit their info here</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #666666; font-size: 14px; vertical-align: top;">
                                                    <strong>Your Username:</strong>
                                                </td>
                                                <td style="font-size: 14px; color: #333333;">
                                                    <strong>${params.slug}</strong>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #666666; font-size: 14px; vertical-align: top;">
                                                    <strong>Email:</strong>
                                                </td>
                                                <td style="font-size: 14px; color: #333333;">
                                                    ${params.userEmail}
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <!-- Action Buttons -->
                                        <table width="100%" cellpadding="10" cellspacing="0" style="margin-top: 20px;">
                                            <tr>
                                                <td align="center">
                                                    <a href="${params.qrPageUrl}" 
                                                       style="display: inline-block; background-color: #667eea; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-size: 15px; font-weight: bold; margin: 5px;">
                                                        📱 Open QR Page
                                                    </a>
                                                    <a href="${params.dashboardUrl}" 
                                                       style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-size: 15px; font-weight: bold; margin: 5px;">
                                                        📊 View Dashboard
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Tips Section -->
                    <tr>
                        <td style="padding: 0 30px 40px 30px;">
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 20px;">
                                <tr>
                                    <td>
                                        <h3 style="color: #c2410c; font-size: 16px; margin: 0 0 10px 0;">
                                            💡 Pro Tips:
                                        </h3>
                                        <ul style="color: #9a3412; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
                                            <li>Add your QR page to your phone's home screen for quick access</li>
                                            <li>Practice showing your QR code before your first conference</li>
                                            <li>Check your dashboard regularly to follow up with new contacts</li>
                                            <li>Export contacts to CSV to add to your CRM</li>
                                        </ul>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                            <p style="color: #666666; font-size: 14px; margin: 0 0 15px 0;">
                                <strong>Contact Exchange Pro</strong>
                            </p>
                            <p style="color: #666666; font-size: 13px; margin: 0 0 15px 0;">
                                The Future of Conference Networking
                            </p>
                            <table cellpadding="0" cellspacing="0" style="margin: 0 auto 15px auto;">
                                <tr>
                                    <td style="padding: 0 10px;">
                                        <a href="${params.dashboardUrl}" style="color: #667eea; text-decoration: none; font-size: 13px;">
                                            Dashboard
                                        </a>
                                    </td>
                                    <td style="padding: 0 10px; color: #cccccc;">|</td>
                                    <td style="padding: 0 10px;">
                                        <a href="${params.loginUrl}" style="color: #667eea; text-decoration: none; font-size: 13px;">
                                            Login
                                        </a>
                                    </td>
                                    <td style="padding: 0 10px; color: #cccccc;">|</td>
                                    <td style="padding: 0 10px;">
                                        <a href="mailto:hbarker@ideanetworks.com" style="color: #667eea; text-decoration: none; font-size: 13px;">
                                            Support
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            <p style="color: #999999; font-size: 12px; margin: 0;">
                                Need help? Reply to this email or contact support.
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

