import m, { FactoryComponent } from 'mithril';

export type Item = {
  id: string;
  label: string;
};

export interface MultiSelectAttrs {
  items: Array<Item>;
  selectedIds: Array<string>;
  label?: string;
  placeholder?: string;
  selectAllLabel?: string;
  max?: number;
  search?: boolean;
  selectAll?: boolean;
  listAll?: boolean;
  onchange?: (ids: string[]) => void;
  onselect?: (id: string, label: string) => void;
  onunselect?: (id: string, label: string) => void;
}

export const MultiSelectDropdown: FactoryComponent<MultiSelectAttrs> = () => {
  let dropdownRef: HTMLElement | null = null;
  // let selectedValues: Set<string>;
  let searchQuery = '';
  let dropdownOpen = false;

  const handleDocumentClick = (e: MouseEvent) => {
    if (dropdownRef && !dropdownRef.contains(e.target as Node)) {
      dropdownOpen = false;
    }
  };

  return {
    oncreate() {
      document.addEventListener('click', handleDocumentClick);
    },
    onremove() {
      document.removeEventListener('click', handleDocumentClick);
    },
    view({
      attrs: {
        items,
        selectedIds,
        label,
        placeholder,
        selectAllLabel,
        max,
        search,
        selectAll,
        listAll,
        onchange,
        onselect,
        onunselect,
      },
    }) {
      const selectedValues = new Set(selectedIds);
      const filteredItems = items.filter((item) => item.label.toLowerCase().includes(searchQuery.toLowerCase()));
      const toggleDropdown = () => {
        dropdownOpen = !dropdownOpen;
        console.log(`Dropdown open: ${dropdownOpen}`);
      };

      const handleSelect = (item: Item) => {
        if (selectedValues.has(item.id)) {
          selectedValues.delete(item.id);
          onunselect?.(item.id, item.label);
        } else {
          if (!max || selectedValues.size < max) {
            selectedValues.add(item.id);
            onselect?.(item.id, item.label);
          }
        }
        onchange && onchange(Array.from(selectedValues));
        // m.redraw();
      };

      const handleSelectAll = () => {
        if (selectAll) {
          const allSelected = Array.from(selectedValues).length === items.length;
          if (allSelected) {
            items.forEach((item) => selectedValues.delete(item.id));
          } else {
            items.forEach((item) => selectedValues.add(item.id));
          }
          // m.redraw();
        }
      };

      return m(
        '.multi-select',
        {
          oncreate: (vnode) => {
            dropdownRef = vnode.dom as HTMLElement;
          },
        },
        [
          m(
            '.multi-select-header',
            {
              onclick: toggleDropdown,
              class: dropdownOpen ? 'multi-select-header-active' : '',
            },
            [
              label && m('label', label),
              selectedValues.size === 0
                ? m('span.multi-select-header-placeholder', placeholder || 'Select item(s)')
                : listAll
                ? Array.from(selectedValues).map((id) =>
                    m(
                      'span.multi-select-header-option',
                      {
                        'data-id': id,
                      },
                      items.find((item) => item.id === id)?.label
                    )
                  )
                : m('span.multi-select-header-option', `${selectedValues.size} selected`),
              max ? m('span.multi-select-header-max', `${selectedValues.size}/${max}`) : null,
            ]
          ),
          dropdownOpen &&
            m('.multi-select-options', [
              search &&
                m('input.multi-select-search[type=text][placeholder=Search...]', {
                  oninput: (e: any) => (searchQuery = e.target.value),
                }),
              selectAll &&
                m(
                  '.multi-select-all',
                  {
                    onclick: handleSelectAll,
                  },
                  [
                    m('span.multi-select-option-radio', {
                      class: selectedValues.size === items.length ? 'multi-select-selected' : '',
                    }),
                    m('span.multi-select-option-text', selectAllLabel || 'Select all'),
                  ]
                ),
              filteredItems.map((item) =>
                m(
                  '.multi-select-option',
                  {
                    class: selectedValues.has(item.id) ? 'multi-select-selected' : '',
                    'data-id': item.id,
                    onclick: () => handleSelect(item),
                  },
                  [
                    m('span.multi-select-option-radio', {
                      class: selectedValues.has(item.id) ? 'multi-select-selected' : '',
                    }),
                    m('span.multi-select-option-text', item.label),
                  ]
                )
              ),
            ]),
        ]
      );
    },
  };
};
