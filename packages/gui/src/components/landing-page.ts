import m from 'mithril';
import lz from 'lz-string';
import { Button, Icon, padLeft } from 'mithril-materialized';
import background from '../assets/background.jpg';
import { MeiosisComponent, routingSvc } from '../services';
import { DataModel, Pages } from '../models';
import { formatDate } from '../utils';

const readerAvailable = window.File && window.FileReader && window.FileList && window.Blob;

export const LandingPage: MeiosisComponent = () => {
  return {
    oninit: ({
      attrs: {
        actions: { setPage },
      },
    }) => {
      setPage(Pages.LANDING);
    },
    view: ({
      attrs: {
        state: { model },
        actions: { saveModel },
        // actions: { updateAccount, updateClientAccount },
      },
    }) => [
      m('.center', { style: 'position: relative;' }, [
        // m(
        //   '.overlay.center',
        //   {
        //     style: 'position: absolute; width: 100%',
        //   },
        //   [
        //     m('h3.indigo-text.text-darken-4.bold.hide-on-med-and-down', 'Introduction'),
        //   ]
        // ),
        m('img.responsive-img', { src: background }),
        m('.buttons.center', { style: 'margin: 10px auto;' }, [
          m(Button, {
            iconName: 'clear',
            className: 'btn-large',
            label: 'Clear',
            modalId: 'clearAll',
          }),
          // typeof model.version === "number" && m(
          // 	Button,
          // 	{
          // 		iconName: "edit",
          // 		className: "btn-large",
          // 		label: "Continue",
          // 		onclick: () => {
          // 			routingSvc.switchTo(Pages.OVERVIEW);
          // 		},
          // 	},
          // ),
          m('a#downloadAnchorElem', { style: 'display:none' }),
          m(Button, {
            iconName: 'download',
            className: 'btn-large',
            label: 'Download',
            onclick: () => {
              const dlAnchorElem = document.getElementById('downloadAnchorElem');
              if (!dlAnchorElem) {
                return;
              }
              const version = typeof model.version === 'undefined' ? 1 : model.version++;
              const dataStr =
                'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ ...model, version }, null, 2));
              dlAnchorElem.setAttribute('href', dataStr);
              dlAnchorElem.setAttribute('download', `${formatDate()}_v${padLeft(version, 3)}_crime_scene_scripts.json`);
              dlAnchorElem.click();
            },
          }),
          m('input#selectFiles[type=file]', { style: 'display:none' }),
          readerAvailable &&
            m(Button, {
              iconName: 'upload',
              className: 'btn-large',
              label: 'Upload',
              onclick: () => {
                const fileInput = document.getElementById('selectFiles') as HTMLInputElement;
                fileInput.onchange = () => {
                  if (!fileInput) {
                    return;
                  }
                  const files = fileInput.files;
                  if (files && files.length <= 0) {
                    return;
                  }
                  const reader = new FileReader();
                  reader.onload = (e: ProgressEvent<FileReader>) => {
                    const result =
                      e && e.target && e.target.result && (JSON.parse(e.target.result.toString()) as DataModel);
                    result && result.version && saveModel(result);
                  };
                  const data = files && files.item(0);
                  data && reader.readAsText(data);
                  routingSvc.switchTo(Pages.HOME);
                };
                fileInput.click();
              },
            }),
          m(Button, {
            iconName: 'link',
            className: 'btn-large',
            label: 'Permalink',
            onclick: () => {
              const permLink = document.createElement('input') as HTMLInputElement;
              document.body.appendChild(permLink);
              if (!permLink) {
                return;
              }
              const compressed = lz.compressToEncodedURIComponent(JSON.stringify(model));
              const url = `${window.location.href}${/\?/.test(window.location.href) ? '&' : '?'}model=${compressed}`;
              permLink.value = url;
              permLink.select();
              permLink.setSelectionRange(0, 999999); // For mobile devices
              try {
                const successful = document.execCommand('copy');
                if (successful) {
                  M.toast({
                    html: 'Copied permanent link to clipboard.',
                    classes: 'yellow black-text',
                  });
                }
              } catch (err) {
                M.toast({
                  html: 'Failed copying link to clipboard: ' + err,
                  classes: 'red',
                });
              } finally {
                document.body.removeChild(permLink);
              }
            },
          }),
        ]),
        m(
          '.section.white',
          m('.row.container.center', [
            m('.row', [
              m(
                '.col.s12.m4',
                m('.intro-block', [
                  m('.center', m(Icon, { iconName: 'handshake' })),
                  m('h5.center', 'TODO'),
                  m('p.light', 'TODO'),
                ])
              ),
              m(
                '.col.s12.m4',
                m('.intro-block', [
                  m('.center', m(Icon, { iconName: 'front_hand' })),
                  m('h5.center', 'TODO'),
                  m('p.light', `TODO`),
                ])
              ),
              m(
                '.col.s12.m4',
                m('.intro-block', [
                  m('.center', m(Icon, { iconName: 'map' })),
                  m('h5.center', 'TODO'),
                  m('p.light', 'TODO'),
                ])
              ),
            ]),
          ])
        ),
      ]),
    ],
  };
};
