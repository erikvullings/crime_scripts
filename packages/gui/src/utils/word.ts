import {
  AlignmentType,
  Document,
  ExternalHyperlink,
  HeadingLevel,
  LevelFormat,
  Packer,
  Paragraph,
  TextRun,
  convertInchesToTwip,
} from 'docx';
import { saveAs } from 'file-saver';
import { ActivityType, CrimeScript, DataModel } from '../models';
import { t } from '../services';
import { addLeadingSpaces } from '.';

const blue = '2F5496';

export const toWord = async (filename: string, cs: Partial<CrimeScript>, model: DataModel) => {
  const { label: title, description, stages = [], literature } = cs;
  const { acts, cast, attributes } = model;

  const toMarkdown = () => {
    const phaseNames = [t('PREPARATION_PHASE'), t('PRE_ACTIVITY_PHASE'), t('ACTIVITY_PHASE'), t('POST_ACTIVITY_PHASE')];
    const md: string[] = [];
    if (description) {
      md.push(`# ${t('INTRODUCTION')}\n`);
      md.push(description);
    }
    stages.forEach((stage, i) => {
      const stageActs = stage.ids.map((id) => acts.find((a) => a.id === id)).filter((a) => typeof a !== 'undefined');
      md.push(`# ${t('STAGE')} ${i + 1}: ${stageActs.map((a) => a.label).join(' | ')}\n`);
      stageActs.forEach((act) => {
        md.push(`\n## ${act.label}\n`);
        act.description && md.push(act.description);
        [act.preparation, act.preactivity, act.activity, act.postactivity].forEach((a, i) => {
          if (a && ((a.activities && a.activities.length > 0) || (a.conditions && a.conditions.length > 0))) {
            md.push(`\n### ${phaseNames[i]}\n`);
            if (a.activities && a.activities.length > 0) {
              md.push(`#### ${t('ACTIVITIES')}\n`);
              const activitiesTxt = a.activities.reduce((list, activity, idx) => {
                list.push(`${idx + 1}. ${activity.label}`);
                const type = activity.type
                  ? Array.isArray(activity.type)
                    ? activity.type
                    : [activity.type]
                  : undefined;
                if (type && type.includes(ActivityType.HAS_CAST)) {
                  const castNames = activity.cast.map((c) => {
                    const found = cast.find((cast) => cast.id === c);
                    return found ? found.label : c;
                  });
                  list.push(addLeadingSpaces(`${t('CAST')}: ${castNames.join(',')}`, idx < 9 ? 3 : 4));
                }
                if (type && type.includes(ActivityType.HAS_ATTRIBUTES)) {
                  const attrNames = activity.attributes.map((c) => {
                    const found = attributes.find((attr) => attr.id === c);
                    return found ? found.label : c;
                  });
                  list.push(addLeadingSpaces(`${t('CAST')}: ${attrNames.join(',')}`, idx < 9 ? 3 : 4));
                }
                return list;
              }, [] as string[]);
              md.push(...activitiesTxt);
            }

            if (a.conditions && a.conditions.length > 0) {
              md.push(`\n#### ${t('CONDITIONS')}\n`);
              const conditionsTxt = a.conditions.reduce((list, condition, idx) => {
                list.push(`${idx + 1}. ${condition.label}`);
                return list;
              }, [] as string[]);
              md.push(...conditionsTxt);
            }
          }
        });
      });
    });
    if (literature) {
      md.push(`\n# ${t('REFERENCES')}\n`);
      literature.forEach((l, i) => {
        const title = l.url ? `[${l.label}](l.url)` : l.label;
        md.push(`${i + 1}. ${title} (${l.authors || ''})`);
        l.description && md.push(addLeadingSpaces(l.description, i < 9 ? 3 : 4));
      });
    }
    return md.join('\n');
  };

  const markdown = toMarkdown();

  console.log(markdown);

  const doc = new Document({
    creator: 'TNO',
    title,
    description,
    styles: {
      default: {
        document: {
          run: {
            font: 'Arial',
            color: '000000',
            language: {
              value: 'en-UK',
            },
          },
        },
      },
      paragraphStyles: [
        {
          id: 'Heading1',
          name: 'Heading 1',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: {
            color: blue,
            size: `18pt`,
            bold: true,
          },
          paragraph: {
            spacing: {
              before: 240,
              after: 120,
            },
          },
        },
        {
          id: 'Heading2',
          name: 'Heading 2',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: {
            color: blue,
            size: `16pt`,
            bold: true,
          },
          paragraph: {
            spacing: {
              before: 240,
              after: 120,
            },
          },
        },
        {
          id: 'Heading3',
          name: 'Heading 3',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: {
            color: blue,
            size: `14pt`,
            bold: true,
          },
          paragraph: {
            spacing: {
              before: 240,
              after: 120,
            },
          },
        },
        {
          id: 'Heading4',
          name: 'Heading 4',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: {
            color: blue,
            size: `12pt`,
            bold: true,
          },
          paragraph: {
            spacing: {
              before: 240,
              after: 120,
            },
          },
        },
        {
          id: 'Heading5',
          name: 'Heading 5',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: {
            color: blue,
            // size: `12pt`,
            bold: true,
          },
          paragraph: {
            spacing: {
              before: 120,
              after: 60,
            },
          },
        },
        {
          id: 'Heading6',
          name: 'Heading 6',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: {
            // color: blue,
            // size: `12pt`,
            bold: true,
          },
          paragraph: {
            spacing: {
              before: 120,
              after: 60,
            },
          },
        },
        {
          id: 'aside',
          name: 'Aside',
          basedOn: 'Normal',
          next: 'Normal',
          run: {
            color: '999999',
            italics: true,
          },
          paragraph: {
            indent: {
              left: 720,
            },
            spacing: {
              line: 276,
            },
          },
        },
        {
          id: 'wellSpaced',
          name: 'Well Spaced',
          basedOn: 'Normal',
          quickFormat: true,
          paragraph: {
            spacing: { line: 276, before: 20 * 72 * 0.1, after: 20 * 72 * 0.05 },
          },
        },
        {
          id: 'ListParagraph',
          name: 'List Paragraph',
          basedOn: 'Normal',
          quickFormat: true,
        },
      ],
    },
    numbering: {
      config: [
        {
          levels: [
            {
              level: 0,
              format: LevelFormat.DECIMAL,
              text: '%1',
              alignment: AlignmentType.START,
              style: {
                paragraph: {
                  indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.18) },
                },
              },
            },
          ],
          reference: 'my-numbering-reference',
        },
      ],
    },
    sections: [
      {
        children: [
          new Paragraph({
            text: title,
            heading: HeadingLevel.TITLE,
          }),
          ...convertMarkdownToDocxParagraphs(markdown),
        ],
      },
    ],
  });

  Packer.toBlob(doc).then((blob) => {
    // saveAs from FileSaver will download the blob
    saveAs(blob, filename);
  });
};

