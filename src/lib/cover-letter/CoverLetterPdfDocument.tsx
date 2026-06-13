import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import type { Style } from '@react-pdf/types';
import { ParsedCoverLetter } from './utils';
import { getCoverLetterTemplateById, type CoverLetterTemplateId } from './templates';

function getTemplateStyles(templateId: CoverLetterTemplateId) {
  const template = getCoverLetterTemplateById(templateId);

  let vars = {
    padding: 40,
    fontSize: 10.5,
    fontFamily: 'Helvetica',
    primaryColor: '#1e3a8a',
    accentColor: '#3b82f6',
    nameFontSize: 24,
    lineHeight: 1.5,
  };

  if (templateId === 'minimalist') {
    vars = {
      padding: 45,
      fontSize: 10,
      fontFamily: 'Helvetica',
      primaryColor: '#18181b',
      accentColor: '#71717a',
      nameFontSize: 20,
      lineHeight: 1.4,
    };
  } else if (templateId === 'creative') {
    vars = {
      padding: 40,
      fontSize: 10.5,
      fontFamily: 'Helvetica',
      primaryColor: '#0d9488',
      accentColor: '#0f766e',
      nameFontSize: 22,
      lineHeight: 1.55,
    };
  } else if (templateId === 'modern-avatar') {
    vars = {
      padding: 40,
      fontSize: 10.5,
      fontFamily: 'Helvetica',
      primaryColor: '#4f46e5',
      accentColor: '#6366f1',
      nameFontSize: 22,
      lineHeight: 1.5,
    };
  } else {
    // professional
    vars = {
      padding: 40,
      fontSize: 10.5,
      fontFamily: 'Times-Roman',
      primaryColor: '#1e3a8a',
      accentColor: '#3b82f6',
      nameFontSize: 24,
      lineHeight: 1.5,
    };
  }

  return StyleSheet.create({
    page: {
      padding: vars.padding,
      fontFamily: vars.fontFamily,
      fontSize: vars.fontSize,
      color: '#1e293b',
      lineHeight: vars.lineHeight,
    },
    creativeContainer: {
      borderLeftWidth: templateId === 'creative' ? 3 : 0,
      borderLeftColor: vars.primaryColor,
      paddingLeft: templateId === 'creative' ? 18 : 0,
      height: '100%',
    },
    header: {
      marginBottom: 30,
      textAlign: templateId === 'professional' ? 'center' : 'left',
      flexDirection: templateId === 'modern-avatar' ? 'row' : 'column',
      justifyContent: templateId === 'modern-avatar' ? 'space-between' : 'flex-start',
      alignItems: templateId === 'modern-avatar' ? 'center' : 'stretch',
      borderBottomWidth: templateId === 'professional' || templateId === 'minimalist' || templateId === 'modern-avatar' ? 1.5 : 0,
      borderBottomColor: templateId === 'professional' || templateId === 'modern-avatar' ? vars.primaryColor : '#e4e4e7',
      paddingBottom: 15,
    },
    senderInfo: {
      flex: 1,
    },
    avatarContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      borderWidth: 1.5,
      borderColor: vars.primaryColor,
      overflow: 'hidden',
      marginLeft: 15,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f3f4f6',
    },
    avatarImage: {
      width: '100%',
      height: '100%',
    },
    avatarPlaceholder: {
      fontSize: 18,
      fontFamily: 'Helvetica-Bold',
      color: vars.primaryColor,
    },
    name: {
      fontSize: vars.nameFontSize,
      fontFamily: vars.fontFamily === 'Times-Roman' ? 'Times-Bold' : 'Helvetica-Bold',
      color: vars.primaryColor,
      marginBottom: 6,
      textTransform: templateId === 'professional' || templateId === 'creative' || templateId === 'modern-avatar' ? 'uppercase' : 'none',
    },
    contactContainer: {
      flexDirection: 'row',
      justifyContent: templateId === 'professional' ? 'center' : 'flex-start',
      flexWrap: 'wrap',
    },
    contactItem: {
      fontSize: 9,
      color: '#475569',
    },
    separator: {
      marginHorizontal: 6,
      color: '#cbd5e1',
    },
    dateBlock: {
      fontSize: 9.5,
      color: templateId === 'creative' ? vars.accentColor : '#475569',
      marginBottom: 20,
      fontFamily: templateId === 'creative' ? 'Helvetica-Bold' : vars.fontFamily,
    },
    recipientContainer: {
      marginBottom: 20,
      padding: templateId === 'creative' ? 10 : 0,
      backgroundColor: templateId === 'creative' ? '#f0fdfa' : 'transparent',
      ...(templateId === 'creative' ? { borderRadius: 6 } : {}),
      width: templateId === 'creative' ? '70%' : '100%',
    },
    recipientLine: {
      fontSize: 9.5,
      color: '#334155',
      marginBottom: 2,
    },
    salutation: {
      fontSize: 10.5,
      fontFamily: vars.fontFamily === 'Times-Roman' ? 'Times-Bold' : 'Helvetica-Bold',
      color: templateId === 'creative' ? vars.primaryColor : '#1e293b',
      marginBottom: 15,
    },
    paragraph: {
      marginBottom: 12,
      textAlign: 'justify',
    },
    signOffBlock: {
      marginTop: 30,
    },
    signOff: {
      marginBottom: 35,
    },
    signature: {
      fontFamily: vars.fontFamily === 'Times-Roman' ? 'Times-Bold' : 'Helvetica-Bold',
      color: vars.primaryColor,
    },
  });
}

