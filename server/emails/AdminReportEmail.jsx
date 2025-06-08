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
  
  const warningTitle = {
    color: '#dc2626',
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
  
  const warningSectionHeading = {
    color: '#dc2626',
    fontSize: '18px',
    marginBottom: '10px',
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
  
  const emailLink = {
    color: '#4f46e5',
    textDecoration: 'none',
  };
  
  const warningReasonText = {
    backgroundColor: '#fee2e2',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '15px',
    marginBottom: '25px',
  };
  
  const warningMessageCard = {
    backgroundColor: '#f3f4f6',
    padding: '20px',
    borderRadius: '8px',
    fontSize: '15px',
    lineHeight: '1.6',
    marginBottom: '25px',
  };
  
  const messageText = {
    margin: 0,
  };
  
  const footerText = {
    fontSize: '14px',
    color: '#6b7280',
    textAlign: 'center',
    marginTop: '40px',
  };
  
  export default function AdminReportEmail ({
    reporterName,
    reporterEmail,
    reportedUserName,
    reportedUserEmail,
    reportReason,
    reportDescription,
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
        <Preview>User Report: {itemName} ({itemCategory}) flagged on ShareSphere</Preview>
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
              <Heading style={warningTitle}>
                ⚠️ User Report for {itemName} {itemCategory}
              </Heading>
              <Text style={paragraph}>
                A user has flagged this post. Please review the report details below.
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
  
              <Heading style={warningSectionHeading}>Reporter Information</Heading>
              <Section style={detailsCard}>
                <Row>
                  <Column width={100}>
                    <Text style={detailLabel}>Name:</Text>
                  </Column>
                  <Column>
                    <Text style={detailValue}>{capitalizeFirst(reporterName)}</Text>
                  </Column>
                </Row>
                <Row>
                  <Column width={100}>
                    <Text style={detailLabel}>Email:</Text>
                  </Column>
                  <Column>
                    <Link href={`mailto:${reporterEmail}`} style={emailLink}>
                      {reporterEmail}
                    </Link>
                  </Column>
                </Row>
              </Section>
  
              <Heading style={warningSectionHeading}>Reason Selected</Heading>
              <Text style={warningReasonText}>
                {capitalizeFirst(reportReason)}
              </Text>
  
              <Heading style={warningSectionHeading}>User's Description</Heading>
              <Section style={warningMessageCard}>
                <Text style={messageText}>
                  {capitalizeFirst(reportDescription)
                    .split('\n')
                    .map((line, i) => (
                      <span key={i}>
                        {line}
                        <br />
                      </span>
                    ))}
                </Text>
              </Section>
  
              <Text style={footerText}>
                © {currentYear} ShareSphere. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    );
  };
  
