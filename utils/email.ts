interface NotificationEmail {
    to: string;
    type: 'RATING' | 'COMMENT';
    action: string;
    targetName: string;
  }
  
  async function sendModerationEmail({ to, type, action, targetName }: NotificationEmail) {
    const templates = {
      RATING: {
        VERIFY: {
          subject: 'Your Rating has been Verified',
          body: `Your rating for ${targetName} has been verified and is now public.`
        },
        REJECT: {
          subject: 'Your Rating was not Approved',
          body: `Your rating for ${targetName} could not be verified. Please ensure you provide sufficient evidence.`
        }
      },
      COMMENT: {
        APPROVE: {
          subject: 'Your Comment has been Approved',
          body: `Your comment on ${targetName} has been approved and is now visible.`
        },
        REJECT: {
          subject: 'Your Comment was not Approved',
          body: `Your comment on ${targetName} was not approved as it may violate our community guidelines.`
        }
      }
    };
  
    const template = templates[type][action];
  
    // Implement your email sending logic here
    // For example, using nodemailer or an email service
    console.log('Sending email:', {
      to,
      subject: template.subject,
      body: template.body
    });
  }
  