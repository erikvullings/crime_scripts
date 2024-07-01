import m, { FactoryComponent } from 'mithril';
import { MeiosisComponent, routingSvc } from '../../services';
import { FlatButton, padLeft } from 'mithril-materialized';
import { DataModel, Pages } from '../../models';
import { formatDate } from '../../utils';
import { compressToEncodedURIComponent, compressToUint8Array, decompressFromUint8Array } from 'lz-string';

export const SideNav: MeiosisComponent = () => {
  const handleFileUpload = (binary: boolean, saveModel: (model: DataModel) => void) => (e: Event) => {
    const fileInput = e.target as HTMLInputElement;
    if (!fileInput.files || fileInput.files.length <= 0) return;

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target && e.target.result) {
        let result: DataModel;
        if (binary) {
          const arrayBuffer = e.target.result as ArrayBuffer;
          const uint8Array = new Uint8Array(arrayBuffer);
          const decompressedString = decompressFromUint8Array(uint8Array);
          result = JSON.parse(decompressedString) as DataModel;
        } else {
          result = JSON.parse(e.target.result.toString()) as DataModel;
        }
        if (result && result.version) {
          saveModel(result);
          routingSvc.switchTo(Pages.HOME);
        } else {
          console.error('Invalid file format');
        }
      }
    };

    if (binary) {
      reader.readAsArrayBuffer(fileInput.files[0]);
    } else {
      reader.readAsText(fileInput.files[0]);
    }
  };

  const handleSelection = (option: string, model: DataModel, saveModel: (model: DataModel) => void) => {
    switch (option) {
      case 'clear':
        // Implement clear functionality
        break;
      case 'download_json': {
        const version = typeof model.version === 'undefined' ? 1 : model.version++;
        const dataStr =
          'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ ...model, version }, null, 2));
        const dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute('href', dataStr);
        dlAnchorElem.setAttribute('download', `${formatDate()}_v${padLeft(version, 3)}_crime_scripts.json`);
        dlAnchorElem.click();
        break;
      }
      case 'download_bin': {
        const version = typeof model.version === 'undefined' ? 1 : model.version++;
        const binaryData = compressToUint8Array(JSON.stringify({ ...model, version }));
        const blob = new Blob([binaryData], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute('href', url);
        dlAnchorElem.setAttribute('download', `${formatDate()}_v${padLeft(version, 3)}_crime_scripts.bin`);
        dlAnchorElem.click();
        URL.revokeObjectURL(url);
        break;
      }
      case 'upload_json': {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        fileInput.onchange = handleFileUpload(false, saveModel);
        fileInput.click();
        break;
      }
      case 'upload_bin': {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.bin';
        fileInput.onchange = handleFileUpload(true, saveModel);
        fileInput.click();
        break;
      }
      case 'link': {
        const compressed = compressToEncodedURIComponent(JSON.stringify(model));
        const url = `${window.location.href}${/\?/.test(window.location.href) ? '&' : '?'}model=${compressed}`;
        navigator.clipboard.writeText(url).then(
          () => {
            M.toast({
              html: 'Copied permanent link to clipboard.',
              classes: 'yellow black-text',
            });
          },
          (err) => {
            M.toast({
              html: 'Failed copying link to clipboard: ' + err,
              classes: 'red',
            });
          }
        );
        break;
      }
    }
  };

  return {
    view: ({
      attrs: {
        state: { model },
        actions: { saveModel },
      },
    }) =>
      m(
        'ul#slide-out.sidenav',
        {
          oncreate: ({ dom }) => {
            M.Sidenav.init(dom);
          },
        },
        [
          m(
            'li',
            m(FlatButton, { label: 'Clear', onclick: handleSelection('clear', model, saveModel), iconName: 'clear' })
          ),
          m(
            'li',
            m(FlatButton, {
              label: 'Download JSON',
              onclick: () => handleSelection('download_json', model, saveModel),
              iconName: 'download',
            })
          ),
          m(
            'li',
            m(FlatButton, {
              label: 'Download Binary',
              onclick: () => handleSelection('download_bin', model, saveModel),
              iconName: 'download',
            })
          ),
          m(
            'li',
            m(FlatButton, {
              label: 'Upload JSON',
              onclick: () => handleSelection('upload_json', model, saveModel),
              iconName: 'upload',
            })
          ),
          m(
            'li',
            m(FlatButton, {
              label: 'Upload Binary',
              onclick: () => handleSelection('upload_bin', model, saveModel),
              iconName: 'upload',
            })
          ),
          m(
            'li',
            m(FlatButton, {
              label: 'Permalink',
              onclick: () => handleSelection('link', model, saveModel),
              iconName: 'link',
            })
          ),
        ]
      ),
  };
};

export const SideNavTrigger: FactoryComponent<{}> = () => {
  return {
    view: () =>
      m(
        'a',
        {
          href: '#!',
          'data-target': 'slide-out',
          class: 'sidenav-trigger',
          style: 'position: absolute;margin-left: 10px;top: 75px;',
        },
        m('i.material-icons', 'menu')
      ),
  };
};
