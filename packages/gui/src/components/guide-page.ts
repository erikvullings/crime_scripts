import m from 'mithril';
import { SlimdownView } from 'mithril-ui-form';
import guideSourceNl from '../../../../documentation/handleiding.nl.md?raw';
import guideSourceEn from '../../../../documentation/user-guide.en.md?raw';
import guideCaptionsNl from '../../../../documentation/assets/user-guide/pax-handleiding.nl.vtt?url';
import guideCaptionsEn from '../../../../documentation/assets/user-guide/en/pax-user-guide.en.vtt?url';
import guideVideoNl from '../../../../documentation/assets/user-guide/pax-handleiding.webm';
import guideVideoEn from '../../../../documentation/assets/user-guide/en/pax-user-guide.webm';
import homeScreenshotNl from '../../../../documentation/assets/user-guide/01-home.png';
import scriptScreenshotNl from '../../../../documentation/assets/user-guide/02-script-view.png';
import editorScreenshotNl from '../../../../documentation/assets/user-guide/03-script-edit.png';
import llmBriefScreenshotNl from '../../../../documentation/assets/user-guide/04-llm-brief.png';
import llmPromptScreenshotNl from '../../../../documentation/assets/user-guide/05-llm-prompt-light.png';
import llmJsonScreenshotNl from '../../../../documentation/assets/user-guide/06-llm-json-paste.png';
import llmReviewScreenshotNl from '../../../../documentation/assets/user-guide/07-llm-review.png';
import homeScreenshotEn from '../../../../documentation/assets/user-guide/en/01-home.png';
import scriptScreenshotEn from '../../../../documentation/assets/user-guide/en/02-script-view.png';
import editorScreenshotEn from '../../../../documentation/assets/user-guide/en/03-script-edit.png';
import llmBriefScreenshotEn from '../../../../documentation/assets/user-guide/en/04-llm-brief.png';
import llmPromptScreenshotEn from '../../../../documentation/assets/user-guide/en/05-llm-prompt-light.png';
import llmJsonScreenshotEn from '../../../../documentation/assets/user-guide/en/06-llm-json-paste.png';
import llmReviewScreenshotEn from '../../../../documentation/assets/user-guide/en/07-llm-review.png';
import { Pages } from '../models';
import { i18n, type MeiosisComponent, t } from '../services';
import { routingSvc } from '../services/routing-service';

const VIDEO_MARKER = '<!-- PAX_GUIDE_VIDEO -->';

const localizeGuide = (source: string, assets: Map<string, string>) =>
  [...assets].reduce(
    (markdown, [path, url]) => markdown.split(path).join(url.split('_').join('%5F')),
    source
  ).split(VIDEO_MARKER);

const videoStepsNl = [
  {
    start: 0,
    end: 3,
    time: '0:00',
    title: 'Werkruimte openen',
    description: 'Laad de starterbibliotheek of kies een bestaand script.',
  },
  {
    start: 3,
    end: 6,
    time: '0:03',
    title: 'Een script bekijken',
    description: 'Bekijk scènes, modi operandi, activiteiten en rol-pillen.',
  },
  {
    start: 6,
    end: 9,
    time: '0:06',
    title: 'Een script bewerken',
    description: 'Wijzig scriptgegevens, scènes en activiteiten.',
  },
  {
    start: 9,
    end: 12,
    time: '0:09',
    title: 'De LLM-opdracht invullen',
    description: 'Beschrijf taal, onderwerp, regio, detailniveau en bronnen.',
  },
  {
    start: 12,
    end: 15,
    time: '0:12',
    title: 'De prompt controleren',
    description: 'Controleer en kopieer de prompt naar een LLM naar keuze.',
  },
  {
    start: 15,
    end: 18,
    time: '0:15',
    title: 'De JSON plakken',
    description: 'Plak uitsluitend het JSON-antwoord terug in PAX.',
  },
  {
    start: 18,
    end: 24,
    time: '0:18',
    title: 'Het resultaat controleren',
    description: 'Bekijk scènes, taxonomie en bronnen vóór de importbevestiging.',
  },
];

const videoStepsEn = [
  {
    start: 0,
    end: 3,
    time: '0:00',
    title: 'Open the workspace',
    description: 'Load the starter library or select an existing script.',
  },
  {
    start: 3,
    end: 6,
    time: '0:03',
    title: 'View a script',
    description: 'Explore scenes, modi operandi, activities, and role pills.',
  },
  {
    start: 6,
    end: 9,
    time: '0:06',
    title: 'Edit a script',
    description: 'Change script details, scenes, and activities.',
  },
  {
    start: 9,
    end: 12,
    time: '0:09',
    title: 'Complete the LLM brief',
    description: 'Describe the language, topic, region, detail level, and sources.',
  },
  {
    start: 12,
    end: 15,
    time: '0:12',
    title: 'Review the prompt',
    description: 'Check and copy the prompt to an LLM of your choice.',
  },
  {
    start: 15,
    end: 18,
    time: '0:15',
    title: 'Paste the JSON',
    description: 'Paste only the JSON response back into PAX.',
  },
  {
    start: 18,
    end: 24,
    time: '0:18',
    title: 'Review the result',
    description: 'Check scenes, taxonomy, and sources before confirming import.',
  },
];

