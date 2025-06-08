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
    backgroundColor: '#f5f5f5',
    fontFamily: "'Segoe UI', Arial, sans-serif",
    color: '#333333',
  };
  
  const container = {
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
  };
  
  const header = {
    backgroundColor: '#ffffff',
    padding: '10px 20px',
    textAlign: 'center',
  };
  
  const logo = {
    display: 'block',
    margin: '0 auto',
  };
  
  const content = {
    padding: '15px',
  };
  
  const title = {
    color: '#4f46e5',
    marginTop: 0,
    marginBottom: '20px',
    fontSize: '22px',
  };
  
  const paragraph = {
    fontSize: '16px',
    lineHeight: '1.5',
    marginBottom: '25px',
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
  
  const sectionHeading = {
    color: '#4f46e5',
    fontSize: '18px',
    marginBottom: '15px',
  };
  
  const detailsCard = {
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '25px',
  };
  
  const detailLabel = {
    fontWeight: 'bold',
    paddingBottom: '8px',
  };
  
  const detailValue = {
    paddingBottom: '8px',
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
  
  export default function ReportConfirmationEmail ({
    reporterName,
    reporterEmail,
    reportedUserName,
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
        <Preview>We Received Your Report on {reportedUserName}</Preview>
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
              <Heading style={title}>
                Thank You for Reporting a User
              </Heading>
              <Text style={paragraph}>
                Dear {reporterName},<br /><br />
                We've received your report regarding <strong>{reportedUserName}</strong>. Thank you for taking the time to help us maintain a safe and respectful community.
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
  
              <Heading style={sectionHeading}>Report Details</Heading>
              <Section style={detailsCard}>
                <Row>
                  <Column width={120}>
                    <Text style={detailLabel}>Reported User:</Text>
                  </Column>
                  <Column>
                    <Text style={detailValue}>{capitalizeFirst(reportedUserName)}</Text>
                  </Column>
                </Row>
                <Row>
                  <Column width={120}>
                    <Text style={detailLabel}>Report Reason:</Text>
                  </Column>
                  <Column>
                    <Text style={detailValue}>
                      {capitalizeFirst(reportReason)
                        .split('\n')
                        .map((line, i) => (
                          <span key={i}>
                            {line}
                            <br />
                          </span>
                        ))}
                    </Text>
                  </Column>
                </Row>
              </Section>
  
              <Text style={paragraph}>
                Our team will review the report and take appropriate action if necessary. Please note that we do not disclose outcomes for privacy reasons.
              </Text>
              <Text style={paragraph}>
                If you have further concerns, feel free to contact us directly.
              </Text>
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
                This email was sent via ShareSphere. Do not reply to this email.
              </Text>
              <Text style={footerText}>© {currentYear} ShareSphere. All rights reserved.</Text>
            </Section>
          </Container>
        </Body>
      </Html>
    );
  };
  