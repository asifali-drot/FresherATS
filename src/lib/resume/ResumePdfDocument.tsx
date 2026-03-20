import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { ParsedSection } from './resumeUtils';

// Register fonts if needed, for now standard ones are good enough.
// We'll use Times-Roman/Helvetica which are built-in, or we could register Inter.

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1e293b',
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#0f172a',
    paddingBottom: 15,
  },
  name: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
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
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    textTransform: 'uppercase',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
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
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  bulletText: {
    flex: 1,
    textAlign: 'justify',
  }
});

interface ResumePdfDocumentProps {
  nameLines: string[];
  sections: ParsedSection[];
}

const renderRichText = (text: string, style: any) => {
  const parts = text.split(/(\*\*.*?\*\*|__.*?__|==.*?==)/g);
  return (
    <Text style={style}>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <Text key={index} style={{ fontFamily: 'Helvetica-Bold' }}>
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

export const ResumePdfDocument: React.FC<ResumePdfDocumentProps> = ({ nameLines, sections }) => {
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
              {section.content.map((line, lIndex) => {
                let processedLine = line;
                if (section.title === 'SKILLS') {
                  // Remove common labels and specific words (including AI-tools)
                  let cleanLine = line.replace(/^(frontend|backend|skills|technical skills|tools|languages|ai-tools|ai tools):\s*/i, '')
                                       .replace(/(frontend|backend|pipeline|ai-tools|ai tools|\|)/gi, '');
                  
                  // If it still has a label-like structure (text followed by colon), remove it
                  if (cleanLine.includes(':')) {
                    cleanLine = cleanLine.split(':').slice(1).join(':').trim();
                  }

                  // Split by comma or any existing pipes, trim, and wrap in __ for PDF underline
                  const skills = cleanLine.split(/[,,|]/).map(s => s.trim()).filter(Boolean);
                  processedLine = skills.map(skill => `__${skill}__`).join('    ');
                }

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
              })}
            </View>
          </View>
        ))}
      </Page>
    </Document>
  );
};