const guides = {
  nl: {
    sections: localizeGuide(guideSourceNl, new Map([
      ['assets/user-guide/01-home.png', homeScreenshotNl],
      ['assets/user-guide/02-script-view.png', scriptScreenshotNl],
      ['assets/user-guide/03-script-edit.png', editorScreenshotNl],
      ['assets/user-guide/04-llm-brief.png', llmBriefScreenshotNl],
      ['assets/user-guide/05-llm-prompt-light.png', llmPromptScreenshotNl],
      ['assets/user-guide/06-llm-json-paste.png', llmJsonScreenshotNl],
      ['assets/user-guide/07-llm-review.png', llmReviewScreenshotNl],
    ])),
    captions: guideCaptionsNl,
    video: guideVideoNl,
    steps: videoStepsNl,
    captionLanguage: 'nl',
    captionLabel: 'Nederlands',
  },
  en: {
    sections: localizeGuide(guideSourceEn, new Map([
      ['assets/user-guide/en/01-home.png', homeScreenshotEn],
      ['assets/user-guide/en/02-script-view.png', scriptScreenshotEn],
      ['assets/user-guide/en/03-script-edit.png', editorScreenshotEn],
      ['assets/user-guide/en/04-llm-brief.png', llmBriefScreenshotEn],
      ['assets/user-guide/en/05-llm-prompt-light.png', llmPromptScreenshotEn],
      ['assets/user-guide/en/06-llm-json-paste.png', llmJsonScreenshotEn],
      ['assets/user-guide/en/07-llm-review.png', llmReviewScreenshotEn],
    ])),
    captions: guideCaptionsEn,
    video: guideVideoEn,
    steps: videoStepsEn,
    captionLanguage: 'en',
    captionLabel: 'English',
  },
};

export const GuidePage: MeiosisComponent = () => {
  let activeStep = 0;
  let videoElement: HTMLVideoElement | undefined;

  return {
    oninit: ({
      attrs: {
        actions: { setPage },
      },
    }) => {
      setPage(Pages.GUIDE);
    },
    view: () => {
      const guide = guides[i18n.currentLocale];
      const [guideIntroduction, guideBody] = guide.sections;
      const videoSteps = guide.steps;
      return m('article.guide-page', [
        m(
          'a.guide-back-link',
          { href: routingSvc.href(Pages.LANDING) },
          [
            m('i.material-icons[aria-hidden=true]', 'arrow_back'),
            m('span', t('GUIDE_BACK')),
          ]
        ),
        m('.guide-copy', m(SlimdownView, { md: guideIntroduction })),
        m('section.guide-walkthrough[aria-labelledby=guide-video-title]', [
          m('.guide-video-pane', [
            m(
              'video[controls][playsinline][preload=metadata][width=1440][height=900]',
              {
                'aria-label': t('LANDING_GUIDE_VIDEO_LABEL'),
                oncreate: ({ dom }) => {
                  videoElement = dom as HTMLVideoElement;
                },
                onremove: () => {
                  videoElement = undefined;
                },
                ontimeupdate: (event: Event) => {
                  const currentTime = (event.currentTarget as HTMLVideoElement).currentTime;
                  const nextStep = videoSteps.findIndex(({ start, end }) => currentTime >= start && currentTime < end);
                  if (nextStep >= 0 && nextStep !== activeStep) {
                    activeStep = nextStep;
                    m.redraw();
                  }
                },
              },
              [
                m('source', { src: guide.video, type: 'video/webm' }),
                m('track', {
                  default: true,
                  kind: 'captions',
                  src: guide.captions,
                  srclang: guide.captionLanguage,
                  label: guide.captionLabel,
                }),
              ]
            ),
            m('p.guide-video-caption', t('GUIDE_VIDEO_CAPTION')),
          ]),
          m('.guide-video-explanation', [
            m('h2#guide-video-title', t('GUIDE_VIDEO_TITLE')),
            m('p', t('GUIDE_VIDEO_DESCRIPTION')),
            m(
              'ol.guide-video-steps',
              videoSteps.map((step, index) =>
                m('li', { class: activeStep === index ? 'active' : '' }, [
                  m(
                    'button',
                    {
                      type: 'button',
                      'aria-current': activeStep === index ? 'step' : undefined,
                      onclick: () => {
                        if (videoElement) videoElement.currentTime = step.start;
                        activeStep = index;
                      },
                    },
                    [
                      m('span.guide-step-time', step.time),
                      m('span.guide-step-copy', [
                        m('strong', step.title),
                        m('span', step.description),
                      ]),
                    ]
                  ),
                ])
              )
            ),
          ]),
        ]),
        m('.guide-copy', m(SlimdownView, { md: guideBody })),
      ]);
    },
  };
};
