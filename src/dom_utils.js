const DOMUtils = (() => {
	return {
		createDiv(id, classList) {
			let ele = document.createElement('div');
			id && (ele.id = id);
			Array.isArray(classList) && ele.classList.add(...classList);
			return ele;
		},
		getRowHTML(row, config) {
			if(Array.isArray(row)) {
				return `${row
					.map((col, cIndex) => {
						let classList = `tb-cell tb-cell--col${cIndex}`;
						if(config.stickyColumns.includes(cIndex+1)) {
							classList += ' tb-col--sticky';
						}
						return `<div class="${classList}">${col}</div>`;
					}).slice(0, config.headers.length).join('')}`;
			}
		},
		getRowsHTML(rows, lastRowIndex, config) {
			if(Array.isArray(rows)) {
				return rows.map((row, rIndex) => {
					let rowIndex = rIndex+lastRowIndex;
					return `
						<div class="tb-row" tb-row-index=${rowIndex} style="position:absolute; top: ${config.cellHeight*(rowIndex+1)}px;">
							${config.showRowNumber?`<div class="tb-cell tb-cell--row-number">${rIndex + lastRowIndex + 1}</div>`:``}
							${this.getRowHTML(row, config)}
						</div>
					`;
				}).join('');
			}
		}
	};
})();

export default DOMUtils;
