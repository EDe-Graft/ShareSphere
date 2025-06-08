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
  
  const itemCard = {
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    borderLeft: '4px solid #4f46e5',
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
    marginTop: 0,
    marginBottom: '15px',
    fontSize: '18px',
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
  
  const messageCard = {
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
  
  const button = {
    display: 'inline-block',
    padding: '12px 24px',
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '16px',
    borderRadius: '6px',
    marginBottom: '25px',
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
  
  export default function ItemRequestEmail ({
    uploaderEmail,
    requesterName,
    requesterEmail,
    message,
    itemName,
    itemImage,
    itemCategory = 'Not specified',
    itemCondition = 'Not specified',
    logoUrl,
  }) {
    const currentYear = new Date().getFullYear();
    const fallbackImage = 'https://placeholder.svg?height=150&width=150&query=No+Image+Available';
  
    return (
      <Html>
        <Head />
        <Preview>New Request for Your {itemName} {itemCategory} on ShareSphere</Preview>
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
                New Request for Your {itemName} {itemCategory}
              </Heading>
              <Text style={paragraph}>
                Someone is interested in your item on ShareSphere! Please review the details below.
              </Text>
  
              <Section style={itemCard}>
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
  
              <Heading style={sectionHeading}>Requester Details</Heading>
              <Section style={detailsCard}>
                <Row>
                  <Column width={100}>
                    <Text style={detailLabel}>Name:</Text>
                  </Column>
                  <Column>
                    <Text style={detailValue}>{requesterName}</Text>
                  </Column>
                </Row>
                <Row>
                  <Column width={100}>
                    <Text style={detailLabel}>Email:</Text>
                  </Column>
                  <Column>
                    <Link href={`mailto:${requesterEmail}`} style={emailLink}>
                      {requesterEmail}
                    </Link>
                  </Column>
                </Row>
              </Section>
  
              <Heading style={sectionHeading}>Message from {requesterName}</Heading>
              <Section style={messageCard}>
                <Text style={messageText}>
                  {message.split('\n').map((line, i) => (
                    <span key={i}>
                      {line}
                      <br />
                    </span>
                  ))}
                </Text>
              </Section>
  
              <Text style={paragraph}>
                Please respond to the requester directly to arrange pickup/delivery.
              </Text>
              <Link
                href={`mailto:${requesterEmail}?subject=Regarding your request for ${itemName}`}
                style={button}
              >
                Reply to {requesterName}
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
                This email was sent via ShareSphere. Do not reply to this email.
              </Text>
              <Text style={footerText}>© {currentYear} ShareSphere. All rights reserved.</Text>
            </Section>
          </Container>
        </Body>
      </Html>
    );
  };
  
