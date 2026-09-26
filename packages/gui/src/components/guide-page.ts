import m from 'mithril';
import { SlimdownView } from 'mithril-ui-form';
import guideSource from '../../../../documentation/handleiding.nl.md?raw';
import guideCaptions from '../../../../documentation/assets/user-guide/pax-handleiding.nl.vtt?url';
import guideVideo from '../../../../documentation/assets/user-guide/pax-handleiding.webm';
import homeScreenshot from '../../../../documentation/assets/user-guide/01-home.png';
import scriptScreenshot from '../../../../documentation/assets/user-guide/02-script-view.png';
import editorScreenshot from '../../../../documentation/assets/user-guide/03-script-edit.png';
import llmBriefScreenshot from '../../../../documentation/assets/user-guide/04-llm-brief.png';
import llmPromptScreenshot from '../../../../documentation/assets/user-guide/05-llm-prompt-dark.png';
import { Pages } from '../models';
import { type MeiosisComponent, t } from '../services';
import { routingSvc } from '../services/routing-service';

const VIDEO_MARKER = '<!-- PAX_GUIDE_VIDEO -->';

const guideAssets = new Map([
  ['assets/user-guide/01-home.png', homeScreenshot],
  ['assets/user-guide/02-script-view.png', scriptScreenshot],
  ['assets/user-guide/03-script-edit.png', editorScreenshot],
  ['assets/user-guide/04-llm-brief.png', llmBriefScreenshot],
  ['assets/user-guide/05-llm-prompt-dark.png', llmPromptScreenshot],
]);

const localizedGuide = [...guideAssets].reduce(
  (markdown, [path, url]) => markdown.split(path).join(url),
  guideSource
);
const [guideIntroduction, guideBody] = localizedGuide.split(VIDEO_MARKER);

const videoSteps = [
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
    end: 18,
    time: '0:12',
    title: 'De prompt controleren',
    description: 'Controleer en kopieer de prompt naar een LLM naar keuze.',
  },
];

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
    view: () =>
      m('article.guide-page', [
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
                m('source', { src: guideVideo, type: 'video/webm' }),
                m('track', {
                  default: true,
                  kind: 'captions',
                  src: guideCaptions,
                  srclang: 'nl',
                  label: 'Nederlands',
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
      ]),
  };
};
