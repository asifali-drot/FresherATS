import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { Style } from '@react-pdf/types';
import { ParsedSection } from './resumeUtils';
import type { ResumeTemplateId } from './templates';

function getTemplateStyles(templateId: ResumeTemplateId) {
  const template = templateId ?? 'professional';

  const vars =
    template === 'minimal'
      ? {
        padding: 30,
        fontSize: 10,
        primaryColor: '#0f172a',
        accentColor: '#334155',
        nameFontSize: 22,
        sectionTitleFontSize: 11,
        sectionTitleBorderColor: '#cbd5e1',
      }
      : template === 'program-manager'
        ? {
          padding: 40,
          fontSize: 11,
          primaryColor: '#064e3b',
          accentColor: '#059669',
          nameFontSize: 26,
          sectionTitleFontSize: 13,
          sectionTitleBorderColor: '#064e3b',
        }
        : {
          padding: 40,
          fontSize: 10,
          primaryColor: '#0f172a',
          accentColor: '#2563eb',
          nameFontSize: 24,
          sectionTitleFontSize: 12,
          sectionTitleBorderColor: '#e2e8f0',
        };

  return StyleSheet.create({
    page: {
      padding: vars.padding,
      fontFamily: 'Helvetica',
      fontSize: vars.fontSize,
      color: '#1e293b',
      lineHeight: 1.5,
    },
    header: {
      marginBottom: 20,
      textAlign: 'center',
      borderBottomWidth: 2,
      borderBottomColor: vars.primaryColor,
      paddingBottom: 15,
    },
    name: {
      fontSize: vars.nameFontSize,
      fontFamily: 'Helvetica-Bold',
      color: vars.primaryColor,
      marginBottom: 8,
      textTransform: 'uppercase',
    },
    contactContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      flexWrap: 'wrap',
    },
    contactItem: {
      fontSize: 9,
      color: '#475569',
    },
    separator: {
      marginHorizontal: 6,
      color: '#e2e8f0',
    },
    section: {
      marginBottom: vars.fontSize <= 10 ? 14 : 15,
    },
    sectionTitle: {
      fontSize: vars.sectionTitleFontSize,
      fontFamily: 'Helvetica-Bold',
      color: vars.primaryColor,
      textTransform: 'uppercase',
      borderBottomWidth: 1,
      borderBottomColor: vars.sectionTitleBorderColor,
      paddingBottom: 4,
      marginBottom: 8,
    },
    paragraph: {
      marginBottom: 6,
      textAlign: 'justify',
    },
    bulletContainer: {
      flexDirection: 'row',
      marginBottom: 4,
      alignItems: 'flex-start',
    },
    bullet: {
      width: 12,
      fontSize: vars.fontSize,
      fontFamily: 'Helvetica',
    },
    bulletText: {
      flex: 1,
      textAlign: 'justify',
    },
    skillsChips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 4,
    },
    skillChip: {
      fontSize: 9,
      fontFamily: 'Helvetica',
      color: vars.accentColor,
      backgroundColor: '#eff6ff',
      borderWidth: 1,
      borderColor: '#dbeafe',
      borderRadius: 4,
      paddingHorizontal: 8,
      paddingVertical: 3,
      marginRight: 5,
      marginBottom: 5,
    },
  });
}

interface ResumePdfDocumentProps {
  nameLines: string[];
  sections: ParsedSection[];
  templateId?: ResumeTemplateId;
}

const renderRichText = (
  text: string,
  style: Style | Style[] | undefined
) => {
  // Tokenize inline markdown: **bold**, _italic_, __underline__, ==highlight==
  // Using non-greedy .*? so multiple spans on the same line are handled correctly
  const TOKEN_RE = /(\*\*.*?\*\*|__.*?__|_.*?_|==.*?==)/g;
  const parts: string[] = [];
  let lastIndex = 0;
  let m: RegExpExecArray | null;

  while ((m = TOKEN_RE.exec(text)) !== null) {
    if (m.index > lastIndex) parts.push(text.slice(lastIndex, m.index));
    parts.push(m[0]);
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));

  return (
    <Text style={style}>
      {parts.map((part, index) => {
        if (!part) return null;

        // Bold: **text**
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
          return (
            <Text key={index} style={{ fontFamily: 'Helvetica-Bold' }}>
              {part.slice(2, -2)}
            </Text>
          );
        }
        // Underline: __text__ (must check before italic _)
        if (part.startsWith('__') && part.endsWith('__') && part.length > 4) {
          return (
            <Text key={index} style={{ textDecoration: 'underline' }}>
              {part.slice(2, -2)}
            </Text>
          );
        }
        // Italic: _text_
        if (part.startsWith('_') && part.endsWith('_') && part.length > 2) {
          return (
            <Text key={index} style={{ fontStyle: 'italic' }}>
              {part.slice(1, -1)}
            </Text>
          );
        }
        // Highlight: ==text==
        if (part.startsWith('==') && part.endsWith('==') && part.length > 4) {
          return (
            <Text key={index} style={{ backgroundColor: '#fef9c3' }}>
              {part.slice(2, -2)}
            </Text>
          );
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </Text>
  );
};

export const ResumePdfDocument: React.FC<ResumePdfDocumentProps> = ({
  nameLines,
  sections,
  templateId,
}) => {
  const styles = getTemplateStyles(templateId ?? 'professional');
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {nameLines.length > 0 && (
          <View style={styles.header}>
            <Text style={styles.name}>{nameLines[0]}</Text>
            {nameLines.length > 1 && (
              <View style={styles.contactContainer}>
                {nameLines.slice(1).map((line, index, array) => (
                  <React.Fragment key={index}>
                    <Text style={styles.contactItem}>{line}</Text>
                    {index < array.length - 1 && <Text style={styles.separator}>•</Text>}
                  </React.Fragment>
                ))}
              </View>
            )}
          </View>
        )}

        {sections.map((section, sIndex) => (
          <View key={sIndex} style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View>
              {section.title === 'SKILLS' ? (
                <View style={styles.skillsChips}>
                  {section.content
                    .map(line => line.replace(/^[\*•\-]\s*/, '').trim())
                    .filter(Boolean)
                    .map((skill, lIndex) => (
                      <Text key={lIndex} style={styles.skillChip}>{skill}</Text>
                    ))}
                </View>
              ) : (
                section.content.map((line, lIndex) => {
                  const processedLine = line;

                  if (processedLine.startsWith('*') || processedLine.startsWith('•') || processedLine.startsWith('-')) {
                    const pureLine = processedLine.replace(/^[\*•\-]\s*/, '');
                    return (
                      <View key={lIndex} style={styles.bulletContainer}>
                        <Text style={styles.bullet}>•</Text>
                        {renderRichText(pureLine, styles.bulletText)}
                      </View>
                    );
                  }
                  return (
                    <React.Fragment key={lIndex}>
                      {renderRichText(processedLine, styles.paragraph)}
                    </React.Fragment>
                  );
<<<<<<< HEAD
                })
=======
                }
                return (
                  <React.Fragment key={lIndex}>
                    {renderRichText(processedLine, styles.paragraph)}
                  </React.Fragment>
                );
              })
>>>>>>> a8d902ab7b0bbadbb83948244d41b868a192d432
              )}
            </View>
          </View>
        ))}
      </Page>
    </Document>
  );
};