const convertMarkdownToDocxParagraphs = (markdown?: string): Paragraph[] => {
  if (!markdown) return [];
  const lines = markdown.split('\n');
  const paragraphs: Paragraph[] = [];
  let listCounter = 0;
  let currentListInstance: number | null = null;

  const parseFormattedText = (text: string): (TextRun | ExternalHyperlink)[] => {
    const parts: (TextRun | ExternalHyperlink)[] = [];
    let currentText = '';
    let isBold = false;
    let isItalic = false;
    let isUnderline = false;
    let isStrikethrough = false;

    const pushCurrentText = () => {
      if (currentText) {
        parts.push(
          new TextRun({
            text: currentText,
            bold: isBold,
            italics: isItalic,
            underline: isUnderline ? { color: 'red', type: 'dash' } : undefined,
            strike: isStrikethrough,
          })
        );
        currentText = '';
      }
    };

    for (let i = 0; i < text.length; i++) {
      if (text[i] === '*' || text[i] === '_') {
        if (i + 2 < text.length && text[i + 1] === text[i] && text[i + 2] === text[i]) {
          // Bold italic
          pushCurrentText();
          isBold = !isBold;
          isItalic = !isItalic;
          i += 2;
        } else if (text[i + 1] === text[i]) {
          // Bold
          pushCurrentText();
          isBold = !isBold;
          i++;
        } else {
          // Italic
          pushCurrentText();
          isItalic = !isItalic;
        }
      } else if (text[i] === '~' && text[i + 1] === '~') {
        pushCurrentText();
        isStrikethrough = !isStrikethrough;
        i++;
      } else if (text[i] === '[') {
        const closeBracket = text.indexOf(']', i);
        const openParen = text.indexOf('(', closeBracket);
        const closeParen = text.indexOf(')', openParen);

        if (closeBracket !== -1 && openParen !== -1 && closeParen !== -1) {
          pushCurrentText();
          const linkText = text.slice(i + 1, closeBracket);
          const linkUrl = text.slice(openParen + 1, closeParen);
          parts.push(
            new ExternalHyperlink({
              children: [new TextRun({ text: linkText, style: 'Hyperlink' })],
              link: linkUrl,
            })
          );
          i = closeParen;
        } else {
          currentText += text[i];
        }
      } else {
        currentText += text[i];
      }
    }

    pushCurrentText();
    return parts;
  };

  let currentParagraphLines: string[] = [];

  const createParagraph = (lines: string[]) => {
    if (lines.length === 0) return;

    const processLine = (line: string): Paragraph => {
      line = line.trim();
      if (line.startsWith('# ')) {
        currentListInstance = null;
        return new Paragraph({
          children: parseFormattedText(line.substring(2)),
          heading: HeadingLevel.HEADING_1,
        });
      } else if (line.startsWith('## ')) {
        currentListInstance = null;
        return new Paragraph({
          children: parseFormattedText(line.substring(3)),
          heading: HeadingLevel.HEADING_2,
        });
      } else if (line.startsWith('### ')) {
        currentListInstance = null;
        return new Paragraph({
          children: parseFormattedText(line.substring(4)),
          heading: HeadingLevel.HEADING_3,
        });
      } else if (line.startsWith('#### ')) {
        currentListInstance = null;
        return new Paragraph({
          children: parseFormattedText(line.substring(5)),
          heading: HeadingLevel.HEADING_4,
        });
      } else if (line.startsWith('- ')) {
        currentListInstance = null;
        return new Paragraph({
          children: parseFormattedText(line.substring(2)),
          bullet: {
            level: 0,
          },
        });
      } else if (line.match(/^\d+\. /)) {
        if (currentListInstance === null) {
          listCounter++;
          currentListInstance = listCounter;
        }
        return new Paragraph({
          children: parseFormattedText(line.replace(/^\d+\.\s/, '')),
          numbering: {
            reference: 'my-numbering-reference',
            level: 0,
            instance: currentListInstance,
          },
        });
      } else {
        currentListInstance = null;
        return new Paragraph({
          children: parseFormattedText(line),
        });
      }
    };

    if (lines[0].trim().startsWith('- ') || lines[0].trim().match(/^\d+\. /)) {
      // Handle bullet points or ordered list
      lines.forEach((line) => {
        if (line.trim() !== '') {
          paragraphs.push(processLine(line));
        }
      });
    } else {
      // Handle regular paragraphs and headings
      const text = lines.join(' ');
      paragraphs.push(processLine(text));
    }
  };

  for (const line of lines) {
    if (line.trim() === '') {
      createParagraph(currentParagraphLines);
      currentParagraphLines = [];
    } else {
      currentParagraphLines.push(line);
    }
  }

  // Create the last paragraph if there are any remaining lines
  createParagraph(currentParagraphLines);

  return paragraphs;
};
