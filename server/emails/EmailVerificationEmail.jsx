import React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

export default function EmailVerificationEmail({
  userName,
  verificationUrl,
  logoUrl,
}) {

  const currentYear = new Date().getFullYear();
  return (
    <Html>
      <Head />
      <Preview>Verify your email address for ShareSphere</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Img
              src={logoUrl}
              width="120"
              height="120"
              alt="ShareSphere"
              style={logo}
            />
          </Section>
          
          <Section style={content}>
            <Heading style={h1}>Verify Your Email Address</Heading>
            
            <Text style={text}>
              Hi {userName},
            </Text>
            
            <Text style={text}>
              Welcome to ShareSphere! To complete your registration and start sharing items with your community, please verify your email address by clicking the button below.
            </Text>
            
            <Section style={buttonContainer}>
              <Link href={verificationUrl} style={button}>
                Verify Email Address
              </Link>
            </Section>
            
            <Text style={text}>
              This verification link will expire in 24 hours. If you didn't create a ShareSphere account, you can safely ignore this email.
            </Text>
            
            <Text style={text}>
              If the button above doesn't work, you can copy and paste this link into your browser:
            </Text>
            
            <Text style={linkText}>
              {verificationUrl}
            </Text>
            
            <Text style={footer}>
              Thanks,<br />
              The ShareSphere Team
            </Text>

            <Section style={footer}>
              <Img
                src={`${logoUrl}?height=40&width=120&query=ShareSphere+Logo`}
                width={120}
                height={120}
                alt="ShareSphere"
                style={footerLogo}
              />
              <Text style={footerText}>
                This email was sent via ShareSphere. Do not reply to this email.
              </Text>
              <Text style={footerText}>© {currentYear} ShareSphere. All rights reserved.</Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '560px',
};

const logoSection = {
  textAlign: 'center',
  marginBottom: '32px',
};

const logo = {
  display: 'block',
  margin: '0 auto',
};

const content = {
  padding: '0 24px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
};

const buttonContainer = {
  textAlign: 'center',
  margin: '32px 0',
};

const button = {
  backgroundColor: '#4f46e5',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center',
  display: 'inline-block',
  padding: '12px 24px',
};

const linkText = {
  color: '#0070f3',
  fontSize: '14px',
  wordBreak: 'break-all',
  margin: '16px 0',
  padding: '12px',
  backgroundColor: '#f5f5f5',
  borderRadius: '4px',
};

const footer = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '22px',
  marginTop: '32px',
  marginBottom: '0',
}; 

// const footer = {
//   padding: '20px 30px',
//   backgroundColor: '#f9fafb',
//   borderTop: '1px solid #e5e7eb',
//   textAlign: 'center',
// };

const footerLogo = {
  display: 'block',
  margin: '0 auto 20px',
};

const footerText = {
  margin: '0',
  fontSize: '14px',
  color: '#6b7280',
};