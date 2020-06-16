import DOMUtils from './dom_utils';

class TableUI {
	constructor(wrapper, config) {
		if (typeof wrapper === 'string') {
			wrapper = document.querySelector(wrapper);
		}
		if (!(wrapper instanceof HTMLElement)) {
			throw new Error(`Invalid value for wrapper`);
		}
    this.initDefaultValues();
		this.wrapper = wrapper;
    this.config = {...this.config, ...config};
    this.rows = this.config.data;

    this.instanceId = `tb-instance-${TableUI.instanceId++}`;

		this.initializeTable();
  }
  initDefaultValues() {
    this.config = {
      headers: [],
			data: [],
			firstColumnSticky: false,
      showRowNumber: false,
      cellHeight: 40
    }
  }
	initializeTable() {
		let table = DOMUtils.createDiv('table-ui', ['table-ui', this.instanceId]);
		let header = DOMUtils.createDiv('tb-header', ['tb-header']);
		let body = DOMUtils.createDiv('tb-body', ['tb-body']);
		this.initializeTableHeader(header);
		this.initializeTableBody(body);
		table.appendChild(header);
		table.appendChild(body);
    this.wrapper.appendChild(table);
    this.tableHeader = header;
    this.tableBody = body;
    this.initStyles(table);
    this.initEvents(table);
	}
	initializeTableHeader(header) {
    let config = this.config;
		let hRow = `
      <div class="tb-row tb-row--header">
        ${this.config.showRowNumber?`<div class="tb-cell tb-cell--header tb-cell--row-number">#</div>`:``}
        ${this.config.headers
					.map((col, index) => {
            let classList = `tb-cell tb-cell-col${index} tb-cell--header`;
            if(config.stickyColumns.includes(index+1)) {
							classList += ' tb-col--sticky';
						}
						return `<div class="${classList}">${col}</div>`;
					}).join('')}
      </div>
    `;
		header.innerHTML = hRow;
	}
	initializeTableBody(body) {
    let bodyEl = DOMUtils.getRowsHTML(this.rows, 0, this.config);
		body.innerHTML = bodyEl;
  }
  initStyles(table) {
    let styleEle = document.createElement('style');
    styleEle.id = this.instanceId;
    table.prepend(styleEle);
    this.tableStyles = styleEle.sheet;
    this.setDimensions();
  }
  setDimensions() {
    let wrapperWidth = this.wrapper.offsetWidth;
    let eachColumnWidth = parseInt(wrapperWidth/(this.config.headers.length));
    this.removeStyle('.tb-cell', ['width', 'height']);
    this.setStyle('.tb-cell', [['width', eachColumnWidth+'px'], ['height', this.config.cellHeight+'px']]);
    let surrogateHeight = document.createElement('div');
    surrogateHeight.style = 'opacity: 0; position: absolute; width: 1px; height: 4640px; top: 0px;';
    this.tableBody.prepend(surrogateHeight);
  }
  setStyle(selector, props) {
    let styleEle = this.tableStyles;
    let styles = '';
    if(Array.isArray(props)) {
      props.forEach((property)=>{
        styles += `${property[0]}: ${property[1]};`;
      });
      styles = `.${this.instanceId} ${selector} { ${styles} }`;
    }
    styleEle.insertRule(styles);
  }
  removeStyle(selector) {
    let styleEle = this.tableStyles;
    for(let i=0; i<styleEle.cssRules.length; i++) {
      if(styleEle.cssRules[i].selectorText===`.${this.instanceId} ${selector}`) {
        styleEle.deleteRule(i);
        break;
      }
    }
  }
  initEvents() {
    let windowResize = () => this.setDimensions();
    window.addEventListener('resize', windowResize);
    let scrollToTop = () => {
      this.tableBody.scrollIntoView({ block: 'end' });
    }
    document.addEventListener('DOMContentLoaded', scrollToTop);
    this.wrapper.addEventListener('onDestroy', ()=>{
      window.removeEventListener('resize', windowResize);
      document.removeEventListener('DOMContentLoaded', scrollToTop);
    });
  }
  destroyTable() {
    this.wrapper.innerHTML = '';
    let event = new CustomEvent('onDestroy', { bubbles: false });
    this.wrapper.dispatchEvent(event);

  }
}
TableUI.instanceId = 0;

export default TableUI;
