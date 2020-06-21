import DOMUtils from './dom_utils';

class TableUI {
	constructor(wrapper, config) {
    (typeof wrapper === 'string') && (wrapper = document.querySelector(wrapper));
		if (!(wrapper instanceof HTMLElement)) {
			throw new Error(`Invalid value for wrapper`);
		}
    this.initDefaultValues();
		this.wrapper = wrapper;
    this.config = {...this.config, ...config};
    this.allRows = this.config.data;
    this.updateRowChunkRange();

    this.instance = this;
    this.instanceId = `tb-instance-${TableUI.instanceId++}`;

		this.initializeTable();
  }
  initDefaultValues() {
    this.config = {
      headers: [],
			data: [],
			stickyColumns: [],
      showRowNumber: false,
      cellHeight: 40
    }
    this.rowChunkStart = 0;
    this.rowChunkEnd = 0;
    this.rowChunkWindow = 50;
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
    let headerRow = DOMUtils.getHeaderRowHTML(this.config);
		header.innerHTML = headerRow;
	}
	initializeTableBody(body) {
    let { config, allRows, rowChunkEnd } = this;
    let rowsToDisplay = allRows.slice(0, rowChunkEnd);
    let bodyEl = DOMUtils.getRowsHTML(rowsToDisplay, 0, config);
    (rowChunkEnd<allRows.length) && (bodyEl += DOMUtils.getRowSkeletonHTML(this.instance));
		body.innerHTML = bodyEl;
  }
  initStyles(table) {
    let styleEle = document.createElement('style');
    styleEle.id = this.instanceId;
    table.prepend(styleEle);
    this.tableStyles = styleEle.sheet;
    this.setDimensions();
  }
  updateRowChunkRange() {
    this.rowChunkStart += 50;
    this.rowChunkEnd = Math.min(this.rowChunkEnd+this.rowChunkWindow, this.allRows.length);
  }
  setDimensions() {
    let { config, allRows } = this;
    let { CLASS } = DOMUtils;
    let wrapperWidth = this.wrapper.offsetWidth;
    let eachColumnWidth = parseInt(wrapperWidth/(config.headers.length));
    this.removeStyle(`.${CLASS.CELL}`, ['width', 'height']);
    (config.showRowNumber) && (this.setStyle(`.${CLASS.CELL_ROW_NO}`, [['width', '60px']]));
    this.setStyle(`.${CLASS.CELL}`, [['width', eachColumnWidth+'px'], ['height', config.cellHeight+'px']]);
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
  initEvents(table) {
    let config = this.config;
    let windowResize = () => this.setDimensions();
    window.addEventListener('resize', windowResize);
    let scrollToTop = () => {
      this.tableBody.scrollIntoView({ block: 'end' });
    }
    document.addEventListener('DOMContentLoaded', scrollToTop);
    let tableHeight = this.wrapper.offsetHeight, tableScrollHeight = (config.cellHeight*(this.rowChunkEnd+2));
    let scrollEvent = (e) => {
      requestAnimationFrame(()=>{
        let scrollPercent = parseInt((e.target.scrollTop+tableHeight)*100/tableScrollHeight);
        if(scrollPercent>99) {
          this.addMoreRows();
          tableScrollHeight += (config.cellHeight*(this.rowChunkWindow));
        }
      });
    }
    table && table.addEventListener('scroll', scrollEvent);
    this.wrapper.addEventListener('onDestroy', ()=>{
      window.removeEventListener('resize', windowResize);
      document.removeEventListener('DOMContentLoaded', scrollToTop);
      table.removeEventListener('scroll', scrollEvent);
    });
  }
  addMoreRows() {
    setTimeout(()=>{
      let newRows = this.allRows.slice(this.rowChunkEnd, this.rowChunkEnd+this.rowChunkWindow);
      let newNodes = DOMUtils.getRowsHTML(newRows, this.rowChunkEnd, this.config);
      this.updateRowChunkRange();
      (this.rowChunkEnd<this.allRows.length) && (newNodes += DOMUtils.getRowSkeletonHTML(this.instance));
      this.tableBody.innerHTML += newNodes;
    }, 200);
  }
  destroyTable() {
    this.wrapper.innerHTML = '';
    let event = new CustomEvent('onDestroy', { bubbles: false });
    this.wrapper.dispatchEvent(event);

  }
}
TableUI.instanceId = 0;

export default TableUI;
