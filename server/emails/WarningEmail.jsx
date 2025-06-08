import React from 'react';

import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Link,
  Img,
  Row,
  Column,
} from '@react-email/components';

const main = {
  backgroundColor: '#fef2f2',
  fontFamily: "'Segoe UI', Arial, sans-serif",
  color: '#7f1d1d',
};

const container = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
  padding: '20px',
};

const header = {
  textAlign: 'center',
};

const logo = {
  display: 'block',
  margin: '0 auto',
};

const content = {
  padding: '0 15px',
};

const warningTitle = {
  color: '#dc2626',
  marginTop: '20px',
  marginBottom: '20px',
  fontSize: '22px',
  textAlign: 'center',
};

const paragraph = {
  fontSize: '15px',
  color: '#444',
  marginBottom: '15px',
};

const warningItemCard = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  borderLeft: '4px solid #dc2626',
  padding: '15px',
  marginBottom: '25px',
};

const itemImageColumn = {
  verticalAlign: 'top',
  paddingRight: '15px',
};

const itemImageStyle = {
  display: 'block',
  borderRadius: '6px',
  border: '1px solid #e5e7eb',
  maxWidth: '100%',
  height: 'auto',
};

const itemDetailsColumn = {
  verticalAlign: 'top',
};

const itemNameText = {
  margin: '0 0 10px',
  color: '#111827',
  fontSize: '18px',
};

const itemDetailText = {
  margin: '0',
  color: '#4b5563',
  fontSize: '14px',
};

const warningReasonText = {
  backgroundColor: '#fee2e2',
  padding: '12px 16px',
  borderLeft: '4px solid #dc2626',
  borderRadius: '4px',
  fontSize: '15px',
  color: '#7f1d1d',
  marginBottom: '25px',
};

const warningParagraph = {
  marginBottom: '10px',
  fontSize: '15px',
  color: '#444',
};

const seriousWarningText = {
  color: '#dc2626',
  fontSize: '15px',
  marginBottom: '40px',
};

const supportText = {
  marginTop: '40px',
  marginBottom: '15px',
  fontSize: '14px',
  color: '#9ca3af',
};

const supportLink = {
  marginBottom: '14px',
  fontSize: '14px',
  color: '#4f46e5',
  textDecoration: 'none',
  display: 'block',
};

const footer = {
  padding: '20px 30px',
  backgroundColor: '#f9fafb',
  borderTop: '1px solid #e5e7eb',
  textAlign: 'center',
};

const footerLogo = {
  display: 'block',
  margin: '0 auto 20px',
};

const footerText = {
  margin: '0',
  fontSize: '14px',
  color: '#6b7280',
};

export default function WarningEmail ({
  reportedUserName,
  reportedUserEmail,
  reportReason,
  itemName,
  itemImage,
  itemCategory = 'Not specified',
  itemCondition = 'Not specified',
  logoUrl,
}) {
  const currentYear = new Date().getFullYear();
  const fallbackImage = 'https://via.placeholder.com/150?text=No+Image';

  const capitalizeFirst = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <Html>
      <Head />
      <Preview>⚠️ Warning: Your ShareSphere post has been reported</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Img
              src={`${logoUrl}?height=40&width=120&query=ShareSphere+Logo`}
              width={120}
              height={120}
              alt="ShareSphere"
              style={logo}
            />
          </Section>

          <Section style={content}>
            <Heading style={warningTitle}>Your listing was reported</Heading>
            <Text style={paragraph}>
              Dear {reportedUserName},
            </Text>
            <Text style={paragraph}>
              Your post below <strong>"{itemName}"</strong> was flagged by a user for the following reason:
            </Text>

            <Section style={warningItemCard}>
              <Row>
                <Column width={150} style={itemImageColumn}>
                  <Img
                    src={itemImage || fallbackImage}
                    width={150}
                    height={150}
                    alt={itemName}
                    style={itemImageStyle}
                  />
                </Column>
                <Column style={itemDetailsColumn}>
                  <Text style={itemNameText}>{itemName}</Text>
                  <Text style={itemDetailText}>Category: {itemCategory}</Text>
                  <Text style={itemDetailText}>Condition: {itemCondition}</Text>
                </Column>
              </Row>
            </Section>

            <Text style={warningReasonText}>
              {capitalizeFirst(reportReason)}
            </Text>

            <Text style={warningParagraph}>
              Please review your listing and ensure it complies with ShareSphere's community guidelines within 3 days of receipt of this email
            </Text>
            <Text style={seriousWarningText}>
              Failure to do so will result in the termination of your account
            </Text>

            <Text style={supportText}>
              This is an automated message. If you believe this was a mistake, please contact support with the link below.
            </Text>
            <Link
              href="mailto:sharesphereapp@gmail.com?subject=Support%20Request%20Regarding%20Reported%20Listing"
              style={supportLink}
            >
              Contact Customer Support
            </Link>
          </Section>

          <Section style={footer}>
            <Img
              src={`${logoUrl}?height=40&width=120&query=ShareSphere+Logo`}
              width={120}
              height={120}
              alt="ShareSphere"
              style={footerLogo}
            />
            <Text style={footerText}>
              This email was sent via ShareSphere.
            </Text>
            <Text style={footerText}>© {currentYear} ShareSphere. All rights reserved.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};
