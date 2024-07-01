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
            label: 'Download JSON',
            onclick: () => {
              const dlAnchorElem = document.getElementById('downloadAnchorElem');
              if (!dlAnchorElem) {
                return;
              }
              const version = typeof model.version === 'undefined' ? 1 : model.version++;
              const dataStr =
                'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ ...model, version }, null, 2));
              dlAnchorElem.setAttribute('href', dataStr);
              dlAnchorElem.setAttribute('download', `${formatDate()}_v${padLeft(version, 3)}_crime_scripts.json`);
              dlAnchorElem.click();
            },
          }),
          m(Button, {
            iconName: 'download',
            className: 'btn-large',
            label: 'Download Binary',
            onclick: () => {
              const dlBinaryAnchorElem = document.getElementById('downloadAnchorElem');
              if (!dlBinaryAnchorElem) {
                return;
              }
              const version = typeof model.version === 'undefined' ? 1 : model.version++;
              const binaryData = lz.compressToUint8Array(JSON.stringify({ ...model, version }));
              // const binaryData = new Uint8Array(compressedData.length);
              // for (let i = 0; i < compressedData.length; i++) {
              //   binaryData[i] = compressedData.charCodeAt(i);
              // }
              const blob = new Blob([binaryData], { type: 'application/octet-stream' });
              const url = URL.createObjectURL(blob);
              dlBinaryAnchorElem.setAttribute('href', url);
              dlBinaryAnchorElem.setAttribute('download', `${formatDate()}_v${padLeft(version, 3)}_crime_scripts.bin`);
              dlBinaryAnchorElem.click();
              URL.revokeObjectURL(url);
            },
          }),
          m('input#selectFiles[type=file][accept=.json]', { style: 'display:none' }),
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
          m('input#selectBinFiles[type=file][accept=.bin]', { style: 'display:none' }),
          readerAvailable &&
            m(Button, {
              iconName: 'upload',
              className: 'btn-large',
              label: 'Upload Binary File',
              onclick: () => {
                const fileInput = document.getElementById('selectBinFiles') as HTMLInputElement;
                fileInput.onchange = () => {
                  if (!fileInput || !fileInput.files || fileInput.files.length <= 0) {
                    return;
                  }

                  const reader = new FileReader();
                  reader.onload = (e: ProgressEvent<FileReader>) => {
                    if (e.target && e.target.result) {
                      const arrayBuffer = e.target.result as ArrayBuffer;
                      const uint8Array = new Uint8Array(arrayBuffer);
                      const decompressedString = lz.decompressFromUint8Array(uint8Array);
                      console.log(decompressedString);
                      try {
                        const result = JSON.parse(decompressedString) as DataModel;
                        if (result && result.version) {
                          saveModel(result);
                          routingSvc.switchTo(Pages.HOME);
                        } else {
                          console.error('Invalid file format');
                        }
                      } catch (error) {
                        console.error('Error parsing file:', error);
                      }
                    }
                  };

                  reader.readAsArrayBuffer(fileInput.files[0]);
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
