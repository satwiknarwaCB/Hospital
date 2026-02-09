import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import settings
import logging

logger = logging.getLogger(__name__)

async def send_invitation_email(email: str, name: str, role: str, invitation_link: str):
    """
    Send an invitation email to a new user.
    """
    print("\n" + "="*50)
    print(f"📧 SENDING INVITATION TO: {email}")
    print(f"🔗 LINK: {invitation_link}")
    print("="*50 + "\n")

    if not settings.SMTP_USER or "your-email" in settings.SMTP_USER:
        print(f"⚠️  SKIPPING EMAIL SEND: SMTP_USER is not configured in .env")
        print(f"👉 Please update SMTP_USER and SMTP_PASSWORD in your .env file to receive real emails.")
        return False

    try:
        msg = MIMEMultipart()
        msg['From'] = settings.SMTP_FROM
        msg['To'] = email
        msg['Subject'] = f"Invitation to join NeuroBridge as a {role.capitalize()}"

        body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #4f46e5;">Welcome to NeuroBridge, {name}!</h2>
                    <p>You have been invited to join the NeuroBridge platform as a <strong>{role}</strong>.</p>
                    <p>To get started and set your password, please click the button below:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{invitation_link}" 
                           style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                           Set Your Password
                        </a>
                    </div>
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; font-size: 14px; color: #666;">{invitation_link}</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #999;">This invitation was sent by the system. If you weren't expecting this, please ignore this email.</p>
                </div>
            </body>
        </html>
        """
        msg.attach(MIMEText(body, 'html'))

        # Connect to server and send email
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        
        print(f"✅ SUCCESS: Invitation email sent to {email}")
        return True
    except Exception as e:
        print(f"❌ ERROR: Failed to send email to {email}: {str(e)}")
        logger.error(f"Failed to send email to {email}: {str(e)}")
        return False