const renderRichText = (
  text: string,
  style: Style | Style[] | undefined
) => {
  const parts = text.split(/(\*\*.*?\*\*|__.*?__|==.*?==)/g);
  return (
    <Text style={style}>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          const isSerif = style && (style as any).fontFamily === 'Times-Roman';
          return (
            <Text key={index} style={{ fontFamily: isSerif ? 'Times-Bold' : 'Helvetica-Bold' }}>
              {part.slice(2, -2)}
            </Text>
          );
        }
        if (part.startsWith('__') && part.endsWith('__')) {
          return (
            <Text key={index} style={{ textDecoration: 'underline' }}>
              {part.slice(2, -2)}
            </Text>
          );
        }
        if (part.startsWith('==') && part.endsWith('==')) {
          return (
            <Text key={index} style={{ backgroundColor: '#fef9c3' }}>
              {part.slice(2, -2)}
            </Text>
          );
        }
        return part;
      })}
    </Text>
  );
};

interface CoverLetterPdfDocumentProps {
  data: ParsedCoverLetter;
  templateId: CoverLetterTemplateId;
  avatarUrl?: string;
}

export const CoverLetterPdfDocument: React.FC<CoverLetterPdfDocumentProps> = ({
  data,
  templateId,
  avatarUrl,
}) => {
  const styles = getTemplateStyles(templateId);
  const isProfessional = templateId === 'professional';
  const isModernAvatar = templateId === 'modern-avatar';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.creativeContainer}>
          {/* Header Section */}
          {data.senderLines.length > 0 && (
            <View style={styles.header}>
              <View style={isModernAvatar ? styles.senderInfo : undefined}>
                <Text style={styles.name}>{data.senderLines[0]}</Text>
                {data.senderLines.length > 1 && (
                  <View style={styles.contactContainer}>
                    {data.senderLines.slice(1).map((line, index, array) => (
                      <React.Fragment key={index}>
                        <Text style={styles.contactItem}>{line}</Text>
                        {index < array.length - 1 && (
                          <Text style={styles.separator}>{isProfessional ? '•' : '  '}</Text>
                        )}
                      </React.Fragment>
                    ))}
                  </View>
                )}
              </View>
              {isModernAvatar && (
                <View style={styles.avatarContainer}>
                  {avatarUrl ? (
                    <Image src={avatarUrl} style={styles.avatarImage} />
                  ) : (
                    <Image
                      src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='%23e5e7eb' width='200' height='200'/%3E%3Ccircle cx='100' cy='60' r='35' fill='%239ca3af'/%3E%3Cpath d='M 50 180 Q 50 140 100 140 Q 150 140 150 180' fill='%239ca3af'/%3E%3C/svg%3E"
                      style={styles.avatarImage}
                    />
                  )}
                </View>
              )}
            </View>
          )}

          {/* Date Block */}
          <Text style={styles.dateBlock}>{data.date}</Text>

          {/* Recipient Container */}
          {data.recipientLines.length > 0 && (
            <View style={styles.recipientContainer}>
              {data.recipientLines.map((line, idx) => (
                <Text key={idx} style={styles.recipientLine}>{line}</Text>
              ))}
            </View>
          )}

          {/* Salutation */}
          <Text style={styles.salutation}>{data.salutation}</Text>

          {/* Body Paragraphs */}
          <View>
            {data.bodyParagraphs.map((para, idx) => (
              <React.Fragment key={idx}>
                {renderRichText(para, styles.paragraph)}
              </React.Fragment>
            ))}
          </View>

          {/* Sign off & Signature */}
          <View style={styles.signOffBlock} wrap={false}>
            <Text style={styles.signOff}>{data.signOff}</Text>
            <Text style={styles.signature}>{data.signatureName}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};
